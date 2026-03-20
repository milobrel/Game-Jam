import { creerAnimationsDuPerso } from './animations_perso.js';

export default class niveau_air extends Phaser.Scene {

  constructor() {
    super({ key: 'niveau_air' });
  }

  init(data) {
    this.playerStartX = data.startX || 100;
    this.playerStartY = data.startY || 300;
    this.returnMap = data.returnMap || 'mapcentral';
    this.returnX = data.returnX || 100;
    this.returnY = data.returnY || 450;
    this.teleportEnCours = false;
    this.artefactAirEnCours = false;
    this.artefactAirActif = false;
    this.tempsRestantAir = 20;
  }

  preload() {
    this.load.spritesheet('droite_perso', 'src/assets/images/playerRight.png', { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('gauche_perso', 'src/assets/images/playerLeft.png',  { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('haut_perso',   'src/assets/images/playerUp.png',    { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('bas_perso',    'src/assets/images/playerDown.png',  { frameWidth: 48, frameHeight: 68 });

    this.load.tilemapTiledJSON('map_air', 'src/assets/map_air.tmj');
    this.load.image('tile_air', 'src/assets/tiles/tile_air.png');
    this.load.image('airsacree', 'src/assets/images/airsacree.png');
    this.load.audio('stayready', 'src/assets/songs/stayready.mp3');
    this.load.audio('musique', 'src/assets/songs/theme.wav');
    
  }

  create() {
    // Cette partie lance l'ambiance sonore du niveau air.
    this.initialiserAudioAir();

    // Cette partie construit la carte, ses calques et leurs collisions.
    this.creerCarteAir();

    // Cette partie installe le joueur dans le niveau.
    this.creerJoueurAir();

    // Cette partie ajoute les éléments de gameplay du niveau.
    this.creerZoneRetourAir();
    this.creerZonesVentAir();
    this.creerTimerAir();
    this.creerObjetSacreAir();

    // Cette partie règle la caméra pour suivre le joueur.
    this.cameras.main.setZoom(1.5);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // Cette partie prépare les touches utilisées dans le niveau.
    this.initialiserCommandesAir();

    // Cette partie active les animations du personnage.
    creerAnimationsDuPerso(this);

    // Cette partie évite de ramasser l'artefact dès l'entrée dans la scène.
    this.activerArtefactAirAvecDelai();
  }

  initialiserAudioAir() {
    const musique = this.sound.get('musique');
    if (musique?.isPlaying) {
      musique.pause();
    }

    this.son_musique = this.sound.get('stayready') || this.sound.add('stayready');
    if (!this.son_musique.isPlaying) {
      this.son_musique.play();
    }
  }

  creerCarteAir() {
    this.map = this.make.tilemap({ key: 'map_air' });
    const tileset = this.map.addTilesetImage('ChatGPT Image Mar 16, 2026, 09_07_56 PM', 'tile_air');

    const chargerCalque = (nomDuCalque, profondeur) => {
      if (this.map.getLayerIndex(nomDuCalque) === null) {
        return null;
      }

      const calque = this.map.createLayer(nomDuCalque, tileset, 0, 0);
      calque.setDepth(profondeur);
      return calque;
    };

    this.calqueFond = chargerCalque('Calque_nuage', 10);
    this.calqueSurface = chargerCalque('calque_surface', 30);

    [this.calqueFond, this.calqueSurface].forEach((layer) => {
      if (!layer) {
        return;
      }

      layer.forEachTile((tile) => {
        const prop = tile.properties?.estsolide;
        if (prop === true || prop === 'true') {
          tile.setCollision(true);
        }
      });
    });

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  creerJoueurAir() {
    this.player = this.physics.add.sprite(this.playerStartX, this.playerStartY, 'bas_perso');
    this.player.setScale(0.6);
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
  }

  initialiserCommandesAir() {
    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }

  activerArtefactAirAvecDelai() {
    this.time.delayedCall(500, () => {
      this.artefactAirActif = true;
    });
  }

  creerZoneRetourAir() {
    this.zoneRetourAir = this.add.zone(this.playerStartX, this.playerStartY, 48, 48);
    this.physics.add.existing(this.zoneRetourAir, true);
  }

  creerZonesVentAir() {
    this.positionsVentAir = [
      { x: 384, y: 384, width: 320, height: 160, xVent: true, yVent: false },
      { x: 896, y: 256, width: 288, height: 160, xVent: true, yVent: false },
      { x: 1280, y: 736, width: 320, height: 160, xVent: true, yVent: false },
      { x: 1664, y: 544, width: 224, height: 320, xVent: false, yVent: true },
      { x: 1952, y: 320, width: 224, height: 352, xVent: false, yVent: true },
      { x: 2240, y: 704, width: 288, height: 160, xVent: true, yVent: false }
    ];

    this.zonesVentAir = Array.from({ length: 3 }, () => {
      const zone = this.add.zone(0, 0, 0, 0);
      this.physics.add.existing(zone, true);
      zone.directionVent = 'right';
      zone.forceVent = 360;
      zone.xVent = true;
      zone.yVent = false;
      return zone;
    });

    this.repositionnerZonesVentAir();

    this.timerDirectionVentAir = this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        this.repositionnerZonesVentAir();
      }
    });
  }

  tirerDirectionVentAuHasard(xVent, yVent) {
    const directionsPossibles = [];

    if (xVent) {
      directionsPossibles.push('right', 'left');
    }
    if (yVent) {
      directionsPossibles.push('up', 'down');
    }

    if (directionsPossibles.length === 0) {
      return 'right';
    }

    return Phaser.Utils.Array.GetRandom(directionsPossibles);
  }

  tirerForceVentAuHasard() {
    const forcesPossibles = [140, 220, 360, 520];
    return Phaser.Utils.Array.GetRandom(forcesPossibles);
  }

  repositionnerZonesVentAir() {
    if (!this.zonesVentAir || !this.positionsVentAir) {
      return;
    }

    const positionsDisponibles = Phaser.Utils.Array.Shuffle([...this.positionsVentAir]).slice(0, this.zonesVentAir.length);

    this.zonesVentAir.forEach((zone, index) => {
      const position = positionsDisponibles[index];

      if (!position) {
        return;
      }

      zone.x = position.x;
      zone.y = position.y;
      zone.width = position.width;
      zone.height = position.height;
      zone.body.setSize(position.width, position.height, true);
      zone.body.updateFromGameObject();
      zone.xVent = position.xVent;
      zone.yVent = position.yVent;
      zone.forceVent = this.tirerForceVentAuHasard();
      zone.directionVent = this.tirerDirectionVentAuHasard(position.xVent, position.yVent);
    });
  }

  creerTimerAir() {
    this.fondTimerAir = this.add.rectangle(120, 42, 220, 56, 0x081a33, 0.95)
      .setOrigin(0.5)
      .setStrokeStyle(3, 0xaad8ff)
      .setScrollFactor(0)
      .setDepth(2000);

    this.texteTimerAir = this.add.text(120, 42, `Temps : ${this.tempsRestantAir}`, {
      font: 'bold 28px Arial',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    this.children.bringToTop(this.fondTimerAir);
    this.children.bringToTop(this.texteTimerAir);

    this.timerAir = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.tempsRestantAir--;

        if (this.texteTimerAir) {
          this.texteTimerAir.setText(`Temps : ${Math.max(this.tempsRestantAir, 0)}`);
        }

        if (this.tempsRestantAir <= 0) {
          this.respawnJoueurAir();
        }
      }
    });
  }

  respawnJoueurAir() {
    this.player.setPosition(this.playerStartX, this.playerStartY);
    this.player.body.reset(this.playerStartX, this.playerStartY);
    this.player.setVelocity(0);
    this.player.anims.play('anim_face');
    this.tempsRestantAir = 20;

    if (this.texteTimerAir) {
      this.texteTimerAir.setText(`Temps : ${this.tempsRestantAir}`);
    }
  }

  creerObjetSacreAir() {
    this.artefactAir = this.physics.add.sprite(384, 736, 'airsacree');
    this.artefactAir.setOrigin(0.5, 0);
    this.artefactAir.setDepth(300);
    this.artefactAir.setScale(0.16);
    this.artefactAir.setTint(0xdff6ff);
    this.artefactAir.body.allowGravity = false;
    this.artefactAir.setImmovable(true);

    if (this.registry.get('artefactAirRecupere') !== true) {
      this.physics.add.overlap(this.player, this.artefactAir, this.recupererArtefactAir, null, this);
    }
  }

  recupererArtefactAir(player, artefact) {
    if (!this.artefactAirActif || !artefact || !artefact.active || this.artefactAirEnCours) {
      return;
    }

    this.artefactAirEnCours = true;
    this.teleportEnCours = true;
    this.registry.set('artefactAirRecupere', true);
    this.registry.set('artefactAirAnnonceParMerlin', false);
    artefact.destroy();

    this.player.setVelocity(0);
    this.player.anims.play('anim_face');

    const centreX = this.cameras.main.width / 2;
    const centreY = this.cameras.main.height / 2;
    const fondMessage = this.add.rectangle(centreX, centreY, 420, 90, 0x21446b, 0.95)
      .setStrokeStyle(3, 0xf4fbff)
      .setScrollFactor(0)
      .setDepth(1000);
    const message = this.add.text(
      centreX,
      centreY,
      'Vous avez trouver\nla perle de l air',
      {
        font: '22px Arial',
        fill: '#f4fbff',
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    this.time.delayedCall(2000, () => {
      if (fondMessage.active) {
        fondMessage.destroy();
      }
      if (message.active) {
        message.destroy();
      }

      if (this.son_musique?.isPlaying) {
        this.son_musique.stop();
      }

      this.scene.start('selection', {
        map: 'mapcentral',
        startX: 312,
        startY: 372
      });
    });
  }

  obtenirZoneVentActive() {
    if (!this.zonesVentAir) {
      return null;
    }

    return this.zonesVentAir.find((zone) => this.physics.overlap(this.player, zone)) || null;
  }

  lireBlocageVent(zoneVent) {
    return {
      horizontal: zoneVent && (zoneVent.directionVent === 'right' || zoneVent.directionVent === 'left'),
      vertical: zoneVent && (zoneVent.directionVent === 'up' || zoneVent.directionVent === 'down')
    };
  }

  appliquerControlesAir(speed, blocageVent) {
    let moving = false;

    if (!blocageVent.horizontal && this.clavier.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('anim_tourne_droite', true);
      moving = true;
    } else if (!blocageVent.horizontal && this.clavier.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('anim_tourne_gauche', true);
      moving = true;
    }

    if (!blocageVent.vertical && this.clavier.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      moving = true;
    } else if (!blocageVent.vertical && this.clavier.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_bas', true);
      moving = true;
    }

    return moving;
  }

  appliquerVentSurJoueur(zoneVent, moving) {
    if (!zoneVent) {
      return moving;
    }

    const forceVent = zoneVent.forceVent || 360;

    if (zoneVent.directionVent === 'right') {
      this.player.setVelocityX(forceVent);
      if (!moving) {
        this.player.anims.play('anim_tourne_droite', true);
      }
    } else if (zoneVent.directionVent === 'left') {
      this.player.setVelocityX(-forceVent);
      if (!moving) {
        this.player.anims.play('anim_tourne_gauche', true);
      }
    } else if (zoneVent.directionVent === 'up') {
      this.player.setVelocityY(-forceVent);
      if (!moving) {
        this.player.anims.play('anim_tourne_haut', true);
      }
    } else if (zoneVent.directionVent === 'down') {
      this.player.setVelocityY(forceVent);
      if (!moving) {
        this.player.anims.play('anim_tourne_bas', true);
      }
    }

    return true;
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'niveau_air');
      this.scene.pause('niveau_air');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    this.handleRetourAir();

    const speed = 100;
    this.player.setVelocity(0);
    const zoneVentActive = this.obtenirZoneVentActive();
    const blocageVent = this.lireBlocageVent(zoneVentActive);
    let moving = this.appliquerControlesAir(speed, blocageVent);
    moving = this.appliquerVentSurJoueur(zoneVentActive, moving);

    if (!moving) {
      this.player.anims.play('anim_face');
    }
  }

  handleRetourAir() {
    if (!this.zoneRetourAir || this.teleportEnCours) {
      return;
    }

    const estDansZoneRetour = this.physics.overlap(this.player, this.zoneRetourAir);

    if (estDansZoneRetour && Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
      this.teleportEnCours = true;
      this.time.delayedCall(150, () => {
        if (this.son_musique?.isPlaying) {
          this.son_musique.stop();
        }

        this.scene.start('selection', {
          map: this.returnMap,
          startX: this.returnX,
          startY: this.returnY
        });
      });
    }
  }
}
