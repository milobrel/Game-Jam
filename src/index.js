// chargement des librairies

/***********************************************************************/
/** CONFIGURATION GLOBALE DU JEU ET LANCEMENT 
/***********************************************************************/
import selection from "src/js/selection.js"; 
var son_musique;
var player;
var clavier;

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// création du jeu
new Phaser.Game(config);

/***********************************************************************/
/** PRELOAD */
/***********************************************************************/
function preload() {
  this.load.spritesheet("droite_perso", "src/assets/playerRight.png", {
    frameWidth: 48,
    frameHeight: 68
  });

  this.load.spritesheet("gauche_perso", "src/assets/playerLeft.png", {
    frameWidth: 48,
    frameHeight: 68
  });

  this.load.spritesheet("haut_perso", "src/assets/playerUp.png", {
    frameWidth: 48,
    frameHeight: 68
  });

  this.load.spritesheet("bas_perso", "src/assets/playerDown.png", {
    frameWidth: 48,
    frameHeight: 68
  });

  this.load.audio("musique", "src/assets/theme.wav");
}

/***********************************************************************/
/** CREATE */
/***********************************************************************/
function create() {
  // musique
  son_musique = this.sound.add("musique");
  son_musique.play();

  // joueur
  player = this.physics.add.sprite(100, 450, "bas_perso");
  player.setCollideWorldBounds(true);

  // clavier
  clavier = this.input.keyboard.createCursorKeys();

  // animations
  this.anims.create({
    key: "anim_tourne_gauche",
    frames: this.anims.generateFrameNumbers("gauche_perso", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "anim_tourne_droite",
    frames: this.anims.generateFrameNumbers("droite_perso", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "anim_tourne_haut",
    frames: this.anims.generateFrameNumbers("haut_perso", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "anim_tourne_bas",
    frames: this.anims.generateFrameNumbers("bas_perso", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "anim_face",
    frames: [{ key: "bas_perso", frame: 0 }],
    frameRate: 20
  });
}

/***********************************************************************/
/** UPDATE */
/***********************************************************************/
function update() {
  // reset mouvement
  player.setVelocity(0);

  if (clavier.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("anim_tourne_droite", true);
  } 
  else if (clavier.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("anim_tourne_gauche", true);
  } 
  else if (clavier.up.isDown) {
    player.setVelocityY(-160);
    player.anims.play("anim_tourne_haut", true);
  } 
  else if (clavier.down.isDown) {
    player.setVelocityY(160);
    player.anims.play("anim_tourne_bas", true);
  } 
  else {
    player.anims.play("anim_face");
  }
}