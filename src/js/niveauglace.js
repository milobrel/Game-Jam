import { creerAnimationsDuPerso } from './animations_perso.js';
import { activerCollisionsSolides, ajouterCollisionsJoueur, arreterMusique, chargerCalqueSiPresent, chargerSpritesheetsJoueur } from './scene_helpers.js';

export default class niveauglace extends Phaser.Scene {

  constructor() {
    super({ key: "niveauglace" });
  }

  init(data) {
    this.playerStartX = data.startX || 100;
    this.playerStartY = data.startY || 450;
    this.teleportEnCours = false;
    this.artefactGlaceEnCours = false;
    this.artefactGlaceActif = false;
    this.returnMap = data.returnMap || 'mapcentral';
    this.returnX = data.returnX || 100;
    this.returnY = data.returnY || 450;
  }

  preload() {
    // Cette partie charge les assets communs du joueur.
    chargerSpritesheetsJoueur(this);
    this.load.audio('musique', 'src/assets/songs/theme.wav');
    this.load.audio('passionfruit', 'src/assets/songs/passionfruit.mp3');

    // Charger la tilemap glace
    this.load.tilemapTiledJSON('glace', 'src/assets/glace.json');
    this.load.image('First Asset pack', 'src/assets/tiles/First Asset pack.png');
    this.load.image('TilesA2', 'src/assets/tiles/TilesA2.png');
    this.load.image('terrain', 'src/assets/tiles/terrain.png');
    this.load.image('objet_sacre_glace', 'src/assets/images/glace .png');
    this.load.spritesheet('porte_retourglace', 'src/assets/images/porte_retourglace.png', {
      frameWidth: 96,
      frameHeight: 120
    });
  }

  create() {
    const musiquePrincipale = this.sound.get('musique');
    if (musiquePrincipale?.isPlaying) {
      musiquePrincipale.pause();
    }

    this.son_musique = this.sound.get('passionfruit') || this.sound.add('passionfruit');
    if (!this.son_musique.isPlaying) {
      this.son_musique.play();
    }

    // -------------------------------------------------------
    // CARTE
    // -------------------------------------------------------
    this.map = this.make.tilemap({ key: 'glace' });
    this.tileset1 = this.map.addTilesetImage('First Asset pack', 'First Asset pack');
    this.tileset2 = this.map.addTilesetImage('TilesA2', 'TilesA2');
    this.tileset3 = this.map.addTilesetImage('terrain', 'terrain');
    this.tilesets = [this.tileset1, this.tileset2, this.tileset3];

    // chargement du calque Calque de Tuiles 3
    this.calqueHaut = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 3', this.tilesets, 10);

    // chargement du calque Calque de Tuiles 1
    this.calqueFond = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 1', this.tilesets, 30);

    // chargement du calque Calque de Tuiles 2
    this.calqueMilieu = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 2', this.tilesets, 40);

    // chargement du calque Calque de Tuiles 4
    this.calqueQuatre = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 4', this.tilesets, 50);

    // Cette partie active les collisions des calques solides.
    activerCollisionsSolides([this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre]);

    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // -------------------------------------------------------
    // JOUEUR
    // -------------------------------------------------------
    this.player = this.physics.add.sprite(this.playerStartX, this.playerStartY, 'bas_perso');
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 20);
    this.player.body.setOffset(10, 48);
    this.player.setDepth(100);

    ajouterCollisionsJoueur(this, this.player, [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre]);

    this.porteRetourGlace = this.physics.add.staticSprite(0, 300, 'porte_retourglace', 0);
    this.porteRetourGlace.setOrigin(0, 0.5);
    this.porteRetourGlace.setDisplaySize(this.map.tileWidth * 3.5, this.map.tileHeight * 2.4);
    this.porteRetourGlace.refreshBody();
    this.porteRetourGlace.body.setSize(this.map.tileWidth * 3.5 - 14, this.map.tileHeight * 2.4 - 10, true);
    this.porteRetourGlace.setDepth(60);
    this.porteRetourGlace.ouverte = false;
    this.porteRetourGlace.enAnimation = false;
    this.zoneEntreePorteRetourGlace = this.add.zone(
      this.porteRetourGlace.x + 24,
      this.porteRetourGlace.y,
      16,
      this.map.tileHeight * 2.4 - 24
    );
    this.physics.add.existing(this.zoneEntreePorteRetourGlace, true);

    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // Etat de glisse : direction actuelle (x=-1/0/1, y=-1/0/1)
    this.slideDir = { x: 0, y: 0 };
    this.isSliding = false;

    // -------------------------------------------------------
    // CAMERA
    // -------------------------------------------------------
    this.cameras.main.setZoom(2.5);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // -------------------------------------------------------
    // ANIMATIONS
    // -------------------------------------------------------
    creerAnimationsDuPerso(this);
    this.creerAnimationPorteRetour('anim_ouvreporte_retour_glace', 0, 5);
    this.creerAnimationPorteRetour('anim_fermeporte_retour_glace', 5, 0);
    this.creerObjetSacreGlace();

    this.time.delayedCall(500, () => {
      this.artefactGlaceActif = true;
    });

  }

  creerAnimationPorteRetour(key, start, end) {
    if (this.anims.exists(key)) {
      return;
    }

    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers('porte_retourglace', { start, end }),
      frameRate: 10,
      repeat: 0
    });
  }

  creerObjetSacreGlace() {
    if (this.registry.get('artefactGlaceRecupere') === true) {
      this.artefactGlace = null;
      return;
    }

    this.artefactGlace = this.physics.add.sprite(
      384 + this.map.tileWidth / 2,
      12 + this.map.tileHeight / 2,
      'objet_sacre_glace'
    );
    this.artefactGlace.setOrigin(0.5, 0.5);
    this.artefactGlace.setDepth(120);
    this.artefactGlace.setScale(0.08);
    this.artefactGlace.body.allowGravity = false;
    this.artefactGlace.setImmovable(true);

    this.physics.add.overlap(this.player, this.artefactGlace, this.recupererArtefactGlace, null, this);
  }

  recupererArtefactGlace(player, artefact) {
    if (!this.artefactGlaceActif || !artefact || !artefact.active || this.artefactGlaceEnCours) {
      return;
    }

    this.artefactGlaceEnCours = true;
    this.teleportEnCours = true;
    this.registry.set('artefactGlaceRecupere', true);
    this.registry.set('artefactGlaceAnnonceParMerlin', false);
    artefact.destroy();

    this.isSliding = false;
    this.slideDir = { x: 0, y: 0 };
    this.player.setVelocity(0);
    this.player.anims.play('anim_face');

    const centreX = this.cameras.main.width / 2;
    const centreY = this.cameras.main.height / 2;
    const fondMessage = this.add.rectangle(centreX, centreY, 420, 90, 0x173b52, 0.95)
      .setStrokeStyle(3, 0xd8f4ff)
      .setScrollFactor(0)
      .setDepth(1000);
    const message = this.add.text(
      centreX,
      centreY,
      'Vous avez trouver\nla perle de la glace',
      {
        font: '22px Arial',
        fill: '#d8f4ff',
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
        startX: 100,
        startY: 450
      });
    });
  }

  update() {
    // Touche P : retour à l'accueil (la scène reste en mémoire)
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'niveauglace');
      this.scene.pause('niveauglace');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    const speed = 120;
    const onIce = this.isOnSlipperyTile();

    this.handlePorteRetourGlace();

    if (this.isSliding) {
      // En train de glisser : vérifier si on a heurté un mur
      const hitMurX = this.slideDir.x !== 0 && (this.player.body.blocked.left || this.player.body.blocked.right);
      const hitMurY = this.slideDir.y !== 0 && (this.player.body.blocked.up  || this.player.body.blocked.down);

      if (hitMurX || hitMurY || !onIce) {
        // Arrêter la glisse
        this.isSliding = false;
        this.slideDir = { x: 0, y: 0 };
        this.player.setVelocity(0);
        this.player.anims.play('anim_face');
      } else {
        // Continuer à glisser dans la même direction
        this.player.setVelocity(this.slideDir.x * speed, this.slideDir.y * speed);
        if (this.slideDir.x > 0) this.player.anims.play('anim_tourne_droite', true);
        else if (this.slideDir.x < 0) this.player.anims.play('anim_tourne_gauche', true);
        else if (this.slideDir.y < 0) this.player.anims.play('anim_tourne_haut', true);
        else if (this.slideDir.y > 0) this.player.anims.play('anim_tourne_bas', true);
      }

    } else {
      // Immobile : attendre une touche
      this.player.setVelocity(0);

      if (onIce) {
        // Sur glace : une touche = lancer dans cette direction, impossible de changer ensuite
        if (Phaser.Input.Keyboard.JustDown(this.clavier.right)) {
          this.isSliding = true; this.slideDir = { x: 1, y: 0 };
        } else if (Phaser.Input.Keyboard.JustDown(this.clavier.left)) {
          this.isSliding = true; this.slideDir = { x: -1, y: 0 };
        } else if (Phaser.Input.Keyboard.JustDown(this.clavier.up)) {
          this.isSliding = true; this.slideDir = { x: 0, y: -1 };
        } else if (Phaser.Input.Keyboard.JustDown(this.clavier.down)) {
          this.isSliding = true; this.slideDir = { x: 0, y: 1 };
        } else {
          this.player.anims.play('anim_face');
        }
      } else {
        // Sol normal : mouvement libre 4 directions
        if (this.clavier.right.isDown) {
          this.player.setVelocityX(speed);
          this.player.anims.play('anim_tourne_droite', true);
        } else if (this.clavier.left.isDown) {
          this.player.setVelocityX(-speed);
          this.player.anims.play('anim_tourne_gauche', true);
        } else if (this.clavier.up.isDown) {
          this.player.setVelocityY(-speed);
          this.player.anims.play('anim_tourne_haut', true);
        } else if (this.clavier.down.isDown) {
          this.player.setVelocityY(speed);
          this.player.anims.play('anim_tourne_bas', true);
        } else {
          this.player.anims.play('anim_face');
        }
      }
    }
  }

  handlePorteRetourGlace() {
    if (!this.porteRetourGlace) {
      return;
    }

    const estSurLaPorte = this.physics.overlap(this.player, this.porteRetourGlace);
    const estDansEntree = this.zoneEntreePorteRetourGlace
      ? this.physics.overlap(this.player, this.zoneEntreePorteRetourGlace)
      : false;

    if (estSurLaPorte && Phaser.Input.Keyboard.JustDown(this.toucheEspace) && !this.porteRetourGlace.enAnimation) {
      if (this.porteRetourGlace.ouverte) {
        this.fermerPorteRetourGlace();
      } else {
        this.ouvrirPorteRetourGlace();
      }
    }

    if (estDansEntree && this.porteRetourGlace.ouverte && !this.teleportEnCours) {
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

  ouvrirPorteRetourGlace() {
    this.porteRetourGlace.enAnimation = true;
    this.porteRetourGlace.anims.play('anim_ouvreporte_retour_glace');
    this.porteRetourGlace.once('animationcomplete', () => {
      this.porteRetourGlace.ouverte = true;
      this.porteRetourGlace.enAnimation = false;
      this.porteRetourGlace.setFrame(5);
    });
  }

  fermerPorteRetourGlace() {
    this.porteRetourGlace.enAnimation = true;
    this.porteRetourGlace.anims.play('anim_fermeporte_retour_glace');
    this.porteRetourGlace.once('animationcomplete', () => {
      this.porteRetourGlace.ouverte = false;
      this.porteRetourGlace.enAnimation = false;
      this.porteRetourGlace.setFrame(0);
    });
  }

  isOnSlipperyTile() {
    const layers = [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre];
    for (let layer of layers) {
      if (!layer) continue;
      const tile = layer.getTileAtWorldXY(this.player.x, this.player.y + this.player.displayHeight / 2);
      if (tile && (tile.properties?.estglissant === true || tile.properties?.estglissant === "true")) {
        return true;
      }
    }
    return false;
  }
}
