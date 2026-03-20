import { creerAnimationsDuPerso } from './animations_perso.js';
import { activerCollisionsSolides, ajouterCollisionsJoueur, arreterMusique, chargerCalqueSiPresent, chargerSpritesheetsJoueur } from './scene_helpers.js';

export default class niveaufeu extends Phaser.Scene {

  constructor() {
    super({ key: 'niveaufeu' });
  }

  init(data) {
    this.respawnX = 768;
    this.respawnY = 736;
    this.playerStartX = data.startX || 768;
    this.playerStartY = data.startY || 736;
    this.returnMap = data.returnMap || 'mapcentral';
    this.returnX = data.returnX || 100;
    this.returnY = data.returnY || 450;
    this.teleportEnCours = false;
    this.artefactFeuEnCours = false;
    this.artefactFeuActif = false;
    this.joueurMort = false;
    this.joueurInvulnerable = false;
  }

  preload() {
    chargerSpritesheetsJoueur(this);
    this.load.spritesheet('porte_feu', 'src/assets/images/porte_feu.png', { frameWidth: 96, frameHeight: 120 });
    this.load.spritesheet('monstre1', 'src/assets/images/Monstre1.png', { frameWidth: 216, frameHeight: 228 });
    this.load.image('boule_feu', 'src/assets/images/boule_feu.png');
    this.load.image('feu', 'src/assets/images/feu.png');

    this.load.tilemapTiledJSON('lave', 'src/assets/lave.tmj');
    this.load.image('terrain', 'src/assets/tiles/terrain.png');
    this.load.image('top_down_quarter__4_-removebg-preview', 'src/assets/tiles/top_down_quarter__4_-removebg-preview.png');
    this.load.audio('pirate', 'src/assets/songs/pirate.mp3');
    this.load.audio('musique', 'src/assets/songs/theme.wav');
  }

  create() {
    const musique = this.sound.get('musique');
    if (musique?.isPlaying) {
      musique.pause();
    }
    this.son_musique = this.sound.get('pirate') || this.sound.add('pirate');
    if (!this.son_musique.isPlaying) {
      this.son_musique.play();
    }

    // -------------------------------------------------------
    // CARTE
    // -------------------------------------------------------
    this.map = this.make.tilemap({ key: 'lave' });
    const terrainTileset = this.map.addTilesetImage('terrain', 'terrain');
    const quarterTileset = this.map.addTilesetImage(
      'top_down_quarter__4_-removebg-preview',
      'top_down_quarter__4_-removebg-preview'
    );
    const tilesets = [terrainTileset, quarterTileset].filter(Boolean);

    if (tilesets.length === 0) {
      console.error('Erreur : aucun tileset chargé pour la carte lave');
      return;
    }

    this.calqueFond = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 1', tilesets, 10);
    this.calqueHaut = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 3', tilesets, 30);
    this.calqueQuatre = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 4', tilesets, 40);

    // Cette partie active les collisions des tuiles solides.
    activerCollisionsSolides([this.calqueFond, this.calqueHaut, this.calqueQuatre]);

    // Limites monde
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // -------------------------------------------------------
    // JOUEUR
    // -------------------------------------------------------
    this.player = this.physics.add.sprite(this.playerStartX, this.playerStartY, 'bas_perso');
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 20);
    this.player.body.setOffset(10, 48);
    this.player.setDepth(100);

    ajouterCollisionsJoueur(this, this.player, [this.calqueFond, this.calqueHaut, this.calqueQuatre]);

    this.creerCollisionsBords();
    this.creerPorteRetourFeu();
    this.creerProjectilesFeu();   // créer le groupe AVANT les monstres
    this.creerMonstresFeu();
    this.creerObjetSacreFeu();

    // -------------------------------------------------------
    // CAMERA
    // -------------------------------------------------------
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // -------------------------------------------------------
    // CLAVIER
    // -------------------------------------------------------
    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // -------------------------------------------------------
    // ANIMATIONS
    // -------------------------------------------------------
    creerAnimationsDuPerso(this);
    this.creerAnimationPorteRetour('anim_ouvreporte_retour_feu', 0, 5);
    this.creerAnimationPorteRetour('anim_fermeporte_retour_feu', 5, 0);

    this.time.delayedCall(500, () => {
      this.artefactFeuActif = true;
    });
  }

  // -------------------------------------------------------
  // COLLISIONS BORDS
  // -------------------------------------------------------
  creerCollisionsBords() {
    const epaisseur = 16;
    const largeur = this.map.widthInPixels;
    const hauteur = this.map.heightInPixels;

    const bords = [
      this.add.rectangle(largeur / 2,           epaisseur / 2,         largeur,   epaisseur, 0x000000, 0),
      this.add.rectangle(largeur / 2,           hauteur - epaisseur / 2, largeur, epaisseur, 0x000000, 0),
      this.add.rectangle(epaisseur / 2,         hauteur / 2,           epaisseur, hauteur,   0x000000, 0),
      this.add.rectangle(largeur - epaisseur / 2, hauteur / 2,         epaisseur, hauteur,   0x000000, 0)
    ];

    this.bordsCollision = bords.map((bord) => {
      this.physics.add.existing(bord, true);
      this.physics.add.collider(this.player, bord);
      return bord;
    });
  }

  // -------------------------------------------------------
  // PORTE RETOUR
  // -------------------------------------------------------
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
    if (this.anims.exists(key)) return;
    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('porte_feu', { start, end }),
      frameRate: 10,
      repeat: 0
    });
  }

  creerMonstresFeu() {
    const positions = [
      { x: 144, y: 608 },
      { x: 160, y: 96  },
      { x: 160, y: 395}
    ];

    this.monstresFeu = positions.map(({ x, y }) => {
      const monstre = this.physics.add.sprite(x, y, 'monstre1', 0);
      monstre.setImmovable(true);
      monstre.body.allowGravity = false;
      monstre.setDepth(80);
      monstre.setScale(0.17);
      monstre.setFrame(0);

      this.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => {
          if (!monstre.active) {
            return;
          }

          monstre.setFlipX(this.player.x < monstre.x);
          this.tirer(monstre);
        }
      });

      return monstre;
    });
  }

  creerObjetSacreFeu() {
    if (this.registry.get('artefactFeuRecupere') === true) {
      this.artefactFeu = null;
      return;
    }

    this.artefactFeu = this.physics.add.sprite(48, 16, 'feu');
    this.artefactFeu.setDepth(95);
    this.artefactFeu.setScale(0.12);
    this.artefactFeu.body.allowGravity = false;
    this.artefactFeu.setImmovable(true);

    this.physics.add.overlap(this.player, this.artefactFeu, this.recupererArtefactFeu, null, this);
  }

  recupererArtefactFeu(player, artefact) {
    if (!this.artefactFeuActif || !artefact || !artefact.active || this.artefactFeuEnCours) {
      return;
    }

    this.artefactFeuEnCours = true;
    this.teleportEnCours = true;
    this.registry.set('artefactFeuRecupere', true);
    this.registry.set('artefactFeuAnnonceParMerlin', false);
    artefact.destroy();

    this.player.setVelocity(0);
    this.player.anims.play('anim_face');

    const centreX = this.cameras.main.width / 2;
    const centreY = this.cameras.main.height / 2;
    const fondMessage = this.add.rectangle(centreX, centreY, 420, 90, 0x4a1b0f, 0.95)
      .setStrokeStyle(3, 0xffe08a)
      .setScrollFactor(0)
      .setDepth(1000);
    const message = this.add.text(
      centreX,
      centreY,
      'Vous avez trouver\nla perle du feu',
      {
        font: '22px Arial',
        fill: '#ffe08a',
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
        startX: 300,
        startY: 450
      });
    });
  }

  // -------------------------------------------------------
  // PROJECTILES
  // -------------------------------------------------------
  creerProjectilesFeu() {
    this.groupeBoulesFeu = this.physics.add.group();
  }

  mortJoueur() {
    if (this.joueurMort) {
      return;
    }

    this.joueurMort = true;
    this.joueurInvulnerable = true;
    this.player.setTint(0xff6666);
    this.player.setVelocity(0);
    this.player.anims.play('anim_face');

    this.time.delayedCall(300, () => {
      if (this.groupeBoulesFeu) {
        this.groupeBoulesFeu.clear(true, true);
      }

      this.respawnJoueur();
    });
  }

  respawnJoueur() {
    this.player.setPosition(this.respawnX, this.respawnY);
    this.player.body.reset(this.respawnX, this.respawnY);
    this.player.clearTint();
    this.player.setActive(true);
    this.player.setVisible(true);
    this.player.setVelocity(0);
    this.player.anims.play('anim_face');
    this.joueurMort = false;
    this.cameras.main.flash(150, 255, 255, 255);

    this.time.delayedCall(1000, () => {
      this.joueurInvulnerable = false;
    });
  }

  tirer(monstre) {
    const direction = this.player.x >= monstre.x ? 1 : -1;

    const boule = this.groupeBoulesFeu.create(
      monstre.x + (26 * direction),
      monstre.y - 18,
      'boule_feu'
    );

    boule.setScale(0.05);
    boule.setDepth(90);
    boule.body.allowGravity = false;
    boule.setCollideWorldBounds(false);
    boule.body.setSize(80, 80, true);
    boule.setVelocityX(700 * direction);
  }

  // -------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------
  update() {
    // Touche P → pause et retour à l'accueil
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'niveaufeu');
      this.scene.pause('niveaufeu');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    if (this.joueurMort) {
      this.player.setVelocity(0);
      return;
    }

    if (this.groupeBoulesFeu) {
      this.groupeBoulesFeu.getChildren().forEach((boule) => {
        const distance = Phaser.Math.Distance.Between(
          this.player.body.center.x,
          this.player.body.center.y,
          boule.body.center.x,
          boule.body.center.y
        );

        if (distance < 34 && !this.joueurMort && !this.joueurInvulnerable) {
          boule.destroy();
          this.mortJoueur();
        }
      });
    }

    this.handlePorteRetourFeu();

    // Déplacement joueur
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

  // -------------------------------------------------------
  // GESTION PORTE RETOUR
  // -------------------------------------------------------
  handlePorteRetourFeu() {
    if (!this.porteRetourFeu) return;

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
        arreterMusique(this, this.son_musique);
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
