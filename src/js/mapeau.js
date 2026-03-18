export default class mapeau extends Phaser.Scene {
    constructor() {
        super({ key: 'mapeau' });
    }

    preload() {

    // 1. Charger l'image du jeu de tuiles (le tileset)
    // 'tiles' est l'étiquette (le surnom) qu'on donne à l'image
    this.load.image('tiles', 'src/assets/tileset_16x16_interior.png');

    // 2. Charger le fichier JSON de la carte créé avec Tiled
    this.load.tilemapTiledJSON('map-eau', 'src/assets/map eau.tmj');

    // 3. Charger le personnage (si ce n'est pas déjà fait dans une scène globale)
    this.load.spritesheet('player', 'src/assets/playerRight.png', {
        frameWidth: 32, // À ajuster selon la taille de ton sprite
        frameHeight: 32
    });
}
    

    create(data) {
        // Création de la map
const map = this.make.tilemap({ key: 'map-eau' });
// Ajout du jeu de tuiles (le nom 'tiles' doit correspondre à celui dans Tiled)
const tileset = map.addTilesetImage('tileset_16x16_inter...', 'tiles');

// Création des calques
const calque_sol = map.createLayer('nom_du_calque_sol', tileset, 0, 0);
const calque_murs = map.createLayer('nom_du_calque_murs', tileset, 0, 0);
// On place le perso aux coordonnées (x, y)
this.player = this.physics.add.sprite(100, 450, 'player');

// On l'empêche de sortir des limites de la map
this.player.setCollideWorldBounds(true);
// On active la collision pour les tuiles qui ont la propriété "collides" dans Tiled
calque_murs.setCollisionByProperty({ collides: true });

// On ajoute la collision entre le joueur et le calque
this.physics.add.collider(this.player, calque_murs);

this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
    this.player.setVelocityX(-160);
    this.player.anims.play('left', true);
} else if (this.cursors.right.isDown) {
    this.player.setVelocityX(160);
    this.player.anims.play('right', true);
} else {
    this.player.setVelocityX(0);
    this.player.anims.play('turn');
}
    }
}