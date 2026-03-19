export default class niveauglace extends Phaser.Scene {

  constructor() {
    super({ key: "niveauglace" });
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

  create() {
    this.sound.stopAll();
    this.son_musique = this.sound.add('passionfruit');
    this.son_musique.play();

    // -------------------------------------------------------
    // CARTE
    // -------------------------------------------------------
    this.map = this.make.tilemap({ key: 'glace' });
    this.tileset1 = this.map.addTilesetImage('First Asset pack', 'First Asset pack');
    this.tileset2 = this.map.addTilesetImage('TilesA2', 'TilesA2');
    this.tileset3 = this.map.addTilesetImage('terrain', 'terrain');
    this.tilesets = [this.tileset1, this.tileset2, this.tileset3];

    if (this.map.getLayerIndex('Calque de Tuiles 3') !== null) {
      this.calqueHaut = this.map.createLayer('Calque de Tuiles 3', this.tilesets, 0, 0);
      this.calqueHaut.setDepth(10);
    } else { this.calqueHaut = null; }

    if (this.map.getLayerIndex('Calque de Tuiles 1') !== null) {
      this.calqueFond = this.map.createLayer('Calque de Tuiles 1', this.tilesets, 0, 0);
      this.calqueFond.setDepth(30);
    } else { this.calqueFond = null; }

    if (this.map.getLayerIndex('Calque de Tuiles 2') !== null) {
      this.calqueMilieu = this.map.createLayer('Calque de Tuiles 2', this.tilesets, 0, 0);
      this.calqueMilieu.setDepth(40);
    } else { this.calqueMilieu = null; }

    if (this.map.getLayerIndex('Calque de Tuiles 4') !== null) {
      this.calqueQuatre = this.map.createLayer('Calque de Tuiles 4', this.tilesets, 0, 0);
      this.calqueQuatre.setDepth(50);
    } else { this.calqueQuatre = null; }

    // Activer collisions sur tuiles estsolide
    const setSolid = (layer) => {
      if (!layer) return;
      layer.forEachTile((tile) => {
        if (tile.properties?.estsolide === true || tile.properties?.estsolide === "true") {
          tile.setCollision(true);
        }
      });
    };
    setSolid(this.calqueFond);
    setSolid(this.calqueMilieu);
    setSolid(this.calqueHaut);
    setSolid(this.calqueQuatre);

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
    this.player.setDepth(100);

    if (this.calqueFond)   this.physics.add.collider(this.player, this.calqueFond);
    if (this.calqueMilieu) this.physics.add.collider(this.player, this.calqueMilieu);
    if (this.calqueHaut)   this.physics.add.collider(this.player, this.calqueHaut);
    if (this.calqueQuatre) this.physics.add.collider(this.player, this.calqueQuatre);

    this.clavier = this.input.keyboard.createCursorKeys();
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
    this.anims.create({
      key: "anim_tourne_gauche",
      frames: this.anims.generateFrameNumbers("gauche_perso", { start: 0, end: 3 }),
      frameRate: 10, repeat: -1
    });
    this.anims.create({
      key: "anim_tourne_droite",
      frames: this.anims.generateFrameNumbers("droite_perso", { start: 0, end: 3 }),
      frameRate: 10, repeat: -1
    });
    this.anims.create({
      key: "anim_tourne_haut",
      frames: this.anims.generateFrameNumbers("haut_perso", { start: 0, end: 3 }),
      frameRate: 10, repeat: -1
    });
    this.anims.create({
      key: "anim_tourne_bas",
      frames: this.anims.generateFrameNumbers("bas_perso", { start: 0, end: 3 }),
      frameRate: 10, repeat: -1
    });
    this.anims.create({
      key: "anim_face",
      frames: [{ key: "bas_perso", frame: 0 }],
      frameRate: 20
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