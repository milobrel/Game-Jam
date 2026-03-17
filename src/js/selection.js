
export default class selection extends Phaser.Scene {
 
  constructor() {
     super({key : "selection"}); // mettre le meme nom que le nom de la classe
  }

  init(data) {
    this.currentMap = data.map || 'mapcentral';
    this.playerStartX = data.startX || 100;
    this.playerStartY = data.startY || 450;
  }

  loadMap(mapKey) {
    // Supprimer les anciens éléments si existants
    if (this.map) {
      this.map.destroy();
    }
    if (this.calqueFond) {
      this.calqueFond.destroy();
    }
    if (this.calqueMilieu) {
      this.calqueMilieu.destroy();
    }
    if (this.calqueHaut) {
      this.calqueHaut.destroy();
    }
    if (this.calqueQuatre) {
      this.calqueQuatre.destroy();
    }

    // Créer la nouvelle carte
    this.map = this.make.tilemap({ key: mapKey });
    this.tileset1 = this.map.addTilesetImage('First Asset pack', 'First Asset pack');
    this.tileset2 = this.map.addTilesetImage('TilesA2', 'TilesA2');
    this.tileset3 = this.map.addTilesetImage('terrain', 'terrain');
    this.tilesets = [this.tileset1, this.tileset2, this.tileset3];

    // Créer les calques s'ils existent
    if (this.map.getLayerIndex('Calque de Tuiles 1') !== null) {
      this.calqueFond = this.map.createLayer('Calque de Tuiles 1', this.tilesets, 0, 0);
    } else if (this.map.getLayerIndex('Calque_nuage') !== null) {
      this.calqueFond = this.map.createLayer('Calque_nuage', this.tilesets, 0, 0);
    }
    if (this.map.getLayerIndex('Calque de Tuiles 2') !== null) {
      this.calqueMilieu = this.map.createLayer('Calque de Tuiles 2', this.tilesets, 0, 0);
    } else if (this.map.getLayerIndex('calque_surface') !== null) {
      this.calqueMilieu = this.map.createLayer('calque_surface', this.tilesets, 0, 0);
    }
    if (this.map.getLayerIndex('Calque de Tuiles 3') !== null) {
      this.calqueHaut = this.map.createLayer('Calque de Tuiles 3', this.tilesets, 0, 0);
    }
    if (this.map.getLayerIndex('Calque de Tuiles 4') !== null) {
      this.calqueQuatre = this.map.createLayer('Calque de Tuiles 4', this.tilesets, 0, 0);
    }

    // Définir les collisions si le calque milieu existe
    if (this.calqueMilieu) {

      this.calqueMilieu.setCollisionByProperty({ estsolide: true });
    }
    if (this.calqueQuatre) {
      this.calqueQuatre.setCollisionByProperty({ estsolide: true });
    }
    if (this.CalqueHaut) {
      this.CalqueHaut.setCollisionByProperty({ estsolide: true });
    }
    if (this.CalqueFond) {
      this.CalqueFond.setCollisionByProperty({ estsolide: true });
    }

    // Repositionner le joueur si nécessaire
    if (this.player) {
      if (this.calqueMilieu) {
        this.physics.add.collider(this.player, this.calqueMilieu);
      }
    }

    // Configurer la caméra
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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

    // Charger les cartes
    this.load.tilemapTiledJSON('mapcentral', 'src/assets/mapcentral..tmj');
    this.load.tilemapTiledJSON('map_air', 'src/assets/map_air.tmj');
    this.load.tilemapTiledJSON('glace', 'src/assets/glace.json');
    this.load.image('First Asset pack', 'src/assets/First Asset pack.png');
    this.load.image('TilesA2', 'src/assets/TilesA2.png');
    this.load.image('terrain', 'src/assets/terrain.png');
    this.load.image('nuage', 'src/assets/nuage.png');
    this.load.image('surface', 'src/assets/surface.png');
    this.load.image('haut', 'src/assets/haut.png');
    this.load.image('quatre', 'src/assets/quatre.png');
  }

  create() {
    this.son_musique = this.sound.add('musique');
    this.son_musique.play();

    // Charger la carte initiale
    this.loadMap(this.currentMap);

    this.player = this.physics.add.sprite(this.playerStartX, this.playerStartY, 'bas_perso');
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);

    this.clavier = this.input.keyboard.createCursorKeys();

    // Configurer la caméra pour suivre le joueur
    this.cameras.main.startFollow(this.player);

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
    this.player.setVelocity(0);

    if (this.clavier.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('anim_tourne_droite', true); 
    } 
    else if (this.clavier.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('anim_tourne_gauche', true); 
    } 
    else if (this.clavier.up.isDown) {
      this.player.setVelocityY(-160);
      this.player.anims.play('anim_tourne_haut', true); 
    } 
    else if (this.clavier.down.isDown) {
      this.player.setVelocityY(160);
      this.player.anims.play('anim_tourne_bas', true);
    } 
    else {
      this.player.anims.play('anim_face'); 
    }

    // Vérifier les transitions de carte
    this.checkMapTransitions();
  }

  checkMapTransitions() {
    // Exemple : si le joueur est à une position spécifique, changer de carte
    // Pour mapcentral vers map_air
    if (this.currentMap === 'mapcentral' && this.player.x > 1400 && this.player.y < 200) {
      this.scene.restart({ map: 'map_air', startX: 50, startY: 300 });
    }
    // Pour mapcentral vers glace
    else if (this.currentMap === 'mapcentral' && this.player.x < 100 && this.player.y > 1400) {
      this.scene.restart({ map: 'glace', startX: 400, startY: 50 });
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
}
