import { creerAnimationsDuPerso } from './animations_perso.js';

export default class selection extends Phaser.Scene {

  constructor() {
    super({ key: "selection" }); // nom de la scène, doit correspondre à scene.start('selection')
  }

  // init() est appelé avant preload, il reçoit les données de scene.start/restart
  init(data) {
    this.currentMap = data.map || 'mapcentral';   // quelle carte charger
    this.playerStartX = data.startX || 100;       // position de départ X
    this.playerStartY = data.startY || 450;       // position de départ Y
    this.teleportEnCours = false;                 // évite les doubles téléportations
  }

  preload() {
    this.chargerSpritesheetsJoueur();
    this.load.audio('musique', 'src/assets/theme.wav');
    this.load.image('merlin', 'src/assets/Merlin.png');
    this.load.spritesheet('merlin_dialogue', 'src/assets/merlin22.png', {
      frameWidth: 186,
      frameHeight: 223,
      margin: 0,
      spacing: 0
    });

    // Charger les cartes
    this.load.tilemapTiledJSON('mapcentral', 'src/assets/mapcentral..tmj');
    this.load.tilemapTiledJSON('map_air', 'src/assets/map_air.tmj');
    this.load.tilemapTiledJSON('glace', 'src/assets/glace.json');
    this.load.tilemapTiledJSON('map_eau', 'src/assets/map_eau.tmj');
    this.load.tilemapTiledJSON('lave', 'src/assets/lave.tmj');
    this.load.image('tileset_16x16_interior', 'src/assets/tileset_16x16_interior.png');
    this.load.image('First Asset pack', 'src/assets/First Asset pack.png');
    this.load.image('TilesA2', 'src/assets/TilesA2.png');
    this.load.image('terrain', 'src/assets/terrain.png');
    this.load.image('nuage', 'src/assets/nuage.png');
    this.load.image('surface', 'src/assets/surface.png');
    this.load.image('haut', 'src/assets/haut.png');
    this.load.image('quatre', 'src/assets/quatre.png');
    this.load.image('ChatGPT Image 17 mars 2026, 10_34_01', 'src/assets/ChatGPT Image 17 mars 2026, 10_34_01.png');

    this.chargerSpritesheetsPortes();
  }

  chargerSpritesheetsJoueur() {
    const spritesheets = [
      { key: 'droite_perso', path: 'src/assets/playerRight.png' },
      { key: 'gauche_perso', path: 'src/assets/playerLeft.png' },
      { key: 'haut_perso', path: 'src/assets/playerUp.png' },
      { key: 'bas_perso', path: 'src/assets/playerDown.png' }
    ];

    spritesheets.forEach(({ key, path }) => {
      this.load.spritesheet(key, path, {
        frameWidth: 48,
        frameHeight: 68
      });
    });
  }

  chargerSpritesheetsPortes() {
    const portes = ['porte_air', 'porte_feu', 'porte_glace'];

    portes.forEach((porte) => {
      this.load.spritesheet(porte, `src/assets/${porte}.png`, {
        frameWidth: 96,
        frameHeight: 120
      });
    });
  }

  create() {
    this.son_musique = this.sound.add('musique');
    if (!this.sound.get('musique')?.isPlaying) {
      this.son_musique.play();
    }

    // -------------------------------------------------------
    // CARTE : créer la tilemap et ses calques
    // -------------------------------------------------------
    this.map = this.make.tilemap({ key: this.currentMap });
    this.chargerCalquesCarte();
    this.activerCollisionsDesCalques();
    this.configurerMonde();

    // -------------------------------------------------------
    // PORTES et OBJETS
    // -------------------------------------------------------
    if (this.currentMap === 'mapcentral') {
      this.creerObjetsMapCentrale();
    } else {
      this.reinitialiserObjetsCarteCentrale();
    }

    this.cameras.main.setZoom(3); // zoom RPG rapproché

    this.creerJoueur();
    this.ajouterCollisionsCalques();

    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.toucheP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    if (this.merlin) {
      this.physics.add.collider(this.player, this.merlin);
    }

    // Systeme de dialogue
    this.dialogueActif = false;
    this.dialogueEtape = 0;
    this.dialogueUI = null;

    // Configurer la caméra pour suivre le joueur (après création du joueur)
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.ignore(this.children.list);

    // Animations de marche (4 directions) + idle face
    creerAnimationsDuPerso(this);

    this.creerAnimationPorte('porte_air', 'anim_ouvreporte_air', 0, 5);
    this.creerAnimationPorte('porte_air', 'anim_fermeporte_air', 5, 0);
    this.creerAnimationPorte('porte_feu', 'anim_ouvreporte_feu', 0, 5);
    this.creerAnimationPorte('porte_feu', 'anim_fermeporte_feu', 5, 0);
    this.creerAnimationPorte('porte_glace', 'anim_ouvreporte_glace', 0, 5);
    this.creerAnimationPorte('porte_glace', 'anim_fermeporte_glace', 5, 0);
  }

  chargerCalquesCarte() {
    if (this.currentMap === 'map_eau') {
      // Carte eau : un seul tileset et un seul calque
      this.tileset1 = this.map.addTilesetImage('Map eau', 'tileset_16x16_interior');
      this.tilesets = [this.tileset1];
      this.calqueFond = this.map.createLayer('calques eau', this.tilesets, 0, 0);
      this.calqueFond.setDepth(30);
      this.calqueMilieu = null;
      this.calqueHaut = null;
      this.calqueQuatre = null;
      return;
    }

    // Cartes principales : 4 tilesets, jusqu'à 4 calques
    this.tileset1 = this.map.addTilesetImage('First Asset pack', 'First Asset pack');
    this.tileset2 = this.map.addTilesetImage('TilesA2', 'TilesA2');
    this.tileset3 = this.map.addTilesetImage('terrain', 'terrain');
    this.tileset4 = this.map.addTilesetImage('ChatGPT Image 17 mars 2026, 10_34_01', 'ChatGPT Image 17 mars 2026, 10_34_01');
    this.tilesets = [this.tileset1, this.tileset2, this.tileset3, this.tileset4];

    this.calqueHaut = this.chargerCalque('Calque de Tuiles 3', 10);
    this.calqueFond = this.chargerCalque(['Calque de Tuiles 1', 'Calque_nuage'], 30);
    this.calqueMilieu = this.chargerCalque(['Calque de Tuiles 2', 'calque_surface'], 40);
    this.calqueQuatre = this.chargerCalque('Calque de Tuiles 4', 50);
  }

  chargerCalque(nomsDeCalque, profondeur) {
    const noms = Array.isArray(nomsDeCalque) ? nomsDeCalque : [nomsDeCalque];

    for (const nomDuCalque of noms) {
      if (this.map.getLayerIndex(nomDuCalque) === null) {
        continue;
      }

      const calque = this.map.createLayer(nomDuCalque, this.tilesets, 0, 0);
      calque.setDepth(profondeur);
      return calque;
    }

    return null;
  }

  activerCollisionsDesCalques() {
    [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre].forEach((layer) => {
      if (!layer) {
        return;
      }

      layer.forEachTile((tile) => {
        const prop = tile.properties?.estsolide;
        if (prop === true || prop === "true") {
          tile.setCollision(true);
        }
      });
    });
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
      texture: 'porte_glace',
      x: 588 - this.map.tileWidth,
      y: 228 + this.map.tileHeight * 7,
      largeur: largeurPorte,
      hauteur: hauteurPorte,
      profondeur: profondeurObjet
    });

    // Zone pont (rester 2 secondes dessus = téléport vers la carte eau)
    this.zoneTeleportPont = this.add.zone(252, 504, this.map.tileWidth * 3, this.map.tileHeight);
    this.physics.add.existing(this.zoneTeleportPont, true);
    this.timerTeleportPont = null;

    // PNJ Merlin
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
    this.zoneTeleportPont = null;
    this.timerTeleportPont = null;
    this.merlin = null;
  }

  creerJoueur() {
    const px = this.playerStartX;
    const py = this.playerStartY;

    // Créer le joueur à la position de spawn
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
    this.player.setDepth(100); // Toujours au-dessus des calques
  }

  ajouterCollisionsCalques() {
    [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre].forEach((layer) => {
      if (layer) {
        this.physics.add.collider(this.player, layer);
      }
    });
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
    // Touche P : retour à l'accueil (la scène reste en mémoire)
    if (Phaser.Input.Keyboard.JustDown(this.toucheP)) {
      this.registry.set('resumeKey', 'selection');
      this.scene.pause('selection');
      this.scene.run('accueil');
      this.scene.bringToTop('accueil');
      return;
    }

    // Bloquer le mouvement pendant le dialogue
    if (this.dialogueActif) {
      this.player.setVelocity(0);
      this.player.anims.play('anim_face');
      this.handleMerlinDialogue();
      return;
    }

    this.player.setVelocity(0);

    const speed = 100; // Vitesse réduite
    let isMoving = false;

    if (this.clavier.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('anim_tourne_droite', true);
      isMoving = true;
    }
    else if (this.clavier.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('anim_tourne_gauche', true);
      isMoving = true;
    }
    else if (this.clavier.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      isMoving = true;
    }
    else if (this.clavier.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_bas', true);
      isMoving = true;
    }

    if (!isMoving) {
      this.player.anims.play('anim_face');
    }

    this.handleDoorInteraction();
    this.handleDoorFeuInteraction();
    this.handleDoorGlaceInteraction();
    this.handleTeleportPont();
    this.handleMerlinInteraction();

    // Vérifier les transitions de carte
    this.checkMapTransitions();
  }

  // === PORTES : Espace pour ouvrir/fermer, entrer dans la zone du haut pour changer de scène ===

  handleDoorInteraction() {
    this.gererInteractionPorte({
      porte: this.porteAir,
      zoneEntree: this.zoneEntreePorteAir,
      sceneAction: () => {
        this.scene.restart({ map: 'map_air', startX: 120, startY: 320 });
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
        this.scene.start('niveaufeu', { startX: 768, startY: 736 });
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
        this.scene.start('niveauglace', { startX: 12, startY: 300 });
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
    const estDansEntree = zoneEntree
      ? this.physics.overlap(this.player, zoneEntree)
      : false;

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

  // Rester 2 secondes sur le pont = téléportation vers la carte eau
  handleTeleportPont() {
    if (!this.zoneTeleportPont || this.currentMap !== 'mapcentral' || this.teleportEnCours) {
      return;
    }

    const estDansZone = this.physics.overlap(this.player, this.zoneTeleportPont);

    if (estDansZone) {
      if (!this.timerTeleportPont) {
        this.timerTeleportPont = this.time.delayedCall(2000, () => {
          if (!this.teleportEnCours) {
            this.teleportEnCours = true;
            this.scene.start('mapeau', { startX: 120, startY: 320 });
          }
        });
      }
    } else if (this.timerTeleportPont) {
      this.timerTeleportPont.remove();
      this.timerTeleportPont = null;
    }
  }

  checkMapTransitions() {
    // Téléporte le joueur quand il atteint les bords de la carte
    // Pour mapcentral vers map_air
    if (this.currentMap === 'mapcentral' && this.player.x > 1400 && this.player.y < 200) {
      this.scene.restart({ map: 'map_air', startX: 50, startY: 300 });
    }
    // Pour mapcentral vers glace
    else if (this.currentMap === 'mapcentral' && this.player.x < 100 && this.player.y > 1400) {
      this.scene.start('niveauglace', { startX: 0, startY: 50 });
    }
    // Retour à mapcentral depuis map_air
    else if (this.currentMap === 'map_air' && this.player.x < 50) {
      this.scene.restart({ map: 'mapcentral', startX: 1400, startY: 200 });
    }
    // Retour à mapcentral depuis glace
    else if (this.currentMap === 'glace' && this.player.y < 50) {
      this.scene.restart({ map: 'mapcentral', startX: 100, startY: 1400 });
    }
  }

  // === SYSTEME DE DIALOGUE MERLIN ===

  handleMerlinInteraction() {
    if (!this.merlin || this.currentMap !== 'mapcentral' || this.dialogueActif) return;

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.merlin.x, this.merlin.y);
    if (dist < 40 && Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
      this.ouvrirDialogueMerlin();
    }
  }

  ouvrirDialogueMerlin() {
    this.dialogueActif = true;
    this.dialogueEtape = 0;

    this.dialoguePages = [
      "Ah... te voici enfin. Les vents anciens murmuraient deja ton arrivee, voyageur.",
      "Je suis Merlin, gardien des quatre royaumes et veilleur des equilibres brises.",
      "L'air, l'eau, le feu et la glace portent chacun une blessure que nul n'a su apaiser.",
      "Choisis avec sagesse. Chaque royaume mettra ton courage a l'epreuve."
    ];
    this.afficherDialogueTexte(this.dialoguePages[0]);
  }

  obtenirFrameMerlinPourEtape(etape) {
    const frames = [2, 2, 3, 3];
    return frames[etape] ?? frames[frames.length - 1];
  }

  obtenirDecalageMerlinFrame(frame) {
    const decalages = {
      1: { x: 28, y: 1 },
      2: { x: 34, y: 0 },
      3: { x: 35, y: 0 },
      4: { x: 31, y: 1 }
    };

    return decalages[frame] ?? { x: 0, y: 0 };
  }

  creerFenetreDialogue(hauteur, frameMerlin = 0) {
    this.fermerDialogueUI();

    const W = this.scale.width;
    const H = this.scale.height;
    const panW = Math.min(760, W * 0.82);
    const panH = hauteur;
    const panX = W / 2;
    const panY = H / 2;

    this.dialogueElements = [];

    const ombre = this.add.rectangle(0, 0, W, H, 0x000000, 0.72).setOrigin(0, 0).setDepth(1000);
    const fond = this.add.rectangle(panX, panY, panW, panH, 0x0d1533).setStrokeStyle(3, 0x8888ff).setDepth(1001);
    const titre = this.add.text(panX, panY - panH / 2 + 28, 'Merlin', {
      font: 'bold 26px serif',
      fill: '#f5c842'
    }).setOrigin(0.5).setDepth(1002);
    const portraitX = panX - panW / 2 + 94;
    const portraitY = panY;
    const decalagePortrait = this.obtenirDecalageMerlinFrame(frameMerlin);
    const portraitFond = this.add.rectangle(portraitX, portraitY, 96, 132, 0x101b3a)
      .setStrokeStyle(2, 0x6699ff).setDepth(1002);
    const portrait = this.add.sprite(
      portraitX - 18 + decalagePortrait.x,
      portraitY + 10 + decalagePortrait.y,
      'merlin_dialogue'
    )
      .setOrigin(0.42, 0.6)
      .setScale(0.46)
      .setDepth(1003);
    portrait.setFrame(frameMerlin);
    const portraitMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
    portraitMaskShape.fillRect(portraitX - 48, portraitY - 66, 96, 132);
    portrait.setMask(portraitMaskShape.createGeometryMask());

    this.dialogueElements.push(ombre, fond, titre, portraitFond, portrait);
    this.cameras.main.ignore(this.dialogueElements);
    return { panW, panH, panX, panY };
  }

  afficherDialogueTexte(texte) {
    const frameMerlin = this.obtenirFrameMerlinPourEtape(this.dialogueEtape);
    const { panW, panH, panX, panY } = this.creerFenetreDialogue(320, frameMerlin);

    const contenu = this.add.text(panX - panW / 2 + 190, panY - 74, texte, {
      font: '22px Arial',
      fill: '#f2f5ff',
      wordWrap: { width: panW - 240 },
      lineSpacing: 10
    }).setDepth(1003);

    const suite = this.add.text(panX, panY + panH / 2 - 30, '[ESPACE] pour continuer', {
      font: '18px Arial',
      fill: '#9ab0dd'
    }).setOrigin(0.5).setDepth(1003);

    this.dialogueElements.push(contenu, suite);
    this.cameras.main.ignore([contenu, suite]);
  }

  afficherChoixRoyaumes(avecExit) {
    const { panW, panH, panX, panY } = this.creerFenetreDialogue(340, 2);

    const titre = this.add.text(panX - panW / 2 + 190, panY - 86, 'Quel royaume veux-tu explorer ?', {
      font: '22px Arial',
      fill: '#f2f5ff'
    }).setDepth(1003);
    this.dialogueElements.push(titre);

    const royaumes = [
      { nom: 'Air', couleur: '#88ccff', quete: "Le royaume de l'air est assailli par des tempetes eternelles. Barbe Blanche t'attend la-bas." },
      { nom: 'Eau', couleur: '#4488ff', quete: "Le royaume de l'eau est envahi par des creatures des profondeurs. Luffy t'attend la-bas." },
      { nom: 'Feu', couleur: '#ff6644', quete: "Le royaume du feu est devore par les flammes du chaos. Ace t'attend la-bas." },
      { nom: 'Glace', couleur: '#aaeeff', quete: "Le royaume de glace est pris par un hiver sans fin. Aokiji t'attend la-bas." }
    ];

    const btnW = 120;
    const btnH = 44;
    const btnY = panY + 8;

    royaumes.forEach((r, i) => {
      const bx = panX - 192 + i * 128;
      const btnFond = this.add.rectangle(bx, btnY, btnW, btnH, 0x243554, 0.95)
        .setStrokeStyle(2, 0xd6e2ff).setDepth(1003);
      btnFond.setInteractive({ useHandCursor: true });

      const btnTexte = this.add.text(bx, btnY, r.nom, {
        font: '18px Arial',
        fill: r.couleur
      }).setOrigin(0.5).setDepth(1004);

      btnFond.on('pointerover', () => btnFond.setFillStyle(0x35507d, 1));
      btnFond.on('pointerout', () => btnFond.setFillStyle(0x243554, 0.95));
      btnFond.on('pointerdown', () => {
        this.dialogueEtape = 10;
        this.queteChoisie = r;
        this.afficherDialogueTexte(r.quete);
      });

      this.dialogueElements.push(btnFond, btnTexte);
    });

    if (avecExit) {
      const exitTexte = this.add.text(panX, panY + panH / 2 - 26, '[E] Quitter', {
        font: '18px Arial',
        fill: '#ff9a9a'
      }).setOrigin(0.5).setDepth(1003);
      this.dialogueElements.push(exitTexte);
    }

    this.cameras.main.ignore(this.dialogueElements);
  }

  afficherAdieu() {
    const { panW, panH, panX, panY } = this.creerFenetreDialogue(320, 3);

    const texte = this.add.text(
      panX - panW / 2 + 190,
      panY - 74,
      "Bonne chance ! Barbe Blanche (air), Luffy (eau), Ace (feu), Aokiji (glace).",
      {
        font: '22px Arial',
        fill: '#f2f5ff',
        wordWrap: { width: panW - 240 },
        lineSpacing: 10
      }
    ).setDepth(1003);

    const suite = this.add.text(panX, panY + panH / 2 - 30, '[ESPACE] pour fermer', {
      font: '18px Arial',
      fill: '#9ab0dd'
    }).setOrigin(0.5).setDepth(1003);

    this.dialogueElements.push(texte, suite);
    this.cameras.main.ignore([texte, suite]);
    this.dialogueEtape = 99;
  }

  handleMerlinDialogue() {
    if (!this.dialogueActif) return;

    // Pages d'intro (etapes 0-3) : Espace pour avancer
    if (this.dialogueEtape < this.dialoguePages.length - 1) {
      if (Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
        this.dialogueEtape++;
        this.afficherDialogueTexte(this.dialoguePages[this.dialogueEtape]);
      }
    }
    // Derniere page d'intro -> afficher choix
    else if (this.dialogueEtape === this.dialoguePages.length - 1) {
      if (Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
        this.dialogueEtape = 5;
        this.afficherChoixRoyaumes(false);
      }
    }
    // Menu choix (premier affichage, sans exit)
    else if (this.dialogueEtape === 5) {
      // Les clics souris gerent le choix, rien a faire ici
    }
    // Apres avoir lu la quete -> retour au menu avec Exit
    else if (this.dialogueEtape === 10) {
      if (Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
        this.dialogueEtape = 11;
        this.afficherChoixRoyaumes(true);
      }
    }
    // Menu avec Exit
    else if (this.dialogueEtape === 11) {
      if (Phaser.Input.Keyboard.JustDown(this.toucheE)) {
        this.afficherAdieu();
      }
    }
    // Message d'adieu -> fermer
    else if (this.dialogueEtape === 99) {
      if (Phaser.Input.Keyboard.JustDown(this.toucheEspace)) {
        this.fermerDialogueUI();
        this.dialogueActif = false;
      }
    }
  }

  fermerDialogueUI() {
    if (this.dialogueElements) {
      this.dialogueElements.forEach(el => el.destroy());
      this.dialogueElements = null;
    }
    if (this.dialogueUI) {
      this.dialogueUI.destroy(true);
      this.dialogueUI = null;
    }
  }
}
