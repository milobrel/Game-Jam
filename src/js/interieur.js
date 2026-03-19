export default class interieur extends Phaser.Scene {
  constructor() {
    super({ key: 'interieur' });
  }

  preload() {
    // On charge les images et la map.
    // ATTENTION : on enlève "src/" car tes dossiers sont à la racine
    this.load.image('tiles_interieur', 'src/assets/interieur.png');
    this.load.tilemapTiledJSON('carte_interieur', 'src/assets/map.tmj');
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
}

  create(data) {
    // Création de la carte
    const map = this.make.tilemap({ key: 'carte_interieur' });

    // Ajout du jeu de tuiles (le nom doit correspondre au champ "name" dans la tileset)
    const tileset = map.addTilesetImage('interieur.png', 'tiles_interieur');

    // Calque solide principal
    const calque_sol = map.createLayer('calques interieur', tileset, 0, 0);
    calque_sol.setCollisionByProperty({ estsolide: true });

    // Position de départ
    const startX = data.startX || 100;
    const startY = data.startY || 450;
    this.player = this.physics.add.sprite(startX, startY, 'bas_perso');
    this.player.setScale(0.6);
    this.player.setCollideWorldBounds(true);

    // Collisions
    this.physics.add.collider(this.player, calque_sol);

    // Caméra
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Créer les animations directionnelles
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

  update() {
    const speed = 120;
    this.player.setVelocity(0);
    let isMoving = false;

    // Vérifier les mouvements diagonaux et cardinaux
    if (this.cursors.right.isDown && this.cursors.up.isDown) {
      // Diagonal haut-droite
      this.player.setVelocityX(speed);
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      isMoving = true;
    }
    else if (this.cursors.right.isDown && this.cursors.down.isDown) {
      // Diagonal bas-droite
      this.player.setVelocityX(speed);
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_droite', true);
      isMoving = true;
    }
    else if (this.cursors.left.isDown && this.cursors.up.isDown) {
      // Diagonal haut-gauche
      this.player.setVelocityX(-speed);
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      isMoving = true;
    }
    else if (this.cursors.left.isDown && this.cursors.down.isDown) {
      // Diagonal bas-gauche
      this.player.setVelocityX(-speed);
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_gauche', true);
      isMoving = true;
    }
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('anim_tourne_droite', true);
      isMoving = true;
    }
    else if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('anim_tourne_gauche', true);
      isMoving = true;
    }
    else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      isMoving = true;
    }
    else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_bas', true);
      isMoving = true;
    }

    if (!isMoving) {
      this.player.anims.play('anim_face');
    }

    // Quitter l'intérieur en appuyant sur E
    if (Phaser.Input.Keyboard.JustDown(this.toucheE)) {
      this.scene.start('selection', { map: 'mapcentral', startX: 340, startY: 360 });
    }
  }
}
