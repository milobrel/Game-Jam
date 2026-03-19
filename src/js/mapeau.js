import { creerAnimationsDuPerso } from './animations_perso.js';

export default class mapeau extends Phaser.Scene {
  constructor() {
    super({ key: 'mapeau' });
  }

  init(data) {
    this.playerStartX = data.startX || 100;
    this.playerStartY = data.startY || 450;
    this.returnMap = data.returnMap || 'mapcentral';
    this.returnX = data.returnX || 100;
    this.returnY = data.returnY || 450;
    this.teleportEnCours = false;
    this.timerTeleportRetourEau = null;
  }

  preload() {
    this.load.image('Water-themed adventure level layout', 'src/assets/Water-themed adventure level layout.png');
    this.load.tilemapTiledJSON('carte_eau', 'src/assets/map_eau4.tmj');

    this.load.spritesheet('droite_perso', 'src/assets/playerRight.png', {
      frameWidth: 48,
      frameHeight: 68
    });
    this.load.spritesheet('gauche_perso', 'src/assets/playerLeft.png', {
      frameWidth: 48,
      frameHeight: 68
    });
    this.load.spritesheet('haut_perso', 'src/assets/playerUp.png', {
      frameWidth: 48,
      frameHeight: 68
    });
    this.load.spritesheet('bas_perso', 'src/assets/playerDown.png', {
      frameWidth: 48,
      frameHeight: 68
    });

    this.load.audio('shatta', 'src/assets/shatta.mp3');
    this.load.audio('musique', 'src/assets/theme.wav');
    
  }

  create() {
    this.sound.stopAll();
    const musique = this.sound.get('musique');
    if (musique) {
        musique.stop();
    }
    // CARTE
    this.map = this.make.tilemap({ key: 'carte_eau' });
    const tileset = this.map.addTilesetImage(
      'Water-themed adventure level layout',
      'Water-themed adventure level layout'
    );

    this.calqueEau = this.map.createLayer('calques eau', tileset, 0, 0);
    this.calqueEau.setDepth(30);

    this.calqueEau.forEachTile((tile) => {
      const prop = tile.properties?.estSolide;
      if (prop === true || prop === 'true') {
        tile.setCollision(true);
      }
    });

    // MONDE
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // JOUEUR
    this.player = this.physics.add.sprite(this.playerStartX, this.playerStartY, 'bas_perso');
    this.player.setScale(0.55);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 20);
    this.player.body.setOffset(10, 48);
    this.player.setDepth(100);

    this.physics.add.collider(this.player, this.calqueEau);
    this.creerZoneRetourEau();

    // CAMERA
    this.cameras.main.setZoom(1.6);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // CLAVIER
    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // MUSIQUE
    if (!this.sound.get('shatta')?.isPlaying) {
      this.sound.play('shatta', { loop: true });
    }

    // ANIMATIONS
    creerAnimationsDuPerso(this);
  }

  creerZoneRetourEau() {
    this.zoneRetourEau = this.add.zone(640, 288, 32, 32);
    this.physics.add.existing(this.zoneRetourEau, true);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'mapeau');
      this.scene.pause('mapeau');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    this.handleZoneRetourEau();

    const speed = 100;
    this.player.setVelocity(0);
    let moving = false;

    if (this.clavier.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('anim_tourne_droite', true);
      moving = true;
    }
    else if (this.clavier.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('anim_tourne_gauche', true);
      moving = true;
    }
    else if (this.clavier.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      moving = true;
    }
    else if (this.clavier.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_bas', true);
      moving = true;
    }

    if (!moving) {
      this.player.anims.play('anim_face');
    }
  }

  handleZoneRetourEau() {
    if (!this.zoneRetourEau || this.teleportEnCours) {
      return;
    }

    const estDansZone = this.physics.overlap(this.player, this.zoneRetourEau);

    if (estDansZone) {
      if (!this.timerTeleportRetourEau) {
        this.timerTeleportRetourEau = this.time.delayedCall(3000, () => {
          this.teleportEnCours = true;
          this.scene.start('selection', {
            map: this.returnMap,
            startX: this.returnX,
            startY: this.returnY
          });
        });
      }
    } else if (this.timerTeleportRetourEau) {
      this.timerTeleportRetourEau.remove();
      this.timerTeleportRetourEau = null;
    }
  }
}
