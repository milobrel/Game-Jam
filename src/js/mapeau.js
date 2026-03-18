export default class mapeau extends Phaser.Scene {
  constructor() {
    super({ key: 'mapeau' });
  }

  preload() {
    // 1. Charger l'image du jeu de tuiles (le tileset)
    this.load.image('tiles', 'src/assets/tileset_16x16_interior.png');

    // 2. Charger le fichier JSON de la carte créé avec Tiled
    this.load.tilemapTiledJSON('mapeau', 'src/assets/mapeau.tmj');

    // 3. Charger le personnage (même sprite que dans selection.js)
    this.load.spritesheet('player', 'src/assets/playerRight.png', {
      frameWidth: 48,
      frameHeight: 68
    });
  }

  create(data) {
    // Création de la carte
    const map = this.make.tilemap({ key: 'mapeau' });

    // Ajout du jeu de tuiles (le nom doit correspondre au champ "name" dans Map eau.tsj)
    const tileset = map.addTilesetImage('Map eau', 'tiles');

    // Calque solide principal
    const calque_sol = map.createLayer('calques eau', tileset, 0, 0);
    calque_sol.setCollisionByProperty({ collides: true });

    // Position de départ
    const startX = data.startX || 100;
    const startY = data.startY || 450;
    this.player = this.physics.add.sprite(startX, startY, 'player');
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);

    // Collisions
    this.physics.add.collider(this.player, calque_sol);

    // Caméra
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 120;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }
}
