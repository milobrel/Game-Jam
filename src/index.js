// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/
import accueil from "./js/accueil.js";
import selection from "./js/selection.js";
import niveau_air from "./js/niveau_air.js";
import niveau1 from "./js/niveauglace.js";
import mapeau from "./js/mapeau.js";
import interieur from "./js/interieur.js";

var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [accueil, selection, niveau_air, niveau1, mapeau, interieur]
};

var game = new Phaser.Game(config);