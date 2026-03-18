
export default class selection extends Phaser.Scene {
 
  constructor() {
     super({key : "selection"}); // mettre le meme nom que le nom de la classe
  }

  init(data) {
    this.currentMap = data.map || 'mapcentral';
    this.playerStartX = data.startX || 100;
    this.playerStartY = data.startY || 450;
    this.teleportEnCours = false;
  }

  loadMap(mapKey) {
    // Supprimer les anciens éléments si existants
    if (this.map) this.map.destroy();
    if (this.calqueFond) this.calqueFond.destroy();
    if (this.calqueMilieu) this.calqueMilieu.destroy();
    if (this.calqueHaut) this.calqueHaut.destroy();
    if (this.porteAir) this.porteAir.destroy();
    if (this.ombrePorteAir) this.ombrePorteAir.destroy();
    if (this.zoneEntreePorteAir) this.zoneEntreePorteAir.destroy();
    if (this.porteFeu) this.porteFeu.destroy();
    if (this.ombrePorteFeu) this.ombrePorteFeu.destroy();
    if (this.zoneEntreePorteFeu) this.zoneEntreePorteFeu.destroy();
    if (this.porteGlace) this.porteGlace.destroy();
    if (this.ombrePorteGlace) this.ombrePorteGlace.destroy();
    if (this.zoneEntreePorteGlace) this.zoneEntreePorteGlace.destroy();
    if (this.zoneTeleportPont) this.zoneTeleportPont.destroy();
    if (this.merlin) this.merlin.destroy();

    if (this.calqueQuatre) this.calqueQuatre.destroy();

    // Créer la nouvelle carte
    this.map = this.make.tilemap({ key: mapKey });
    this.tileset1 = this.map.addTilesetImage('First Asset pack', 'First Asset pack');
    this.tileset2 = this.map.addTilesetImage('TilesA2', 'TilesA2');
    this.tileset3 = this.map.addTilesetImage('terrain', 'terrain');
    this.tilesets = [this.tileset1, this.tileset2, this.tileset3];

    // Création des calques dans l'ordre voulu (3 d'abord, puis 1, 2, 4)
    // Calque 3 (secondaire, doit être en-dessous)
    if (this.map.getLayerIndex('Calque de Tuiles 3') !== null) {
      this.calqueHaut = this.map.createLayer('Calque de Tuiles 3', this.tilesets, 0, 0);
      this.calqueHaut.setDepth(10); // profondeur basse
    } else {
      this.calqueHaut = null;
    }
    // Calque 1 (primaire)
    if (this.map.getLayerIndex('Calque de Tuiles 1') !== null) {
      this.calqueFond = this.map.createLayer('Calque de Tuiles 1', this.tilesets, 0, 0);
      this.calqueFond.setDepth(30);
    } else if (this.map.getLayerIndex('Calque_nuage') !== null) {
      this.calqueFond = this.map.createLayer('Calque_nuage', this.tilesets, 0, 0);
      this.calqueFond.setDepth(30);
    } else {
      this.calqueFond = null;
    }
    // Calque 2 (primaire)
    if (this.map.getLayerIndex('Calque de Tuiles 2') !== null) {
      this.calqueMilieu = this.map.createLayer('Calque de Tuiles 2', this.tilesets, 0, 0);
      this.calqueMilieu.setDepth(40);
    } else if (this.map.getLayerIndex('calque_surface') !== null) {
      this.calqueMilieu = this.map.createLayer('calque_surface', this.tilesets, 0, 0);
      this.calqueMilieu.setDepth(40);
    } else {
      this.calqueMilieu = null;
    }
    // Calque 4 (primaire)
    if (this.map.getLayerIndex('Calque de Tuiles 4') !== null) {
      this.calqueQuatre = this.map.createLayer('Calque de Tuiles 4', this.tilesets, 0, 0);
      this.calqueQuatre.setDepth(50);
    } else {
      this.calqueQuatre = null;
    }

    // Collisions sur tous les calques présents
    const setSolidOnLayer = (layer) => {
      if (!layer) return;
      layer.forEachTile((tile) => {
        const prop = tile.properties?.estsolide;
        if (prop === true || prop === "true") {
          tile.setCollision(true);
        }
      });
    };
    setSolidOnLayer(this.calqueFond);
    setSolidOnLayer(this.calqueMilieu);
    setSolidOnLayer(this.calqueHaut);
    setSolidOnLayer(this.calqueQuatre);

    // Configurer la caméra
    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    if (mapKey === 'mapcentral') {
      // Porte animable sur le modele du tutoriel : sprite statique + frames
      const doorX = 52 - this.map.tileWidth * 3;
      const doorY = 300;
      const doorWidth = this.map.tileWidth * 3.5;
      const doorHeight = this.map.tileHeight * 2.4;

      this.ombrePorteAir = this.add.ellipse(doorX, doorY - 2, doorWidth - 10, 10, 0x000000, 0.22);
      this.ombrePorteAir.setDepth(this.calqueMilieu ? this.calqueMilieu.depth : 40);

      this.porteAir = this.physics.add.staticSprite(doorX, doorY, 'porte_air', 0);
      this.porteAir.setOrigin(0.5, 1);
      this.porteAir.setDisplaySize(doorWidth, doorHeight);
      this.porteAir.refreshBody();
      this.porteAir.body.setSize(doorWidth - 14, doorHeight - 10, true);
      this.porteAir.setDepth(this.calqueMilieu ? this.calqueMilieu.depth : 40);
      this.porteAir.ouverte = false;
      this.porteAir.enAnimation = false;

      this.zoneEntreePorteAir = this.add.zone(doorX, doorY - doorHeight + 16, doorWidth - 24, 16);
      this.physics.add.existing(this.zoneEntreePorteAir, true);

      // Porte Feu - meme modele que porte_air
      const doorFeuX = 300;
      const doorFeuWidth = this.map.tileWidth * 3.5;
      const doorFeuHeight = this.map.tileHeight * 2.4;
      const doorFeuY = doorFeuHeight;

      this.ombrePorteFeu = this.add.ellipse(doorFeuX, doorFeuY - 2, doorFeuWidth - 10, 10, 0x000000, 0.22);
      this.ombrePorteFeu.setDepth(this.calqueMilieu ? this.calqueMilieu.depth : 40);

      this.porteFeu = this.physics.add.staticSprite(doorFeuX, doorFeuY, 'porte_feu', 0);
      this.porteFeu.setOrigin(0.5, 1);
      this.porteFeu.setDisplaySize(doorFeuWidth, doorFeuHeight);
      this.porteFeu.refreshBody();
      this.porteFeu.body.setSize(doorFeuWidth - 14, doorFeuHeight - 10, true);
      this.porteFeu.setDepth(this.calqueMilieu ? this.calqueMilieu.depth : 40);
      this.porteFeu.ouverte = false;
      this.porteFeu.enAnimation = false;

      this.zoneEntreePorteFeu = this.add.zone(doorFeuX, doorFeuY - doorFeuHeight + 16, doorFeuWidth - 24, 16);
      this.physics.add.existing(this.zoneEntreePorteFeu, true);

      // Porte Glace - meme modele que porte_air
      const doorGlaceX = 588 - this.map.tileWidth * 1;
      const doorGlaceY = 228 + this.map.tileHeight * 7;
      const doorGlaceWidth = this.map.tileWidth * 3.5;
      const doorGlaceHeight = this.map.tileHeight * 2.4;

      this.ombrePorteGlace = this.add.ellipse(doorGlaceX, doorGlaceY - 2, doorGlaceWidth - 10, 10, 0x000000, 0.22);
      this.ombrePorteGlace.setDepth(this.calqueMilieu ? this.calqueMilieu.depth : 40);

      this.porteGlace = this.physics.add.staticSprite(doorGlaceX, doorGlaceY, 'porte_glace', 0);
      this.porteGlace.setOrigin(0.5, 1);
      this.porteGlace.setDisplaySize(doorGlaceWidth, doorGlaceHeight);
      this.porteGlace.refreshBody();
      this.porteGlace.body.setSize(doorGlaceWidth - 14, doorGlaceHeight - 10, true);
      this.porteGlace.setDepth(this.calqueMilieu ? this.calqueMilieu.depth : 40);
      this.porteGlace.ouverte = false;
      this.porteGlace.enAnimation = false;

      this.zoneEntreePorteGlace = this.add.zone(doorGlaceX, doorGlaceY - doorGlaceHeight + 16, doorGlaceWidth - 24, 16);
      this.physics.add.existing(this.zoneEntreePorteGlace, true);

      // Zone de teleportation automatique au bout du pont
      const pontX = 252;
      const pontY = 504;
      const pontWidth = this.map.tileWidth * 3;
      const pontHeight = this.map.tileHeight * 1;
      this.zoneTeleportPont = this.add.zone(pontX, pontY, pontWidth, pontHeight);
      this.physics.add.existing(this.zoneTeleportPont, true);
      this.timerTeleportPont = null;

      // PNJ Merlin
      this.merlin = this.physics.add.staticSprite(324, 348 + this.map.tileHeight * 2, 'merlin');
      this.merlin.setOrigin(0.5, 1);
      this.merlin.setDisplaySize(this.map.tileWidth * 3.2, this.map.tileHeight * 4);
      this.merlin.refreshBody();
      this.merlin.setDepth(100);
    } else {
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

    // Calcul du zoom pour remplir l'écran sans bordures noires
    let zoomX = window.innerWidth / mapWidth;
    let zoomY = window.innerHeight / mapHeight;
    let zoom = Math.min(zoomX, zoomY);
    // Si la map est plus petite que l'écran, zoom maximal sans dépasser la map
    if (mapWidth < window.innerWidth || mapHeight < window.innerHeight) {
      zoom = Math.max(zoomX, zoomY);
    }
    // Zoom très rapproché sur le joueur (effet RPG)
    this.cameras.main.setZoom(2.5);

    // Ne pas faire startFollow ici, il sera fait après la création du joueur dans create()
  }

  preload() {
    this.load.spritesheet("droite_perso", "src/assets/playerRight.png", {
        frameWidth: 48,
        frameHeight: 68
      }); 
    this.load.spritesheet("gauche_perso", "src/assets/playerLeft.png", {
        frameWidth: 48,
        frameHeight: 68
      }); 
    this.load.spritesheet("haut_perso", "src/assets/playerUp.png", {
        frameWidth: 48,
        frameHeight: 68
      }); 
    this.load.spritesheet("bas_perso", "src/assets/playerDown.png", {
        frameWidth: 48,
        frameHeight: 68
      }); 
    this.load.audio('musique', 'src/assets/theme.wav');
    this.load.image('merlin', 'src/assets/Merlin.png');

    // Charger les cartes
    this.load.tilemapTiledJSON('mapcentral', 'src/assets/mapcentral..tmj');
    this.load.tilemapTiledJSON('map_air', 'src/assets/map_air.tmj');
    this.load.tilemapTiledJSON('glace', 'src/assets/glace.json');
    this.load.tilemapTiledJSON('mapeau', 'src/assets/map eau.tmj');
    this.load.image('First Asset pack', 'src/assets/First Asset pack.png');
    this.load.image('TilesA2', 'src/assets/TilesA2.png');
    this.load.image('terrain', 'src/assets/terrain.png');
    this.load.image('nuage', 'src/assets/nuage.png');
    this.load.image('surface', 'src/assets/surface.png');
    this.load.image('haut', 'src/assets/haut.png');
    this.load.image('quatre', 'src/assets/quatre.png');
    this.load.spritesheet('porte_air', 'src/assets/porte_air.png', {
      frameWidth: 96,
      frameHeight: 120
    });
    this.load.spritesheet('porte_feu', 'src/assets/porte_feu.png', {
      frameWidth: 96,
      frameHeight: 120
    });
    this.load.spritesheet('porte_glace', 'src/assets/porte_glace.png', {
      frameWidth: 96,
      frameHeight: 120
    });
  }

  create() {
    this.son_musique = this.sound.add('musique');
    this.son_musique.play();

    // Charger la carte initiale AVANT de créer le joueur
    this.loadMap(this.currentMap);

    // Chercher une position non solide autour du point de départ
    let startX = this.playerStartX;
    let startY = this.playerStartY;
    if (!startX || startX < 0 || startX > this.map.widthInPixels) {
      startX = this.map.widthInPixels / 2;
    }
    if (!startY || startY < 0 || startY > this.map.heightInPixels) {
      startY = this.map.heightInPixels / 2;
    }
    // Trouver une tuile non solide autour du point de départ
    const tileSize = this.map.tileWidth;
    let found = false;
    let px = startX, py = startY;
    for (let r = 0; r < 10 && !found; r++) {
      for (let dx = -r; dx <= r && !found; dx++) {
        for (let dy = -r; dy <= r && !found; dy++) {
          let tx = Math.floor((startX / tileSize) + dx);
          let ty = Math.floor((startY / tileSize) + dy);
          if (tx < 0 || ty < 0 || tx >= this.map.width || ty >= this.map.height) continue;
          let blocked = false;
          [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre].forEach(layer => {
            if (layer) {
              const tile = layer.getTileAt(tx, ty);
              if (tile && (tile.properties?.estsolide === true || tile.properties?.estsolide === "true")) blocked = true;
            }
          });
          if (!blocked) {
            px = tx * tileSize + tileSize / 2;
            py = ty * tileSize + tileSize / 2;
            found = true;
          }
        }
      }
    }
    // Créer le joueur à la position trouvée
    if (this.textures.exists('bas_perso')) {
      this.player = this.physics.add.sprite(px, py, 'bas_perso');
    } else {
      this.player = this.add.rectangle(px, py, 32, 32, 0xff0000);
      this.physics.add.existing(this.player);
    }
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(100); // Toujours au-dessus des calques

    // Collisions joueur <-> calques solides
    if (this.calqueFond) {
      this.physics.add.collider(this.player, this.calqueFond);
    }
    if (this.calqueMilieu) {
      this.physics.add.collider(this.player, this.calqueMilieu);
    }
    if (this.calqueHaut) {
      this.physics.add.collider(this.player, this.calqueHaut);
    }
    
    

    this.clavier = this.input.keyboard.createCursorKeys();
    this.toucheEspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.toucheE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Collision avec Merlin
    if (this.merlin) {
      this.physics.add.collider(this.player, this.merlin);
    }

    // Systeme de dialogue
    this.dialogueActif = false;
    this.dialogueEtape = 0;
    this.dialogueUI = null;

    // Configurer la caméra pour suivre le joueur (après création du joueur)
    // Caméra : centrage plus rapide et fluide sur le joueur
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    this.anims.create({
        key: "anim_tourne_gauche", // key est le nom de l'animation : doit etre unique poru la scene.
        frames: this.anims.generateFrameNumbers("gauche_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
        frameRate: 10, // vitesse de défilement des frames
        repeat: -1 // nombre de répétitions de l'animation. -1 = infini
      }); 
    this.anims.create({
        key: "anim_tourne_droite", // key est le nom de l'animation : doit etre unique poru la scene.
        frames: this.anims.generateFrameNumbers("droite_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
        frameRate: 10, // vitesse de défilement des frames
        repeat: -1 // nombre de répétitions de l'animation. -1 = infini
      }); 
    this.anims.create({
        key: "anim_tourne_haut", // key est le nom de l'animation : doit etre unique poru la scene.
        frames: this.anims.generateFrameNumbers("haut_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
        frameRate: 10, // vitesse de défilement des frames
        repeat: -1 // nombre de répétitions de l'animation. -1 = infini
      }); 
    this.anims.create({
        key: "anim_tourne_bas", // key est le nom de l'animation : doit etre unique poru la scene.
        frames: this.anims.generateFrameNumbers("bas_perso", { start: 0, end: 3 }), // on prend toutes les frames de img perso numerotées de 0 à 3
        frameRate: 10, // vitesse de défilement des frames
        repeat: -1 // nombre de répétitions de l'animation. -1 = infini
      }); 
    this.anims.create({
        key: "anim_face",
        frames: [{ key: "bas_perso", frame: 0 }],
        frameRate: 20
      }); 

    if (!this.anims.exists('anim_ouvreporte_air')) {
      this.anims.create({
        key: 'anim_ouvreporte_air',
        frames: this.anims.generateFrameNumbers('porte_air', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
      });
    }

    if (!this.anims.exists('anim_fermeporte_air')) {
      this.anims.create({
        key: 'anim_fermeporte_air',
        frames: this.anims.generateFrameNumbers('porte_air', { start: 5, end: 0 }),
        frameRate: 10,
        repeat: 0
      });
    }

    if (!this.anims.exists('anim_ouvreporte_feu')) {
      this.anims.create({
        key: 'anim_ouvreporte_feu',
        frames: this.anims.generateFrameNumbers('porte_feu', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
      });
    }

    if (!this.anims.exists('anim_fermeporte_feu')) {
      this.anims.create({
        key: 'anim_fermeporte_feu',
        frames: this.anims.generateFrameNumbers('porte_feu', { start: 5, end: 0 }),
        frameRate: 10,
        repeat: 0
      });
    }

    if (!this.anims.exists('anim_ouvreporte_glace')) {
      this.anims.create({
        key: 'anim_ouvreporte_glace',
        frames: this.anims.generateFrameNumbers('porte_glace', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
      });
    }

    if (!this.anims.exists('anim_fermeporte_glace')) {
      this.anims.create({
        key: 'anim_fermeporte_glace',
        frames: this.anims.generateFrameNumbers('porte_glace', { start: 5, end: 0 }),
        frameRate: 10,
        repeat: 0
      });
    }

  }

  update() {
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

    // Vérifier les mouvements diagonaux et cardinaux
    if (this.clavier.right.isDown && this.clavier.up.isDown) {
      // Diagonal haut-droite
      this.player.setVelocityX(speed);
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      isMoving = true;
    } 
    else if (this.clavier.right.isDown && this.clavier.down.isDown) {
      // Diagonal bas-droite
      this.player.setVelocityX(speed);
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_droite', true);
      isMoving = true;
    } 
    else if (this.clavier.left.isDown && this.clavier.up.isDown) {
      // Diagonal haut-gauche
      this.player.setVelocityX(-speed);
      this.player.setVelocityY(-speed);
      this.player.anims.play('anim_tourne_haut', true);
      isMoving = true;
    } 
    else if (this.clavier.left.isDown && this.clavier.down.isDown) {
      // Diagonal bas-gauche
      this.player.setVelocityX(-speed);
      this.player.setVelocityY(speed);
      this.player.anims.play('anim_tourne_gauche', true);
      isMoving = true;
    }
    else if (this.clavier.right.isDown) {
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

  handleDoorInteraction() {
    if (!this.porteAir || this.currentMap !== 'mapcentral') {
      return;
    }

    const estSurLaPorte = this.physics.overlap(this.player, this.porteAir);
    const estDansEntree = this.zoneEntreePorteAir
      ? this.physics.overlap(this.player, this.zoneEntreePorteAir)
      : false;

    if (estSurLaPorte && Phaser.Input.Keyboard.JustDown(this.toucheEspace) && !this.porteAir.enAnimation) {
      if (this.porteAir.ouverte === false) {
        this.ouvrirPorteAir();
      } else {
        this.fermerPorteAir();
      }
    }

    if (estDansEntree && this.porteAir.ouverte && !this.teleportEnCours) {
      this.teleportEnCours = true;
      this.time.delayedCall(150, () => {
        this.scene.restart({ map: 'map_air', startX: 120, startY: 320 });
      });
    }
  }

  ouvrirPorteAir() {
    if (!this.porteAir) {
      return;
    }

    this.porteAir.enAnimation = true;
    this.porteAir.anims.play('anim_ouvreporte_air');
    this.porteAir.once('animationcomplete', () => {
      this.porteAir.ouverte = true;
      this.porteAir.enAnimation = false;
      this.porteAir.setFrame(5);
    });
  }

  fermerPorteAir() {
    if (!this.porteAir) {
      return;
    }

    this.porteAir.enAnimation = true;
    this.porteAir.anims.play('anim_fermeporte_air');
    this.porteAir.once('animationcomplete', () => {
      this.porteAir.ouverte = false;
      this.porteAir.enAnimation = false;
      this.porteAir.setFrame(0);
    });
  }

  handleDoorFeuInteraction() {
    if (!this.porteFeu || this.currentMap !== 'mapcentral') {
      return;
    }

    const estSurLaPorte = this.physics.overlap(this.player, this.porteFeu);
    const estDansEntree = this.zoneEntreePorteFeu
      ? this.physics.overlap(this.player, this.zoneEntreePorteFeu)
      : false;

    if (estSurLaPorte && Phaser.Input.Keyboard.JustDown(this.toucheEspace) && !this.porteFeu.enAnimation) {
      if (this.porteFeu.ouverte === false) {
        this.ouvrirPorteFeu();
      } else {
        this.fermerPorteFeu();
      }
    }

    if (estDansEntree && this.porteFeu.ouverte && !this.teleportEnCours) {
      this.teleportEnCours = true;
      this.time.delayedCall(150, () => {
        this.scene.restart({ map: 'glace', startX: 120, startY: 320 });
      });
    }
  }

  ouvrirPorteFeu() {
    if (!this.porteFeu) {
      return;
    }

    this.porteFeu.enAnimation = true;
    this.porteFeu.anims.play('anim_ouvreporte_feu');
    this.porteFeu.once('animationcomplete', () => {
      this.porteFeu.ouverte = true;
      this.porteFeu.enAnimation = false;
      this.porteFeu.setFrame(5);
    });
  }

  fermerPorteFeu() {
    if (!this.porteFeu) {
      return;
    }

    this.porteFeu.enAnimation = true;
    this.porteFeu.anims.play('anim_fermeporte_feu');
    this.porteFeu.once('animationcomplete', () => {
      this.porteFeu.ouverte = false;
      this.porteFeu.enAnimation = false;
      this.porteFeu.setFrame(0);
    });
  }

  handleDoorGlaceInteraction() {
    if (!this.porteGlace || this.currentMap !== 'mapcentral') {
      return;
    }

    const estSurLaPorte = this.physics.overlap(this.player, this.porteGlace);
    const estDansEntree = this.zoneEntreePorteGlace
      ? this.physics.overlap(this.player, this.zoneEntreePorteGlace)
      : false;

    if (estSurLaPorte && Phaser.Input.Keyboard.JustDown(this.toucheEspace) && !this.porteGlace.enAnimation) {
      if (this.porteGlace.ouverte === false) {
        this.ouvrirPorteGlace();
      } else {
        this.fermerPorteGlace();
      }
    }

    if (estDansEntree && this.porteGlace.ouverte && !this.teleportEnCours) {
      this.teleportEnCours = true;
      this.time.delayedCall(150, () => {
        this.scene.start('niveauglace', { startX: 10, startY: 320 });
      });
    }
  }

  ouvrirPorteGlace() {
    if (!this.porteGlace) {
      return;
    }

    this.porteGlace.enAnimation = true;
    this.porteGlace.anims.play('anim_ouvreporte_glace');
    this.porteGlace.once('animationcomplete', () => {
      this.porteGlace.ouverte = true;
      this.porteGlace.enAnimation = false;
      this.porteGlace.setFrame(5);
    });
  }

  fermerPorteGlace() {
    if (!this.porteGlace) {
      return;
    }

    this.porteGlace.enAnimation = true;
    this.porteGlace.anims.play('anim_fermeporte_glace');
    this.porteGlace.once('animationcomplete', () => {
      this.porteGlace.ouverte = false;
      this.porteGlace.enAnimation = false;
      this.porteGlace.setFrame(0);
    });
  }

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
            this.scene.restart({ map: 'map_eau', startX: 120, startY: 320 });
          }
        });
      }
    } else {
      if (this.timerTeleportPont) {
        this.timerTeleportPont.remove();
        this.timerTeleportPont = null;
      }
    }
  }

  checkMapTransitions() {
    // Exemple : si le joueur est à une position spécifique, changer de carte
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
      "Salut jeune aventurier ! Je sens ta soif d'aventure...",
      "Je suis Merlin, le gardien des quatre royaumes.",
      "Chaque royaume est menace par de terribles dangers...",
      "Choisis le royaume que tu veux explorer !"
    ];
    this.afficherDialogueTexte(this.dialoguePages[0]);
  }

  afficherDialogueTexte(texte) {
    this.fermerDialogueUI();

    const cam = this.cameras.main;
    const vw = cam.width / cam.zoom;
    const vh = cam.height / cam.zoom;
    const boxW = vw * 0.94;
    const boxH = 24;
    const boxX = (vw - boxW) / 2;
    const boxY = vh - boxH - 2;

    this.dialogueElements = [];

    const fond = this.add.rectangle(boxX + boxW / 2, boxY + boxH / 2, boxW, boxH, 0x000000, 0.88)
      .setStrokeStyle(1, 0xffffff).setScrollFactor(0).setDepth(1000);

    const nomMerlin = this.add.text(boxX + 5, boxY + 3, 'Merlin :', {
      font: 'bold 9px Arial', fill: '#ffdd44'
    }).setScrollFactor(0).setDepth(1001);

    const contenu = this.add.text(boxX + 48, boxY + 3, texte, {
      font: '8px Arial', fill: '#ffffff', wordWrap: { width: boxW - 70 }
    }).setScrollFactor(0).setDepth(1001);

    const suite = this.add.text(boxX + boxW - 32, boxY + boxH - 9, '[ESPACE]', {
      font: '5px Arial', fill: '#aaaaaa'
    }).setScrollFactor(0).setDepth(1001);

    this.dialogueElements.push(fond, nomMerlin, contenu, suite);
  }

  afficherChoixRoyaumes(avecExit) {
    this.fermerDialogueUI();

    const cam = this.cameras.main;
    const vw = cam.width / cam.zoom;
    const vh = cam.height / cam.zoom;
    const boxW = vw * 0.94;
    const boxH = avecExit ? 34 : 28;
    const boxX = (vw - boxW) / 2;
    const boxY = vh - boxH - 2;

    this.dialogueElements = [];

    const fond = this.add.rectangle(boxX + boxW / 2, boxY + boxH / 2, boxW, boxH, 0x000000, 0.88)
      .setStrokeStyle(1, 0xffffff).setScrollFactor(0).setDepth(1000);
    this.dialogueElements.push(fond);

    const titre = this.add.text(boxX + 5, boxY + 2, 'Merlin : Quel royaume veux-tu explorer ?', {
      font: '7px Arial', fill: '#ffdd44'
    }).setScrollFactor(0).setDepth(1001);
    this.dialogueElements.push(titre);

    const royaumes = [
      { nom: 'Air', couleur: '#88ccff', quete: "Le royaume de l'air est assailli par des tempetes eternelles. Barbe Blanche t'attend la-bas." },
      { nom: 'Eau', couleur: '#4488ff', quete: "Le royaume de l'eau est envahi par des creatures des profondeurs. Luffy t'attend la-bas." },
      { nom: 'Feu', couleur: '#ff6644', quete: "Le royaume du feu est devore par les flammes du chaos. Ace t'attend la-bas." },
      { nom: 'Glace', couleur: '#aaeeff', quete: "Le royaume de glace est pris par un hiver sans fin. Aokiji t'attend la-bas." }
    ];

    const btnW = (boxW - 25) / 4;
    const btnY = boxY + 18;

    royaumes.forEach((r, i) => {
      const bx = boxX + 5 + i * (btnW + 5);
      const btnFond = this.add.rectangle(bx + btnW / 2, btnY, btnW, 10, 0x333333, 0.9)
        .setStrokeStyle(1, 0xffffff).setScrollFactor(0).setDepth(1001);
      btnFond.setInteractive({ useHandCursor: true });

      const btnTexte = this.add.text(bx + btnW / 2, btnY, r.nom, {
        font: '6px Arial', fill: r.couleur
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

      btnFond.on('pointerover', () => btnFond.setFillStyle(0x555555, 1));
      btnFond.on('pointerout', () => btnFond.setFillStyle(0x333333, 0.9));
      btnFond.on('pointerdown', () => {
        this.dialogueEtape = 10;
        this.queteChoisie = r;
        this.afficherDialogueTexte(r.quete);
      });

      this.dialogueElements.push(btnFond, btnTexte);
    });

    if (avecExit) {
      const exitTexte = this.add.text(boxX + boxW / 2, boxY + boxH - 5, '[E] Quitter', {
        font: '5px Arial', fill: '#ff8888'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
      this.dialogueElements.push(exitTexte);
    }
  }

  afficherAdieu() {
    this.fermerDialogueUI();

    const cam = this.cameras.main;
    const vw = cam.width / cam.zoom;
    const vh = cam.height / cam.zoom;
    const boxW = vw * 0.94;
    const boxH = 24;
    const boxX = (vw - boxW) / 2;
    const boxY = vh - boxH - 2;

    this.dialogueElements = [];

    const fond = this.add.rectangle(boxX + boxW / 2, boxY + boxH / 2, boxW, boxH, 0x000000, 0.88)
      .setStrokeStyle(1, 0xffffff).setScrollFactor(0).setDepth(1000);

    const nomMerlin = this.add.text(boxX + 5, boxY + 2, 'Merlin :', {
      font: 'bold 8px Arial', fill: '#ffdd44'
    }).setScrollFactor(0).setDepth(1001);

    const texte = this.add.text(boxX + 5, boxY + 12,
      "Bonne chance ! Barbe Blanche (air), Luffy (eau), Ace (feu), Aokiji (glace).", {
      font: '7px Arial', fill: '#ffffff', wordWrap: { width: boxW - 10 }
    }).setScrollFactor(0).setDepth(1001);

    const suite = this.add.text(boxX + boxW - 32, boxY + boxH - 9, '[ESPACE]', {
      font: '5px Arial', fill: '#aaaaaa'
    }).setScrollFactor(0).setDepth(1001);

    this.dialogueElements.push(fond, nomMerlin, texte, suite);
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
