const diaporama = document.querySelector('.diaporama');

if (diaporama) {
    const liens = [...diaporama.querySelectorAll('.diaporama__lien')];
    const precedent = diaporama.querySelector('.diaporama__bouton--precedent');
    const suivant = diaporama.querySelector('.diaporama__bouton--suivant');
    const indicateurs = diaporama.querySelector('.diaporama__indicateurs');
    let indexActif = 0;
    let minuterie;

    liens.forEach((lien, index) => {
        const indicateur = document.createElement('button');
        indicateur.type = 'button';
        indicateur.className = 'diaporama__indicateur';
        indicateur.setAttribute('aria-label', `Afficher l'image ${index + 1}`);
        indicateur.addEventListener('click', () => afficher(index));
        indicateurs.appendChild(indicateur);
    });

    const boutons = [...indicateurs.children];

    function afficher(index) {
        indexActif = (index + liens.length) % liens.length;

        liens.forEach((lien, position) => {
            lien.classList.toggle('diaporama__lien--active', position === indexActif);
        });
        boutons.forEach((bouton, position) => {
            const actif = position === indexActif;
            bouton.classList.toggle('diaporama__indicateur--active', actif);
            bouton.setAttribute('aria-current', actif ? 'true' : 'false');
        });
    }

    function lancerDefilement() {
        clearInterval(minuterie);
        minuterie = setInterval(() => afficher(indexActif + 1), 5000);
    }

    function arreterDefilement() {
        clearInterval(minuterie);
    }

    precedent.addEventListener('click', () => {
        afficher(indexActif - 1);
        lancerDefilement();
    });
    suivant.addEventListener('click', () => {
        afficher(indexActif + 1);
        lancerDefilement();
    });
    diaporama.addEventListener('mouseenter', arreterDefilement);
    diaporama.addEventListener('mouseleave', lancerDefilement);
    diaporama.addEventListener('focusin', arreterDefilement);
    diaporama.addEventListener('focusout', lancerDefilement);

    afficher(0);
    lancerDefilement();
}

const audioMusique = document.querySelector('#audio-musique');
const videoPrincipale = document.querySelector('#video-principale');
const sequenceMusique = 'music';
let saisieMusique = '';

async function lancerMusique() {
    if (!audioMusique || !videoPrincipale) {
        console.error('Les éléments audio ou vidéo nécessaires sont introuvables.');
        return;
    }

    audioMusique.currentTime = 0;
    videoPrincipale.currentTime = 0;

    try {
        await Promise.all([
            videoPrincipale.play(),
            audioMusique.play()
        ]);
    } catch (erreur) {
        console.error('Impossible de lancer la vidéo et la musique.', erreur);
    }
}

document.addEventListener('keydown', (evenement) => {
    if (evenement.key.length !== 1 || !/[a-z]/i.test(evenement.key)) {
        return;
    }

    saisieMusique = (saisieMusique + evenement.key.toLowerCase()).slice(-sequenceMusique.length);
    if (saisieMusique === sequenceMusique) {
        saisieMusique = '';
        lancerMusique();
    }
});
