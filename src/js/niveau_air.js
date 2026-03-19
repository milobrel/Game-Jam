export default class niveau_air extends Phaser.Scene {

  constructor() {
    super({ key: 'niveau_air' });
  }

  init(data) {
    this.playerStartX = data.startX || 100;
    this.playerStartY = data.startY || 300;
  }

  preload() {
    this.load.spritesheet('droite_perso', 'src/assets/playerRight.png', { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('gauche_perso', 'src/assets/playerLeft.png',  { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('haut_perso',   'src/assets/playerUp.png',    { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('bas_perso',    'src/assets/playerDown.png',  { frameWidth: 48, frameHeight: 68 });

    this.load.tilemapTiledJSON('map_air', 'src/assets/map_air.tmj');
    this.load.image('ChatGPT Image Mar 16, 2026, 09_07_56 PM', 'src/assets/ChatGPT Image Mar 17, 2026, 03_03_44 PM.png');
  }

  create() {
    // CARTE
    this.map = this.make.tilemap({ key: 'map_air' });
    const tileset = this.map.addTilesetImage('ChatGPT Image Mar 16, 2026, 09_07_56 PM', 'ChatGPT Image Mar 16, 2026, 09_07_56 PM');

    this.calqueFond = this.map.createLayer('Calque_nuage', tileset, 0, 0);
    this.calqueFond.setDepth(10);

    this.calqueSurface = this.map.createLayer('calque_surface', tileset, 0, 0);
    this.calqueSurface.setDepth(30);

    // Collisions sur estsolide
    [this.calqueFond, this.calqueSurface].forEach(layer => {
      layer.forEachTile(tile => {
        const prop = tile.properties?.estsolide;
        if (prop === true || prop === 'true') tile.setCollision(true);
      });
    });

    // Limites monde
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // JOUEUR
    this.player = this.physics.add.sprite(this.playerStartX, this.playerStartY, 'bas_perso');
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(100);

    this.physics.add.collider(this.player, this.calqueFond);
    this.physics.add.collider(this.player, this.calqueSurface);

    // CAMERA
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // CLAVIER
    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // ANIMATIONS
    this.anims.create({ key: 'anim_tourne_droite', frames: this.anims.generateFrameNumbers('droite_perso', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'anim_tourne_gauche', frames: this.anims.generateFrameNumbers('gauche_perso', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'anim_tourne_haut',   frames: this.anims.generateFrameNumbers('haut_perso',   { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'anim_tourne_bas',    frames: this.anims.generateFrameNumbers('bas_perso',    { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'anim_face', frames: [{ key: 'bas_perso', frame: 0 }], frameRate: 20 });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'niveau_air');
      this.scene.pause('niveau_air');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    const speed = 100;
    this.player.setVelocity(0);
    let moving = false;

    if (this.clavier.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('anim_tourne_droite', true);
      moving = true;
    } else if (this.clavier.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('anim_tourne_gauche', true);
      moving = true;
    } else if (this.clavier.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      moving = true;
    } else if (this.clavier.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_bas', true);
      moving = true;
    }

    if (!moving) this.player.anims.play('anim_face');
  }
}
