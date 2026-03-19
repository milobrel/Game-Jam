import { creerAnimationsDuPerso } from './animations_perso.js';

export default class niveaufeu extends Phaser.Scene {

  constructor() {
    super({ key: 'niveaufeu' });
  }

  init(data) {
    this.playerStartX = data.startX || 768;
    this.playerStartY = data.startY || 736;
    this.returnMap = data.returnMap || 'mapcentral';
    this.returnX = data.returnX || 100;
    this.returnY = data.returnY || 450;
    this.teleportEnCours = false;
  }

  preload() {
    this.load.spritesheet('droite_perso', 'src/assets/playerRight.png', { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('gauche_perso', 'src/assets/playerLeft.png',  { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('haut_perso',   'src/assets/playerUp.png',    { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('bas_perso',    'src/assets/playerDown.png',  { frameWidth: 48, frameHeight: 68 });
    this.load.spritesheet('porte_feu', 'src/assets/porte_feu.png', { frameWidth: 96, frameHeight: 120 });

    this.load.tilemapTiledJSON('lave', 'src/assets/lave.tmj');
    this.load.image('terrain', 'src/assets/terrain.png');
    this.load.image('top_down_quarter__4_-removebg-preview', 'src/assets/top_down_quarter__4_-removebg-preview.png');
    this.load.audio('pirate', 'src/assets/pirate.mp3');
    this.load.audio('musique', 'src/assets/theme.wav');
    
  }

  create() {
    this.sound.stopAll();
    const musique = this.sound.get('musique');
    if (musique) {
        musique.stop();
    }
    this.son_musique = this.sound.add('pirate');
    this.son_musique.play();

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
    this.creerCollisionsBords();
    this.creerPorteRetourFeu();

    // CAMERA
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // CLAVIER
    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // ANIMATIONS
    creerAnimationsDuPerso(this);
    this.creerAnimationPorteRetour('anim_ouvreporte_retour_feu', 0, 5);
    this.creerAnimationPorteRetour('anim_fermeporte_retour_feu', 5, 0);
  }

  creerCollisionsBords() {
    const epaisseur = 16;
    const largeur = this.map.widthInPixels;
    const hauteur = this.map.heightInPixels;

    const bords = [
      this.add.rectangle(largeur / 2, epaisseur / 2, largeur, epaisseur, 0x000000, 0),
      this.add.rectangle(largeur / 2, hauteur - epaisseur / 2, largeur, epaisseur, 0x000000, 0),
      this.add.rectangle(epaisseur / 2, hauteur / 2, epaisseur, hauteur, 0x000000, 0),
      this.add.rectangle(largeur - epaisseur / 2, hauteur / 2, epaisseur, hauteur, 0x000000, 0)
    ];

    this.bordsCollision = bords.map((bord) => {
      this.physics.add.existing(bord, true);
      this.physics.add.collider(this.player, bord);
      return bord;
    });
  }

  creerPorteRetourFeu() {
    this.porteRetourFeu = this.physics.add.staticSprite(this.playerStartX, this.playerStartY, 'porte_feu', 0);
    this.porteRetourFeu.setOrigin(0.5, 1);
    this.porteRetourFeu.setDisplaySize(this.map.tileWidth * 3.5, this.map.tileHeight * 2.4);
    this.porteRetourFeu.refreshBody();
    this.porteRetourFeu.body.setSize(this.map.tileWidth * 3.5 - 14, this.map.tileHeight * 2.4 - 10, true);
    this.porteRetourFeu.setDepth(60);
    this.porteRetourFeu.ouverte = false;
    this.porteRetourFeu.enAnimation = false;

    this.zoneEntreePorteRetourFeu = this.add.zone(
      this.porteRetourFeu.x,
      this.porteRetourFeu.y - this.map.tileHeight * 2.4 + 16,
      this.map.tileWidth * 3.5 - 24,
      16
    );
    this.physics.add.existing(this.zoneEntreePorteRetourFeu, true);
  }

  creerAnimationPorteRetour(key, start, end) {
    if (this.anims.exists(key)) {
      return;
    }

    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('porte_feu', { start, end }),
      frameRate: 10,
      repeat: 0
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'niveaufeu');
      this.scene.pause('niveaufeu');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    this.handlePorteRetourFeu();

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

  handlePorteRetourFeu() {
    if (!this.porteRetourFeu) {
      return;
    }

    const estSurLaPorte = this.physics.overlap(this.player, this.porteRetourFeu);
    const estDansEntree = this.zoneEntreePorteRetourFeu
      ? this.physics.overlap(this.player, this.zoneEntreePorteRetourFeu)
      : false;

    if (estSurLaPorte && Phaser.Input.Keyboard.JustDown(this.toucheEspace) && !this.porteRetourFeu.enAnimation) {
      if (this.porteRetourFeu.ouverte) {
        this.fermerPorteRetourFeu();
      } else {
        this.ouvrirPorteRetourFeu();
      }
    }

    if (estDansEntree && this.porteRetourFeu.ouverte && !this.teleportEnCours) {
      this.teleportEnCours = true;
      this.time.delayedCall(150, () => {
        this.scene.start('selection', {
          map: this.returnMap,
          startX: this.returnX,
          startY: this.returnY
        });
      });
    }
  }

  ouvrirPorteRetourFeu() {
    this.porteRetourFeu.enAnimation = true;
    this.porteRetourFeu.anims.play('anim_ouvreporte_retour_feu');
    this.porteRetourFeu.once('animationcomplete', () => {
      this.porteRetourFeu.ouverte = true;
      this.porteRetourFeu.enAnimation = false;
      this.porteRetourFeu.setFrame(5);
    });
  }

  fermerPorteRetourFeu() {
    this.porteRetourFeu.enAnimation = true;
    this.porteRetourFeu.anims.play('anim_fermeporte_retour_feu');
    this.porteRetourFeu.once('animationcomplete', () => {
      this.porteRetourFeu.ouverte = false;
      this.porteRetourFeu.enAnimation = false;
      this.porteRetourFeu.setFrame(0);
    });
  }
}
