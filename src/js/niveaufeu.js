import { creerAnimationsDuPerso } from './animations_perso.js';

export default class niveaufeu extends Phaser.Scene {

  constructor() {
    super({ key: 'niveaufeu' });
  }

  init(data) {
    this.playerStartX = data.startX || 768;
    this.playerStartY = data.startY || 736;
  }

  preload() {
    this.load.spritesheet('droite_perso', 'src/assets/playerRight.png', { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('gauche_perso', 'src/assets/playerLeft.png',  { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('haut_perso',   'src/assets/playerUp.png',    { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('bas_perso',    'src/assets/playerDown.png',  { frameWidth: 48, frameHeight: 68 });

    this.load.tilemapTiledJSON('lave', 'src/assets/lave.tmj');
    this.load.image('terrain', 'src/assets/terrain.png');
    this.load.image('top_down_quarter__4_-removebg-preview', 'src/assets/top_down_quarter__4_-removebg-preview.png');
  }

  create() {
    this.sound.stopAll();

    // CARTE
    this.map = this.make.tilemap({ key: 'lave' });
    const terrainTileset = this.map.addTilesetImage('terrain', 'terrain');
    const quarterTileset = this.map.addTilesetImage(
      'top_down_quarter__4_-removebg-preview',
      'top_down_quarter__4_-removebg-preview'
    );
    const tilesets = [terrainTileset, quarterTileset].filter(Boolean);

    if (tilesets.length === 0) {
      console.error('Erreur : aucun tileset charge pour la carte lave');
      return;
    }

    const chargerCalque = (nomDuCalque, profondeur) => {
      if (this.map.getLayerIndex(nomDuCalque) === null) {
        return null;
      }

      const calque = this.map.createLayer(nomDuCalque, tilesets, 0, 0);
      calque.setDepth(profondeur);
      return calque;
    };

    // chargement du calque Calque de Tuiles 1
    this.calqueFond = chargerCalque('Calque de Tuiles 1', 10);

    // chargement du calque Calque de Tuiles 3
    this.calqueHaut = chargerCalque('Calque de Tuiles 3', 30);

    // chargement du calque Calque de Tuiles 4
    this.calqueQuatre = chargerCalque('Calque de Tuiles 4', 40);

    // Collisions
    const setSolidOnLayer = (layer) => {
      if (!layer) return;
      layer.forEachTile((tile) => {
        const prop = tile.properties?.estsolide;
        if (prop === true || prop === 'true') {
          tile.setCollision(true);
        }
      });
    };
    setSolidOnLayer(this.calqueFond);
    setSolidOnLayer(this.calqueHaut);
    setSolidOnLayer(this.calqueQuatre);

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

    // Collisions joueur
    if (this.calqueFond)   this.physics.add.collider(this.player, this.calqueFond);
    if (this.calqueHaut)   this.physics.add.collider(this.player, this.calqueHaut);
    if (this.calqueQuatre) this.physics.add.collider(this.player, this.calqueQuatre);

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
      this.registry.set('resumeKey', 'niveaufeu');
      this.scene.pause('niveaufeu');
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
