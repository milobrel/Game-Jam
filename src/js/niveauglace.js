export default class niveauglace extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "niveauglace" //  ici on précise le nom de la classe en tant qu'identifiant
    });
  }
  preload() {}

  create() {
    // ajout d'un texte distintcif  du niveau
    this.add.text(400, 100, "Vous êtes dans le niveau de la glace", {
      fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
      fontSize: "22pt"
    });
    this.loadMap(this.glace.json);
   let startX = this.playerStartX;
    let startY = this.playerStartY;
    if (!startX || startX < 0 || startX > this.map.widthInPixels) {
      startX = this.map.widthInPixels / 2;
    }
    if (!startY || startY < 0 || startY > this.map.heightInPixels) {
      startY = this.map.heightInPixels / 2;
    }
    // Trouver une tuile non solide autour du point de départ
    const tileSize = this.map.tileWidth;
    let found = false;
    let px = startX, py = startY;
    for (let r = 0; r < 10 && !found; r++) {
      for (let dx = -r; dx <= r && !found; dx++) {
        for (let dy = -r; dy <= r && !found; dy++) {
          let tx = Math.floor((startX / tileSize) + dx);
          let ty = Math.floor((startY / tileSize) + dy);
          if (tx < 0 || ty < 0 || tx >= this.map.width || ty >= this.map.height) continue;
          let blocked = false;
          [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre].forEach(layer => {
            if (layer) {
              const tile = layer.getTileAt(tx, ty);
              if (tile && (tile.properties?.estsolide === true || tile.properties?.estsolide === "true")) blocked = true;
            }
          });
          if (!blocked) {
            px = tx * tileSize + tileSize / 2;
            py = ty * tileSize + tileSize / 2;
            found = true;
          }
        }
      }
    }
    // Créer le joueur à la position trouvée
    if (this.textures.exists('bas_perso')) {
      this.player = this.physics.add.sprite(px, py, 'bas_perso');
    } else {
      this.player = this.add.rectangle(px, py, 32, 32, 0xff0000);
      this.physics.add.existing(this.player);
    }
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(100); // Toujours au-dessus des calques

    // Collisions joueur <-> calques solides
    if (this.calqueFond) {
      this.physics.add.collider(this.player, this.calqueFond);
    }
    if (this.calqueMilieu) {
      this.physics.add.collider(this.player, this.calqueMilieu);
    }
    if (this.calqueHaut) {
      this.physics.add.collider(this.player, this.calqueHaut);
    }
    
    

    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Configurer la caméra pour suivre le joueur (après création du joueur)
    // Caméra : centrage plus rapide et fluide sur le joueur
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    this.anims.create({
        key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique poru la scene.
        frames: this.anims.generateFrameNumbers("gauche_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
        frameRate: 10, // vitesse de défilement des frames
        repeat: -1 // nombre de répétitions de l'animation. -1 = infini
      }); 
    this.anims.create({
        key: "anim_tourne_droite", // key est le nom de l'animation : doit etre unique poru la scene.
        frames: this.anims.generateFrameNumbers("droite_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
        frameRate: 10, // vitesse de défilement des frames
        repeat: -1 // nombre de répétitions de l'animation. -1 = infini
      }); 
    this.anims.create({
        key: "anim_tourne_haut", // key est le nom de l'animation : doit etre unique poru la scene.
        frames: this.anims.generateFrameNumbers("haut_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
        frameRate: 10, // vitesse de défilement des frames
        repeat: -1 // nombre de répétitions de l'animation. -1 = infini
      }); 
    this.anims.create({
        key: "anim_tourne_bas", // key est le nom de l'animation : doit etre unique poru la scene.
        frames: this.anims.generateFrameNumbers("bas_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
        frameRate: 10, // vitesse de défilement des frames
        repeat: -1 // nombre de répétitions de l'animation. -1 = infini
      }); 
    this.anims.create({
        key: "anim_face",
        frames: [{ key: "bas_perso", frame: 0 }],
        frameRate: 20
      }); 
  }

  update() {
    if (this.clavier.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("anim_tourne_gauche", true);
    } else if (this.clavier.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("anim_tourne_droite", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("anim_face");
    }
    if (this.clavier.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}