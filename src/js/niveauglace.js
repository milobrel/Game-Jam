export default class niveauglace extends Phaser.Scene {
  // constructeur de la classe
  constructor() {
    super({
      key: "niveauglace" //  ici on précise le nom de la classe en tant qu'identifiant
    });
  }

  init(data) {
    this.playerStartX = data.startX || 100;
    this.playerStartY = data.startY || 450;
  }

  preload() {
    // Charger les assets du joueur
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
    this.load.audio('passionfruit', 'src/assets/passionfruit.mp3');

    // Charger la tilemap glace
    this.load.tilemapTiledJSON('glace', 'src/assets/glace.json');
    this.load.image('First Asset pack', 'src/assets/First Asset pack.png');
    this.load.image('TilesA2', 'src/assets/TilesA2.png');
    this.load.image('terrain', 'src/assets/terrain.png');
    this.load.image('nuage', 'src/assets/nuage.png');
    this.load.image('surface', 'src/assets/surface.png');
    this.load.image('haut', 'src/assets/haut.png');
    this.load.image('quatre', 'src/assets/quatre.png');
  }

  loadMap(mapKey) {
    // Supprimer les anciens éléments si existants
    if (this.map) this.map.destroy();
    if (this.calqueFond) this.calqueFond.destroy();
    if (this.calqueMilieu) this.calqueMilieu.destroy();
    if (this.calqueHaut) this.calqueHaut.destroy();
    if (this.calqueQuatre) this.calqueQuatre.destroy();

    // Créer la nouvelle carte
    this.map = this.make.tilemap({ key: mapKey });
    this.tileset1 = this.map.addTilesetImage('First Asset pack', 'First Asset pack');
    this.tileset2 = this.map.addTilesetImage('TilesA2', 'TilesA2');
    this.tileset3 = this.map.addTilesetImage('terrain', 'terrain');
    this.tilesets = [this.tileset1, this.tileset2, this.tileset3];

    // Création des calques dans l'ordre voulu
    if (this.map.getLayerIndex('Calque de Tuiles 3') !== null) {
      this.calqueHaut = this.map.createLayer('Calque de Tuiles 3', this.tilesets, 0, 0);
      this.calqueHaut.setDepth(10);
    } else {
      this.calqueHaut = null;
    }
    if (this.map.getLayerIndex('Calque de Tuiles 1') !== null) {
      this.calqueFond = this.map.createLayer('Calque de Tuiles 1', this.tilesets, 0, 0);
      this.calqueFond.setDepth(30);
    } else if (this.map.getLayerIndex('Calque_nuage') !== null) {
      this.calqueFond = this.map.createLayer('Calque_nuage', this.tilesets, 0, 0);
      this.calqueFond.setDepth(30);
    } else {
      this.calqueFond = null;
    }
    if (this.map.getLayerIndex('Calque de Tuiles 2') !== null) {
      this.calqueMilieu = this.map.createLayer('Calque de Tuiles 2', this.tilesets, 0, 0);
      this.calqueMilieu.setDepth(40);
    } else if (this.map.getLayerIndex('calque_surface') !== null) {
      this.calqueMilieu = this.map.createLayer('calque_surface', this.tilesets, 0, 0);
      this.calqueMilieu.setDepth(40);
    } else {
      this.calqueMilieu = null;
    }
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

    // Calcul du zoom
    let zoomX = window.innerWidth / mapWidth;
    let zoomY = window.innerHeight / mapHeight;
    let zoom = Math.min(zoomX, zoomY);
    if (mapWidth < window.innerWidth || mapHeight < window.innerHeight) {
      zoom = Math.max(zoomX, zoomY);
    }
    this.cameras.main.setZoom(2.5);
  }

  create() {
    // Arrêter toutes les musiques actuelles
    this.sound.stopAll();

    // Jouer la musique passionfruit
    this.son_musique = this.sound.add('passionfruit');
    this.son_musique.play();

    // Charger la carte glace
    this.loadMap('glace');
    this.glaceInertia = { x: 0, y: 0 }; // Vélocité persistante pour le glissement
    this.lastWasSlippery = false; // Tracker le mode précédent pour la transition
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
  }

  update() {
    const speed = 100;
    const acceleration = 0.35;
    const friction = 1.0; // Pas de friction sur la glace - on garde la vitesse

    // Vérifier s'il y a contact avec une surface solide
    const onSolidGround = this.player.body.blocked.down || this.player.body.blocked.up ||
                          this.player.body.blocked.left || this.player.body.blocked.right;

    // Vérifier si on est en contact VERTICAL (pour la glisse, les murs latéraux ne comptent pas)
    const onVerticalGround = this.player.body.blocked.down || this.player.body.blocked.up;

    // Vérifier si le joueur est proche d'une tuile solide
    const nearSolidGround = this.isNearSolidTile();

    // Vérifier si le sol actuel est glissant (a la propriété estglissant = true)
    const onSlipperyGround = this.isOnSlipperyTile();

    // SI ON VIENT DE PASSER EN MODE GLISSE: transférer la vélocité actuelle vers l'inertie
    if (onSlipperyGround && !this.lastWasSlippery) {
      this.glaceInertia.x = this.player.body.velocity.x;
      this.glaceInertia.y = this.player.body.velocity.y;
    }
    this.lastWasSlippery = onSlipperyGround;

    // Mode par défaut: NORMAL (sauf si on est explicitement sur du glissant)
    if (!onSlipperyGround) {
      // === MODE NORMAL (liberté totale de mouvement) ===
      this.player.setVelocity(0);
      let isMoving = false;

      if (this.clavier.right.isDown && this.clavier.up.isDown) {
        this.player.setVelocityX(speed);
        this.player.setVelocityY(-speed);
        this.player.anims.play('anim_tourne_haut', true);
        isMoving = true;
      }
      else if (this.clavier.right.isDown && this.clavier.down.isDown) {
        this.player.setVelocityX(speed);
        this.player.setVelocityY(speed);
        this.player.anims.play('anim_tourne_droite', true);
        isMoving = true;
      }
      else if (this.clavier.left.isDown && this.clavier.up.isDown) {
        this.player.setVelocityX(-speed);
        this.player.setVelocityY(-speed);
        this.player.anims.play('anim_tourne_haut', true);
        isMoving = true;
      }
      else if (this.clavier.left.isDown && this.clavier.down.isDown) {
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
      else {
        this.player.anims.play('anim_face');
      }

      // Réinitialiser l'inertie en passant sur du sol non-glissant
      this.glaceInertia.x = 0;
      this.glaceInertia.y = 0;
    } else {
      // === MODE GLISSE (seulement sur du sol avec estglissant = true) ===
      // Appliquer la friction à la vélocité persistante
      this.glaceInertia.x *= friction;
      this.glaceInertia.y *= friction;

      // IMPORTANT: Ne peut accélérer/tourner que si en contact avec du sol (vertical) ou près d'une tuile solide
      if ((onVerticalGround || nearSolidGround) && onSlipperyGround) {
        // Augmenter progressivement la vélocité dans les directions pressées
        if (this.clavier.right.isDown && this.clavier.up.isDown) {
          this.glaceInertia.x = Math.min(this.glaceInertia.x + speed * acceleration, speed);
          this.glaceInertia.y = Math.max(this.glaceInertia.y - speed * acceleration, -speed);
          this.player.anims.play('anim_tourne_haut', true);
        }
        else if (this.clavier.right.isDown && this.clavier.down.isDown) {
          this.glaceInertia.x = Math.min(this.glaceInertia.x + speed * acceleration, speed);
          this.glaceInertia.y = Math.min(this.glaceInertia.y + speed * acceleration, speed);
          this.player.anims.play('anim_tourne_droite', true);
        }
        else if (this.clavier.left.isDown && this.clavier.up.isDown) {
          this.glaceInertia.x = Math.max(this.glaceInertia.x - speed * acceleration, -speed);
          this.glaceInertia.y = Math.max(this.glaceInertia.y - speed * acceleration, -speed);
          this.player.anims.play('anim_tourne_haut', true);
        }
        else if (this.clavier.left.isDown && this.clavier.down.isDown) {
          this.glaceInertia.x = Math.max(this.glaceInertia.x - speed * acceleration, -speed);
          this.glaceInertia.y = Math.min(this.glaceInertia.y + speed * acceleration, speed);
          this.player.anims.play('anim_tourne_gauche', true);
        }
        else if (this.clavier.right.isDown) {
          this.glaceInertia.x = Math.min(this.glaceInertia.x + speed * acceleration, speed);
          this.player.anims.play('anim_tourne_droite', true);
        }
        else if (this.clavier.left.isDown) {
          this.glaceInertia.x = Math.max(this.glaceInertia.x - speed * acceleration, -speed);
          this.player.anims.play('anim_tourne_gauche', true);
        }
        else if (this.clavier.up.isDown) {
          this.glaceInertia.y = Math.max(this.glaceInertia.y - speed * acceleration, -speed);
          this.player.anims.play('anim_tourne_haut', true);
        }
        else if (this.clavier.down.isDown) {
          this.glaceInertia.y = Math.min(this.glaceInertia.y + speed * acceleration, speed);
          this.player.anims.play('anim_tourne_bas', true);
        }
        else {
          if (Math.abs(this.glaceInertia.x) < 5 && Math.abs(this.glaceInertia.y) < 5) {
            this.player.anims.play('anim_face');
          }
        }
      } else {
        // PAS DE CONTACT VERTICAL: continuer dans la direction actuelle, sans possibilité de tourner/accélérer
        if (Math.abs(this.glaceInertia.x) > Math.abs(this.glaceInertia.y)) {
          if (this.glaceInertia.x > 0) {
            this.player.anims.play('anim_tourne_droite', true);
          } else {
            this.player.anims.play('anim_tourne_gauche', true);
          }
        } else {
          if (this.glaceInertia.y < 0) {
            this.player.anims.play('anim_tourne_haut', true);
          } else {
            this.player.anims.play('anim_tourne_bas', true);
          }
        }
      }

      // Appliquer la vélocité persistante au joueur
      this.player.setVelocity(this.glaceInertia.x, this.glaceInertia.y);
    }

    // Si collision avec objet solide, arrêter le glissement dans cette direction
    if (this.player.body.blocked.left || this.player.body.blocked.right) {
      this.glaceInertia.x = 0;
    }
    if (this.player.body.blocked.up || this.player.body.blocked.down) {
      this.glaceInertia.y = 0;
    }
  }

  isOnSlipperyTile() {
    // Vérifier si le joueur est sur une tuile avec la propriété estglissant = true
    // Par défaut, on assume que rien n'est glissant sauf si c'est explicitement marqué
    const layers = [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre];

    for (let layer of layers) {
      if (!layer) continue;

      // Vérifier la tuile directement sous le joueur
      const tileBelow = layer.getTileAtWorldXY(this.player.x, this.player.y + this.player.displayHeight / 2);
      if (tileBelow) {
        // Vérifier si la tuile a EXPLICITEMENT estglissant = true
        const isSlippery = tileBelow.properties?.estglissant === true ||
                          tileBelow.properties?.estglissant === "true";
        if (isSlippery) {
          return true;
        }
      }
    }

    return false;
  }

  isNearSolidTile() {
    // Vérifier si le joueur est proche d'une tuile solide (1 à 2 tuiles de distance)
    const layers = [this.calqueFond, this.calqueMilieu, this.calqueHaut, this.calqueQuatre];

    if (!this.map) return false;

    // Obtenir la tuile actuelle du joueur
    const tileX = Math.floor(this.player.x / this.map.tileWidth);
    const tileY = Math.floor(this.player.y / this.map.tileHeight);

    // Vérifier les tuiles dans un rayon de 2 tuiles
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        // Ne pas vérifier la tuile actuelle
        if (dx === 0 && dy === 0) continue;

        const checkX = tileX + dx;
        const checkY = tileY + dy;

        for (let layer of layers) {
          if (!layer) continue;

          const tile = layer.getTileAt(checkX, checkY);
          if (tile) {
            const isSolid = tile.properties?.estsolide === true || tile.properties?.estsolide === "true";
            if (isSolid) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }
}