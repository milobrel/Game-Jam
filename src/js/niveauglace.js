export default class niveauglace extends Phaser.Scene {
  constructor() {
    super({ key: "niveauglace" });
  }

  init(data) {
    this.playerStartX = data.startX || 120;
    this.playerStartY = data.startY || 320;
  }

  preload() {
    // chargement des spritesheets du joueur
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

    // chargement de la carte au format JSON
    this.load.tilemapTiledJSON("glace", "src/assets/glace.json");

    // chargement du tileset
    this.load.image("TilesA2", "src/assets/TilesA2.png");
  }

  create() {
    // chargement de la carte
    const carteDuNiveau = this.make.tilemap({ key: "glace" });

    // chargement du jeu de tuiles
    const tileset = carteDuNiveau.addTilesetImage("TilesA2", "TilesA2");

    // chargement du calque de fond
    this.calqueFond = carteDuNiveau.createLayer("Calque de Tuiles 1", tileset);

    // chargement du calque de surface
    this.calqueMilieu = carteDuNiveau.createLayer("Calque de Tuiles 2", tileset);

    // définition des tuiles solides via la propriété estsolide
    if (this.calqueFond) this.calqueFond.setCollisionByProperty({ estsolide: true });
    if (this.calqueMilieu) this.calqueMilieu.setCollisionByProperty({ estsolide: true });

    // redimensionnement du monde avec les dimensions de la carte
    const mapWidth = carteDuNiveau.widthInPixels;
    const mapHeight = carteDuNiveau.heightInPixels;
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // création du joueur
    this.player = this.physics.add.sprite(this.playerStartX, this.playerStartY, "bas_perso");
    this.player.setScale(0.3);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(100);

    // ajout des collisions entre le joueur et les calques
    if (this.calqueFond) this.physics.add.collider(this.player, this.calqueFond);
    if (this.calqueMilieu) this.physics.add.collider(this.player, this.calqueMilieu);

    // zoom et suivi caméra
    this.cameras.main.setZoom(2.5);
    this.cameras.main.startFollow(this.player, true, 0.7, 0.7);
    this.cameras.main.setRoundPixels(true);

    // clavier
    this.clavier = this.input.keyboard.createCursorKeys();

    // animations du joueur
    if (!this.anims.exists("anim_tourne_gauche")) {
      this.anims.create({
        key: "anim_tourne_gauche",
        frames: this.anims.generateFrameNumbers("gauche_perso", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists("anim_tourne_droite")) {
      this.anims.create({
        key: "anim_tourne_droite",
        frames: this.anims.generateFrameNumbers("droite_perso", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists("anim_tourne_haut")) {
      this.anims.create({
        key: "anim_tourne_haut",
        frames: this.anims.generateFrameNumbers("haut_perso", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists("anim_tourne_bas")) {
      this.anims.create({
        key: "anim_tourne_bas",
        frames: this.anims.generateFrameNumbers("bas_perso", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
      });
    }
    if (!this.anims.exists("anim_face")) {
      this.anims.create({
        key: "anim_face",
        frames: [{ key: "bas_perso", frame: 0 }],
        frameRate: 20
      });
    }
  }

  update() {
    this.player.setVelocity(0);

    const speed = 100;
    let isMoving = false;

    if (this.clavier.right.isDown && this.clavier.up.isDown) {
      this.player.setVelocityX(speed);
      this.player.setVelocityY(-speed);
      this.player.anims.play("anim_tourne_haut", true);
      isMoving = true;
    } else if (this.clavier.right.isDown && this.clavier.down.isDown) {
      this.player.setVelocityX(speed);
      this.player.setVelocityY(speed);
      this.player.anims.play("anim_tourne_droite", true);
      isMoving = true;
    } else if (this.clavier.left.isDown && this.clavier.up.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setVelocityY(-speed);
      this.player.anims.play("anim_tourne_haut", true);
      isMoving = true;
    } else if (this.clavier.left.isDown && this.clavier.down.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setVelocityY(speed);
      this.player.anims.play("anim_tourne_gauche", true);
      isMoving = true;
    } else if (this.clavier.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play("anim_tourne_droite", true);
      isMoving = true;
    } else if (this.clavier.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play("anim_tourne_gauche", true);
      isMoving = true;
    } else if (this.clavier.up.isDown) {
      this.player.setVelocityY(-speed);
      this.player.anims.play("anim_tourne_haut", true);
      isMoving = true;
    } else if (this.clavier.down.isDown) {
      this.player.setVelocityY(speed);
      this.player.anims.play("anim_tourne_bas", true);
      isMoving = true;
    }

    if (!isMoving) {
      this.player.anims.play("anim_face");
    }
  }
}