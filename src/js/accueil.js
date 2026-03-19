export default class accueil extends Phaser.Scene {

  constructor() {
    super({ key: 'accueil' });
  }

  init(data) {
    this.resumeKey = data?.resumeKey || this.registry.get('resumeKey') || null;
    this.registry.remove('resumeKey');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ----- FOND -----
    this.add.rectangle(0, 0, W, H, 0x0a0a1a).setOrigin(0, 0);

    // Étoiles décoratives
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H * 0.75);
      const r = Math.random() < 0.3 ? 2 : 1;
      this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
    }

    // Sol herbe (bande en bas)
    this.add.rectangle(0, H - 80, W, 80, 0x1a3a1a).setOrigin(0, 0);
    this.add.rectangle(0, H - 82, W, 6, 0x2d6e2d).setOrigin(0, 0);

    // ----- TITRE -----
    this.add.text(W / 2, H * 0.22, '⚔  LES QUATRE ROYAUMES  ⚔', {
      font: 'bold 42px serif',
      fill: '#f5c842',
      stroke: '#5a3a00',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 6, fill: true }
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.33, 'Legends of the Four Elements', {
      font: 'italic 20px serif',
      fill: '#aaddff',
      alpha: 0.85
    }).setOrigin(0.5);

    // ----- BOUTON JOUER -----
    const btnJouerX = W / 2 - 130;
    const btnY = H * 0.56;
    const btnW = 220;
    const btnH = 56;

    const fondJouer = this.add.rectangle(btnJouerX, btnY, btnW, btnH, 0x1a5c1a)
      .setStrokeStyle(3, 0x4cff4c)
      .setInteractive({ useHandCursor: true });

    const texteJouer = this.add.text(btnJouerX, btnY, this.resumeKey ? '↺  RECOMMENCER' : '▶  JOUER', {
      font: 'bold 24px Arial',
      fill: '#aaffaa'
    }).setOrigin(0.5);

    fondJouer.on('pointerover', () => {
      fondJouer.setFillStyle(0x2e8b2e);
      texteJouer.setStyle({ fill: '#ffffff' });
    });
    fondJouer.on('pointerout', () => {
      fondJouer.setFillStyle(0x1a5c1a);
      texteJouer.setStyle({ fill: '#aaffaa' });
    });
    fondJouer.on('pointerdown', () => {
      this.scene.start('selection', { map: 'mapcentral', startX: 300, startY: 450 });
    });

    // ----- BOUTON CONTINUER (si partie en cours) -----
    if (this.resumeKey) {
      const btnContX = W / 2;
      const btnContY = btnY + btnH + 28;
      const fondCont = this.add.rectangle(btnContX, btnContY, btnW, btnH, 0x4a3a00)
        .setStrokeStyle(3, 0xf5c842)
        .setInteractive({ useHandCursor: true });

      const texteCont = this.add.text(btnContX, btnContY, '↩  CONTINUER', {
        font: 'bold 22px Arial',
        fill: '#f5c842'
      }).setOrigin(0.5);

      fondCont.on('pointerover', () => {
        fondCont.setFillStyle(0x6a5a00);
        texteCont.setStyle({ fill: '#ffffff' });
      });
      fondCont.on('pointerout', () => {
        fondCont.setFillStyle(0x4a3a00);
        texteCont.setStyle({ fill: '#f5c842' });
      });
      fondCont.on('pointerdown', () => {
        this.scene.stop('accueil');
        this.scene.resume(this.resumeKey);
      });
    }

    // ----- BOUTON INSTRUCTIONS -----
    const btnInstX = W / 2 + 130;

    const fondInst = this.add.rectangle(btnInstX, btnY, btnW, btnH, 0x1a2a5c)
      .setStrokeStyle(3, 0x6699ff)
      .setInteractive({ useHandCursor: true });

    const texteInst = this.add.text(btnInstX, btnY, '📖  INSTRUCTIONS', {
      font: 'bold 20px Arial',
      fill: '#aabbff'
    }).setOrigin(0.5);

    fondInst.on('pointerover', () => {
      fondInst.setFillStyle(0x2a3e8b);
      texteInst.setStyle({ fill: '#ffffff' });
    });
    fondInst.on('pointerout', () => {
      fondInst.setFillStyle(0x1a2a5c);
      texteInst.setStyle({ fill: '#aabbff' });
    });
    fondInst.on('pointerdown', () => {
      this.afficherInstructions();
    });

    // ----- PANNEAU INSTRUCTIONS (caché au départ) -----
    this.panneauInst = this.creerPanneauInstructions(W, H);
    this.panneauInst.setVisible(false);

    // ----- CREDITS -----
    this.add.text(W / 2, H - 24, 'Game Jam 2026  —  Appuie sur JOUER pour commencer', {
      font: '13px Arial',
      fill: '#555577'
    }).setOrigin(0.5);
  }

  creerPanneauInstructions(W, H) {
    const container = this.add.container(0, 0);

    const ombre = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0, 0);

    const panW = Math.min(700, W * 0.85);
    const panH = Math.min(460, H * 0.75);
    const panX = W / 2;
    const panY = H / 2;

    const fond = this.add.rectangle(panX, panY, panW, panH, 0x0d1533)
      .setStrokeStyle(3, 0x8888ff);

    const titre = this.add.text(panX, panY - panH / 2 + 30, '📖  INSTRUCTIONS', {
      font: 'bold 26px serif',
      fill: '#f5c842'
    }).setOrigin(0.5);

    const lignes = [
      '🎮  Flèches du clavier  →  Déplacer le personnage',
      '⎵   Espace              →  Interagir / Ouvrir les portes',
      'E    Touche E            →  Quitter un dialogue',
      '',
      '🗺️  Explore les 4 royaumes : Air, Eau, Feu et Glace.',
      '🧙  Parle à Merlin pour découvrir les quêtes.',
      '🚪  Approche-toi des portes et appuie sur Espace pour entrer.',
    ];

    const texte = this.add.text(panX, panY - 10, lignes.join('\n'), {
      font: '17px Arial',
      fill: '#ddeeff',
      lineSpacing: 10,
      align: 'left'
    }).setOrigin(0.5);

    // Bouton Fermer
    const fermerBtnW = 160, fermerBtnH = 44;
    const fermerBtn = this.add.rectangle(panX, panY + panH / 2 - 36, fermerBtnW, fermerBtnH, 0x5c1a1a)
      .setStrokeStyle(2, 0xff6666)
      .setInteractive({ useHandCursor: true });

    const fermerTexte = this.add.text(panX, panY + panH / 2 - 36, '✕  Fermer', {
      font: 'bold 18px Arial',
      fill: '#ffaaaa'
    }).setOrigin(0.5);

    fermerBtn.on('pointerover', () => fermerBtn.setFillStyle(0x8b2e2e));
    fermerBtn.on('pointerout', () => fermerBtn.setFillStyle(0x5c1a1a));
    fermerBtn.on('pointerdown', () => container.setVisible(false));

    container.add([ombre, fond, titre, texte, fermerBtn, fermerTexte]);
    return container;
  }

  afficherInstructions() {
    this.panneauInst.setVisible(true);
    this.children.bringToTop(this.panneauInst);
  }
}
