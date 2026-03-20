export function creerAnimationsDuPerso(scene) {
  const animations = [
    { key: 'anim_tourne_gauche', texture: 'gauche_perso' },
    { key: 'anim_tourne_droite', texture: 'droite_perso' },
    { key: 'anim_tourne_haut', texture: 'haut_perso' },
    { key: 'anim_tourne_bas', texture: 'bas_perso' }
  ];

  animations.forEach(({ key, texture }) => {
    if (scene.anims.exists(key)) {
      return;
    }

    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  });

  if (scene.anims.exists('anim_face')) {
    return;
  }

  scene.anims.create({
    key: 'anim_face',
    frames: [{ key: 'bas_perso', frame: 0 }],
    frameRate: 20
  });
}
