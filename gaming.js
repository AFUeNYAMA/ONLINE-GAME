"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupProfileProgress() {
    const form = document.querySelector("form");
    const text = document.querySelector("#progression-texte");
    const bar = document.querySelector("#progression-barre");

    if (!form || !text || !bar) {
        return;
    }

    const requiredFields = [...form.querySelectorAll(":required")];

    function updateProgress() {
        const completed = requiredFields.filter((field) => field.checkValidity()).length;
        const percentage = Math.round((completed / requiredFields.length) * 100);

        text.textContent = `${percentage} % terminé`;
        bar.style.width = `${percentage}%`;
        bar.setAttribute("role", "progressbar");
        bar.setAttribute("aria-label", "Progression des champs obligatoires");
        bar.setAttribute("aria-valuemin", "0");
        bar.setAttribute("aria-valuemax", "100");
        bar.setAttribute("aria-valuenow", String(percentage));
    }

    form.addEventListener("input", updateProgress);
    form.addEventListener("change", updateProgress);
    updateProgress();
}

function setupFeaturedCarousel() {
    const carousel = document.querySelector(".diaporama");
    const playButton = document.querySelector("#diapo-lecture");
    const status = document.querySelector("#diapo-etat");

    if (!carousel || !playButton || !status) {
        return;
    }

    const slides = [...carousel.querySelectorAll(".image-diapo")];
    const radios = [...carousel.querySelectorAll('input[name="diapo"]')];

    if (slides.length === 0 || slides.length !== radios.length) {
        console.error("Le diaporama doit avoir une image associée à chaque commande.");
        return;
    }

    let timer = 0;
    let isPlaying = false;
    let autoplayRequested = !prefersReducedMotion;

    function selectedIndex() {
        return Math.max(0, radios.findIndex((radio) => radio.checked));
    }

    function updateStatus() {
        const index = selectedIndex();
        const title = slides[index].querySelector(".legende")?.textContent.trim();
        status.textContent = `${title || "Jeu"} — ${index + 1} sur ${slides.length}`;
    }

    function showSlide(index) {
        const nextIndex = (index + slides.length) % slides.length;
        radios[nextIndex].checked = true;
        radios[nextIndex].dispatchEvent(new Event("change", { bubbles: true }));
        updateStatus();
    }

    function stopAutoplay() {
        window.clearInterval(timer);
        timer = 0;
        isPlaying = false;
        playButton.textContent = "Lancer le diaporama";
        playButton.setAttribute("aria-pressed", "false");
    }

    function startAutoplay() {
        autoplayRequested = true;

        if (prefersReducedMotion || document.hidden || isPlaying) {
            return;
        }

        isPlaying = true;
        playButton.textContent = "Mettre en pause";
        playButton.setAttribute("aria-pressed", "true");
        timer = window.setInterval(() => showSlide(selectedIndex() + 1), 5000);
    }

    function pauseAutoplay() {
        autoplayRequested = false;
        stopAutoplay();
    }

    carousel.addEventListener("click", (event) => {
        const directionButton = event.target.closest("[data-diapo-direction]");

        if (directionButton) {
            pauseAutoplay();
            showSlide(selectedIndex() + Number(directionButton.dataset.diapoDirection));
        }
    });

    carousel.addEventListener("change", (event) => {
        if (event.target.matches('input[name="diapo"]')) {
            updateStatus();
        }
    });

    carousel.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
        }

        event.preventDefault();
        pauseAutoplay();
        showSlide(selectedIndex() + (event.key === "ArrowRight" ? 1 : -1));
    });

    playButton.addEventListener("click", () => {
        if (isPlaying) {
            pauseAutoplay();
        } else {
            startAutoplay();
        }
    });

    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("mouseleave", () => {
        if (autoplayRequested) {
            startAutoplay();
        }
    });
    carousel.addEventListener("focusout", (event) => {
        if (autoplayRequested && !carousel.contains(event.relatedTarget)) {
            startAutoplay();
        }
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAutoplay();
        } else if (autoplayRequested) {
            startAutoplay();
        }
    });

    updateStatus();

    if (prefersReducedMotion) {
        playButton.disabled = true;
        playButton.textContent = "Diaporama désactivé";
        playButton.setAttribute("aria-label", "Diaporama désactivé selon vos préférences de mouvement");
    } else {
        startAutoplay();
    }
}

function setupScrollReveals() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        return;
    }

    const sections = document.querySelectorAll(".ambiance, .sites, .tableau-sites, .galerie");

    if (sections.length === 0) {
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    sections.forEach((section) => {
        section.classList.add("reveal-on-scroll");
        observer.observe(section);
    });
}

function setupMediaPlayback() {
    const mediaElements = [...document.querySelectorAll("video, audio")];

    mediaElements.forEach((media) => {
        media.addEventListener("play", () => {
            mediaElements.forEach((otherMedia) => {
                if (otherMedia !== media && !otherMedia.paused) {
                    otherMedia.pause();
                }
            });
        });
    });
}

setupProfileProgress();
setupFeaturedCarousel();
setupScrollReveals();
setupMediaPlayback();
