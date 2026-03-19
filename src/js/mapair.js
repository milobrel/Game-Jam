export default class mapair extends Phaser.Scene {
  constructor() {
    super({ key: 'mapair' });
  }

  preload() {
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
    this.load.audio('stayready', 'src/assets/stayready.mp3');
    this.load.tilemapTiledJSON('carte_air', 'src/assets/map_air.tmj');
    this.load.image('First Asset pack', 'src/assets/First Asset pack.png');
    this.load.image('TilesA2', 'src/assets/TilesA2.png');
    this.load.image('terrain', 'src/assets/terrain.png');
  }

  create(data) {
    const map = this.make.tilemap({ key: 'carte_air' });
    const tileset1 = map.addTilesetImage('First Asset pack', 'First Asset pack');
    const tileset2 = map.addTilesetImage('TilesA2', 'TilesA2');
    const tileset3 = map.addTilesetImage('terrain', 'terrain');
    const tilesets = [tileset1, tileset2, tileset3];

    let calque = null;
    if (map.getLayerIndex('Calque de Tuiles 1') !== null) {
      calque = map.createLayer('Calque de Tuiles 1', tilesets, 0, 0);
      calque.setCollisionByProperty({ estSolide: true });
    }

    const startX = data.startX || 120;
    const startY = data.startY || 320;
    this.player = this.physics.add.sprite(startX, startY, 'bas_perso');
    this.player.setScale(0.6);
    this.player.setCollideWorldBounds(true);

    if (calque) {
      this.physics.add.collider(this.player, calque);
    }

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setZoom(3);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.sound.play('stayready', { loop: false });

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
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'mapair');
      this.scene.pause('mapair');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    const speed = 100;
    this.player.setVelocity(0);
    let isMoving = false;

    if (this.cursors.right.isDown) {
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
  }
}

