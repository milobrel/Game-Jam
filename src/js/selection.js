import { creerAnimationsDuPerso } from './animations_perso.js';
import { activerCollisionsSolides, ajouterCollisionsJoueur, chargerCalqueSiPresent, chargerSpritesheetsJoueur } from './scene_helpers.js';

export default class selection extends Phaser.Scene {

  constructor() {
    super({ key: 'selection' });
  }

  init(data) {
    this.currentMap = data.map || 'mapcentral';
    this.playerStartX = data.startX || 100;
    this.playerStartY = data.startY || 450;
    this.teleportEnCours = false;
  }

  preload() {
    chargerSpritesheetsJoueur(this);
    this.chargerAssetsCarte();
    this.chargerSpritesheetsPortes();
  }

  chargerAssetsCarte() {
    this.load.audio('musique', 'src/assets/songs/theme.wav');
    this.load.image('merlin', 'src/assets/images/Merlin.png');

    // Cette partie charge les cartes encore accessibles depuis la selection.
    this.load.tilemapTiledJSON('mapcentral', 'src/assets/mapcentral..tmj');
    this.load.tilemapTiledJSON('map_air', 'src/assets/map_air.tmj');
    this.load.tilemapTiledJSON('glace', 'src/assets/glace.json');
    this.load.tilemapTiledJSON('lave', 'src/assets/lave.tmj');

    // Cette partie charge les tilesets utiles aux cartes restantes.
    this.load.image('First Asset pack', 'src/assets/tiles/First Asset pack.png');
    this.load.image('TilesA2', 'src/assets/tiles/TilesA2.png');
    this.load.image('terrain', 'src/assets/tiles/terrain.png');
    this.load.image('ChatGPT Image 17 mars 2026, 10_34_01', 'src/assets/tiles/ChatGPT Image 17 mars 2026, 10_34_01.png');
  }

  chargerSpritesheetsPortes() {
    const portes = ['porte_air', 'porte_feu', 'porte_retourglace'];

    portes.forEach((porte) => {
      this.load.spritesheet(porte, `src/assets/images/${porte}.png`, {
        frameWidth: 96,
        frameHeight: 120
      });
    });
  }

  create() {
    // Cette partie lance ou reprend la musique de la scene.
    this.initialiserAudioSelection();

    // Cette partie construit la carte active.
    this.map = this.make.tilemap({ key: this.currentMap });
    this.chargerCalquesCarte();
    this.activerCollisionsDesCalques();
    this.configurerMonde();

    // Cette partie pose les objets speciaux de la map centrale.
    if (this.currentMap === 'mapcentral') {
      this.creerObjetsMapCentrale();
    } else {
      this.reinitialiserObjetsCarteCentrale();
    }

    // Cette partie installe le joueur et ses collisions.
    this.creerJoueur();
    this.ajouterCollisionsCalques();
    this.initialiserCommandesSelection();

    if (this.merlin) {
      this.physics.add.collider(this.player, this.merlin);
    }

    // Cette partie prepare les dialogues de Merlin.
    this.dialogueActif = false;
    this.dialogueEtape = 0;
    this.dialogueMode = 'intro';
    this.dialogueElements = null;
    this.initialiserDialogueMerlin();

    // Cette partie regle la camera autour du joueur.
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // Cette partie active les animations utiles a la scene.
    creerAnimationsDuPerso(this);
    this.initialiserAnimationsPortes();
  }

  initialiserAudioSelection() {
    const musiqueExistante = this.sound.get('musique');
    this.son_musique = musiqueExistante || this.sound.add('musique');

    if (this.son_musique.isPaused) {
      this.son_musique.resume();
    } else if (!this.son_musique.isPlaying) {
      this.son_musique.play();
    }
  }

  initialiserCommandesSelection() {
    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }

  initialiserAnimationsPortes() {
    this.creerAnimationPorte('porte_air', 'anim_ouvreporte_air', 0, 5);
    this.creerAnimationPorte('porte_air', 'anim_fermeporte_air', 5, 0);
    this.creerAnimationPorte('porte_feu', 'anim_ouvreporte_feu', 0, 5);
    this.creerAnimationPorte('porte_feu', 'anim_fermeporte_feu', 5, 0);
    this.creerAnimationPorte('porte_retourglace', 'anim_ouvreporte_glace', 0, 5);
    this.creerAnimationPorte('porte_retourglace', 'anim_fermeporte_glace', 5, 0);
  }

  chargerCalquesCarte() {
    // Cette partie charge les calques de toutes les cartes encore actives.
    this.tileset1 = this.map.addTilesetImage('First Asset pack', 'First Asset pack');
    this.tileset2 = this.map.addTilesetImage('TilesA2', 'TilesA2');
    this.tileset3 = this.map.addTilesetImage('terrain', 'terrain');
    this.tileset4 = this.map.addTilesetImage('ChatGPT Image 17 mars 2026, 10_34_01', 'ChatGPT Image 17 mars 2026, 10_34_01');
    this.tilesets = [this.tileset1, this.tileset2, this.tileset3, this.tileset4];

    this.calqueHaut = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 3', this.tilesets, 10);
    this.calqueFond = chargerCalqueSiPresent(this.map, ['Calque de Tuiles 1', 'Calque_nuage'], this.tilesets, 30);
    this.calqueMilieu = chargerCalqueSiPresent(this.map, ['Calque de Tuiles 2', 'calque_surface'], this.tilesets, 40);
    this.calqueQuatre = chargerCalqueSiPresent(this.map, 'Calque de Tuiles 4', this.tilesets, 50);
  }

  activerCollisionsDesCalques() {
    activerCollisionsSolides([this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre]);
  }

  configurerMonde() {
    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
  }

  creerObjetsMapCentrale() {
    const profondeurObjet = this.calqueMilieu ? this.calqueMilieu.depth : 40;
    const largeurPorte = this.map.tileWidth * 3.5;
    const hauteurPorte = this.map.tileHeight * 2.4;

    this.creerPorteElementaire({
      key: 'Air',
      texture: 'porte_air',
      x: 52 - this.map.tileWidth * 3,
      y: 300,
      largeur: largeurPorte,
      hauteur: hauteurPorte,
      profondeur: profondeurObjet
    });

    this.creerPorteElementaire({
      key: 'Feu',
      texture: 'porte_feu',
      x: 300,
      y: hauteurPorte,
      largeur: largeurPorte,
      hauteur: hauteurPorte,
      profondeur: profondeurObjet
    });

    this.creerPorteElementaire({
      key: 'Glace',
      texture: 'porte_retourglace',
      x: 588 - this.map.tileWidth,
      y: 228 + this.map.tileHeight * 7,
      largeur: largeurPorte,
      hauteur: hauteurPorte,
      profondeur: profondeurObjet
    });

    // Cette partie place Merlin au centre de la carte.
    this.merlin = this.physics.add.staticSprite(324, 348 + this.map.tileHeight * 2, 'merlin');
    this.merlin.setOrigin(0.5, 1);
    this.merlin.setDisplaySize(this.map.tileWidth * 3.2, this.map.tileHeight * 4);
    this.merlin.refreshBody();
    this.merlin.setDepth(100);
  }

  creerPorteElementaire({ key, texture, x, y, largeur, hauteur, profondeur }) {
    const ombre = this.add.ellipse(x, y - 2, largeur - 10, 10, 0x000000, 0.22);
    ombre.setDepth(profondeur);

    const porte = this.physics.add.staticSprite(x, y, texture, 0);
    porte.setOrigin(0.5, 1);
    porte.setDisplaySize(largeur, hauteur);
    porte.refreshBody();
    porte.body.setSize(largeur - 14, hauteur - 10, true);
    porte.setDepth(profondeur);
    porte.ouverte = false;
    porte.enAnimation = false;

    const zoneEntree = this.add.zone(x, y - hauteur + 16, largeur - 24, 16);
    this.physics.add.existing(zoneEntree, true);

    this[`ombrePorte${key}`] = ombre;
    this[`porte${key}`] = porte;
    this[`zoneEntreePorte${key}`] = zoneEntree;
  }

  reinitialiserObjetsCarteCentrale() {
    this.porteAir = null;
    this.ombrePorteAir = null;
    this.zoneEntreePorteAir = null;
    this.porteFeu = null;
    this.ombrePorteFeu = null;
    this.zoneEntreePorteFeu = null;
    this.porteGlace = null;
    this.ombrePorteGlace = null;
    this.zoneEntreePorteGlace = null;
    this.merlin = null;
  }

  initialiserDialogueMerlin() {
    this.dialoguePages = [
      "Jeune aventurier... je t'attendais.",
      "Ce monde n'est pas ce qu'il semble etre.",
      "Ta quete est de retrouver les trois objets sacres.",
      "Observe chaque detail autour de toi.",
      "Deplace les blocs pour avancer.",
      "Le feu t'attend au nord.",
      "L'air souffle a l'ouest.",
      "La glace repose a l'est.",
      "Quand tu auras tout rassemble...",
      "Tu accederas a la salle finale.",
      "Et tu decouvriras le One Piece."
    ];

    this.dialogueRetourFeu = [
      "Je sens une nouvelle chaleur autour de toi.",
      "Tu as recupere l'objet sacre du feu.",
      "Reprends ton souffle, puis pars chercher les autres artefacts."
    ];

    this.dialogueOnePiece = [
      "Tu as reuni les trois objets sacres.",
      "Je vais te reveler la verite sur le One Piece.",
      "Le One Piece... c'est l'amitie."
    ];

    this.dialogueSecretFinal = "Le One Piece est revele. Les trois artefacts ont ouvert le quatrieme choix.";

    this.choixRoyaumesMerlin = [
      { nom: 'Air', couleur: '#88ccff', texte: "Air : avance vers l'ouest." },
      { nom: 'Feu', couleur: '#ff7755', texte: "Feu : avance vers le nord." },
      { nom: 'Glace', couleur: '#ccf6ff', texte: "Glace : avance vers l'est." }
    ];
  }

  creerJoueur() {
    const px = this.playerStartX;
    const py = this.playerStartY;

    // Cette partie cree le joueur a sa position d'entree.
    if (this.textures.exists('bas_perso')) {
      this.player = this.physics.add.sprite(px, py, 'bas_perso');
    } else {
      this.player = this.add.rectangle(px, py, 32, 32, 0xff0000);
      this.physics.add.existing(this.player);
    }

    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 20);
    this.player.body.setOffset(10, 48);
    this.player.setDepth(100);
  }

  ajouterCollisionsCalques() {
    ajouterCollisionsJoueur(this, this.player, [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre]);
  }

  creerAnimationPorte(texture, key, start, end) {
    if (this.anims.exists(key)) {
      return;
    }

    this.anims.create({
      key,
      frames: this.anims.generateFrameNumbers(texture, { start, end }),
      frameRate: 10,
      repeat: 0
    });
  }

  update() {
    // Cette partie renvoie a l'accueil quand on appuie sur P.
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'selection');
      this.scene.pause('selection');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    // Cette partie bloque le joueur pendant les dialogues.
    if (this.dialogueActif) {
      this.player.setVelocity(0);
      this.player.anims.play('anim_face');
      this.handleMerlinDialogue();
      return;
    }

    this.gererMouvementJoueur();
    this.handleDoorInteraction();
    this.handleDoorFeuInteraction();
    this.handleDoorGlaceInteraction();
    this.handleMerlinInteraction();

    // Cette partie verifie les sorties speciales de la carte.
    this.checkMapTransitions();
  }

  gererMouvementJoueur() {
    const speed = 100;
    let isMoving = false;

    this.player.setVelocity(0);

    if (this.clavier.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('anim_tourne_droite', true);
      isMoving = true;
    } else if (this.clavier.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('anim_tourne_gauche', true);
      isMoving = true;
    } else if (this.clavier.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      isMoving = true;
    } else if (this.clavier.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_bas', true);
      isMoving = true;
    }

    if (!isMoving) {
      this.player.anims.play('anim_face');
    }
  }

  handleDoorInteraction() {
    this.gererInteractionPorte({
      porte: this.porteAir,
      zoneEntree: this.zoneEntreePorteAir,
      sceneAction: () => {
        this.scene.start('niveau_air', {
          startX: 1280,
          startY: 384,
          returnMap: this.currentMap,
          returnX: this.player.x,
          returnY: this.player.y
        });
      },
      ouvrir: () => this.ouvrirPorteAir(),
      fermer: () => this.fermerPorteAir()
    });
  }

  ouvrirPorteAir() {
    this.ouvrirPorte(this.porteAir, 'anim_ouvreporte_air');
  }

  fermerPorteAir() {
    this.fermerPorte(this.porteAir, 'anim_fermeporte_air');
  }

  handleDoorFeuInteraction() {
    this.gererInteractionPorte({
      porte: this.porteFeu,
      zoneEntree: this.zoneEntreePorteFeu,
      sceneAction: () => {
        this.scene.start('niveaufeu', {
          startX: 768,
          startY: 736,
          returnMap: this.currentMap,
          returnX: this.player.x,
          returnY: this.player.y
        });
      },
      ouvrir: () => this.ouvrirPorteFeu(),
      fermer: () => this.fermerPorteFeu()
    });
  }

  ouvrirPorteFeu() {
    this.ouvrirPorte(this.porteFeu, 'anim_ouvreporte_feu');
  }

  fermerPorteFeu() {
    this.fermerPorte(this.porteFeu, 'anim_fermeporte_feu');
  }

  handleDoorGlaceInteraction() {
    this.gererInteractionPorte({
      porte: this.porteGlace,
      zoneEntree: this.zoneEntreePorteGlace,
      sceneAction: () => {
        this.scene.start('niveauglace', {
          startX: 12,
          startY: 300,
          returnMap: this.currentMap,
          returnX: this.player.x,
          returnY: this.player.y
        });
      },
      ouvrir: () => this.ouvrirPorteGlace(),
      fermer: () => this.fermerPorteGlace()
    });
  }

  ouvrirPorteGlace() {
    this.ouvrirPorte(this.porteGlace, 'anim_ouvreporte_glace');
  }

  fermerPorteGlace() {
    this.fermerPorte(this.porteGlace, 'anim_fermeporte_glace');
  }

  gererInteractionPorte({ porte, zoneEntree, sceneAction, ouvrir, fermer }) {
    if (!porte || this.currentMap !== 'mapcentral') {
      return;
    }

    const estSurLaPorte = this.physics.overlap(this.player, porte);
    const estDansEntree = zoneEntree ? this.physics.overlap(this.player, zoneEntree) : false;

    if (estSurLaPorte && Phaser.Input.Keyboard.JustDown(this.toucheEspace) && !porte.enAnimation) {
      if (porte.ouverte === false) {
        ouvrir();
      } else {
        fermer();
      }
    }

    if (estDansEntree && porte.ouverte && !this.teleportEnCours) {
      this.teleportEnCours = true;
      this.time.delayedCall(150, sceneAction);
    }
  }

  ouvrirPorte(porte, animationKey) {
    if (!porte) {
      return;
    }

    porte.enAnimation = true;
    porte.anims.play(animationKey);
    porte.once('animationcomplete', () => {
      porte.ouverte = true;
      porte.enAnimation = false;
      porte.setFrame(5);
    });
  }

  fermerPorte(porte, animationKey) {
    if (!porte) {
      return;
    }

    porte.enAnimation = true;
    porte.anims.play(animationKey);
    porte.once('animationcomplete', () => {
      porte.ouverte = false;
      porte.enAnimation = false;
      porte.setFrame(0);
    });
  }

  checkMapTransitions() {
    // Cette partie gere les passages de carte par les bords.
    if (this.currentMap === 'mapcentral' && this.player.x > 1400 && this.player.y < 200) {
      this.scene.start('niveau_air', {
        startX: 1280,
        startY: 384,
        returnMap: this.currentMap,
        returnX: this.player.x,
        returnY: this.player.y
      });
    } else if (this.currentMap === 'mapcentral' && this.player.x < 100 && this.player.y > 1400) {
      this.scene.start('niveauglace', {
        startX: 0,
        startY: 50,
        returnMap: this.currentMap,
        returnX: this.player.x,
        returnY: this.player.y
      });
    } else if (this.currentMap === 'glace' && this.player.y < 50) {
      this.scene.restart({ map: 'mapcentral', startX: 100, startY: 1400 });
    }
  }

  handleMerlinInteraction() {
    if (!this.merlin || this.currentMap !== 'mapcentral' || this.dialogueActif) {
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.merlin.x, this.merlin.y);
    if (dist < 40 && Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
      this.ouvrirDialogueMerlin();
    }
  }

  ouvrirDialogueMerlin() {
    this.dialogueActif = true;
    this.dialogueEtape = 0;
    this.dialogueMode = 'intro';
    this.dialoguePagesActuelles = this.obtenirDialogueMerlinActuel();
    this.afficherDialogueTexte(this.dialoguePagesActuelles[0]);
  }

  obtenirDialogueMerlinActuel() {
    const artefactAirRecupere = this.registry.get('artefactAirRecupere') === true;
    const artefactFeuRecupere = this.registry.get('artefactFeuRecupere') === true;
    const artefactGlaceRecupere = this.registry.get('artefactGlaceRecupere') === true;
    const onePieceAnnonceParMerlin = this.registry.get('onePieceAnnonceParMerlin') === true;
    const artefactFeuAnnonceParMerlin = this.registry.get('artefactFeuAnnonceParMerlin') === true;
    const troisObjetsRecuperes = artefactAirRecupere && artefactFeuRecupere && artefactGlaceRecupere;

    if (troisObjetsRecuperes && !onePieceAnnonceParMerlin) {
      this.registry.set('onePieceAnnonceParMerlin', true);
      return this.dialogueOnePiece;
    }

    if (artefactFeuRecupere && !artefactFeuAnnonceParMerlin) {
      this.registry.set('artefactFeuAnnonceParMerlin', true);
      return this.dialogueRetourFeu;
    }

    return this.dialoguePages;
  }

  afficherDialogueTexte(texte) {
    this.fermerDialogueUI();

    const bubbleX = this.merlin.x;
    const bubbleY = this.merlin.y - this.map.tileHeight * 4.6;
    const bubbleWidth = 250;
    const bubbleHeight = 100;

    const fond = this.add.rectangle(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 0x0d1533, 0.95)
      .setStrokeStyle(2, 0x8888ff)
      .setDepth(150);
    const contenu = this.add.text(bubbleX, bubbleY - 8, texte, {
      font: '15px Arial',
      fill: '#f2f5ff',
      align: 'center',
      wordWrap: { width: bubbleWidth - 26 }
    }).setOrigin(0.5).setDepth(151);
    const suite = this.add.text(bubbleX, bubbleY + 34, '[ESPACE] continuer', {
      font: '12px Arial',
      fill: '#9ab0dd'
    }).setOrigin(0.5).setDepth(151);

    this.dialogueElements = [fond, contenu, suite];
  }

  afficherChoixRoyaumes() {
    this.fermerDialogueUI();
    const choixRoyaumes = this.obtenirChoixRoyaumesMerlin();

    const bubbleX = this.merlin.x;
    const bubbleY = this.merlin.y - this.map.tileHeight * 4.9;
    const bubbleWidth = 300;
    const bubbleHeight = choixRoyaumes.length > 3 ? 196 : 168;

    const fond = this.add.rectangle(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 0x0d1533, 0.95)
      .setStrokeStyle(2, 0x8888ff)
      .setDepth(150);
    const titre = this.add.text(bubbleX, bubbleY - 60, 'Choisis un royaume', {
      font: '16px Arial',
      fill: '#f5c842'
    }).setOrigin(0.5).setDepth(151);

    this.dialogueElements = [fond, titre];

    choixRoyaumes.forEach((royaume, index) => {
      const y = bubbleY - 20 + index * 28;
      const choix = this.add.text(bubbleX, y, royaume.nom, {
        font: '15px Arial',
        fill: royaume.couleur,
        backgroundColor: '#243554',
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setOrigin(0.5).setDepth(151);

      choix.setInteractive({ useHandCursor: true });
      choix.on('pointerdown', () => {
        this.afficherDetailRoyaume(royaume);
      });

      this.dialogueElements.push(choix);
    });

    const aide = this.add.text(bubbleX, bubbleY + 58, '[E] fermer', {
      font: '12px Arial',
      fill: '#9ab0dd'
    }).setOrigin(0.5).setDepth(151);

    this.dialogueElements.push(aide);
  }

  obtenirChoixRoyaumesMerlin() {
    const artefactAirRecupere = this.registry.get('artefactAirRecupere') === true;
    const artefactFeuRecupere = this.registry.get('artefactFeuRecupere') === true;
    const artefactGlaceRecupere = this.registry.get('artefactGlaceRecupere') === true;
    const troisObjetsRecuperes = artefactAirRecupere && artefactFeuRecupere && artefactGlaceRecupere;

    if (!troisObjetsRecuperes) {
      return this.choixRoyaumesMerlin;
    }

    return [
      ...this.choixRoyaumesMerlin,
      { nom: 'One Piece', couleur: '#7ee7ff', texte: this.dialogueSecretFinal }
    ];
  }

  afficherDetailRoyaume(royaume) {
    this.dialogueMode = 'detail';
    this.afficherDialogueTexte(royaume.texte);
  }

  handleMerlinDialogue() {
    if (!this.dialogueActif) {
      return;
    }

    const pages = this.dialoguePagesActuelles || this.dialoguePages;

    if (Phaser.Input.Keyboard.JustDown(this.toucheE)) {
      this.fermerDialogueUI();
      this.dialogueActif = false;
      this.dialogueMode = 'intro';
      this.dialogueEtape = 0;
      this.dialoguePagesActuelles = this.dialoguePages;
      return;
    }

    if (this.dialogueMode === 'intro' && this.dialogueEtape < pages.length - 1) {
      if (Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
        this.dialogueEtape++;
        this.afficherDialogueTexte(pages[this.dialogueEtape]);
      }
    } else if (this.dialogueMode === 'intro' && this.dialogueEtape === pages.length - 1) {
      if (Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
        this.dialogueMode = 'choix';
        this.afficherChoixRoyaumes();
      }
    } else if (this.dialogueMode === 'detail') {
      if (Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
        this.dialogueMode = 'choix';
        this.afficherChoixRoyaumes();
      }
    }
  }

  fermerDialogueUI() {
    if (this.dialogueElements) {
      this.dialogueElements.forEach((element) => element.destroy());
      this.dialogueElements = null;
    }
  }
}
