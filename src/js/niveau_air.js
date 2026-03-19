import { creerAnimationsDuPerso } from './animations_perso.js';

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
    this.load.image('tile_air', 'src/assets/tile_air.png');
  }

  create() {
    this.sound.stopAll();

    // CARTE
    this.map = this.make.tilemap({ key: 'map_air' });
    const tileset = this.map.addTilesetImage('tile_air', 'tile_air');

    const chargerCalque = (nomDuCalque, profondeur) => {
      if (this.map.getLayerIndex(nomDuCalque) === null) {
        return null;
      }

      const calque = this.map.createLayer(nomDuCalque, tileset, 0, 0);
      calque.setDepth(profondeur);
      return calque;
    };

    // chargement du calque Calque_nuage
    this.calqueFond = chargerCalque('Calque_nuage', 10);

    // chargement du calque calque_surface
    this.calqueSurface = chargerCalque('calque_surface', 30);

    // Collisions sur estsolide
    [this.calqueFond, this.calqueSurface].forEach(layer => {
      if (!layer) return;
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
    this.player.body.setSize(28, 20);
    this.player.body.setOffset(10, 48);
    this.player.setDepth(100);

    if (this.calqueFond) {
      this.physics.add.collider(this.player, this.calqueFond);
    }
    if (this.calqueSurface) {
      this.physics.add.collider(this.player, this.calqueSurface);
    }

    // CAMERA
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // CLAVIER
    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // ANIMATIONS
    creerAnimationsDuPerso(this);
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
