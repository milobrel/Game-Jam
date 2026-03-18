// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/
import selection from "./js/selection.js";
import niveau1 from "./js/niveauglace.js"; 

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
  scene: [selection, niveau1] // ✅ corrigé
};

var game = new Phaser.Game(config);