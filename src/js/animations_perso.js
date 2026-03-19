export function creerAnimationsDuPerso(scene) {
  if (!scene.anims.exists('anim_tourne_gauche')) {
    scene.anims.create({
      key: 'anim_tourne_gauche',
      frames: scene.anims.generateFrameNumbers('gauche_perso', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  }

  if (!scene.anims.exists('anim_tourne_droite')) {
    scene.anims.create({
      key: 'anim_tourne_droite',
      frames: scene.anims.generateFrameNumbers('droite_perso', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  }

  if (!scene.anims.exists('anim_tourne_haut')) {
    scene.anims.create({
      key: 'anim_tourne_haut',
      frames: scene.anims.generateFrameNumbers('haut_perso', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  }

  if (!scene.anims.exists('anim_tourne_bas')) {
    scene.anims.create({
      key: 'anim_tourne_bas',
      frames: scene.anims.generateFrameNumbers('bas_perso', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  }

  if (!scene.anims.exists('anim_face')) {
    scene.anims.create({
      key: 'anim_face',
      frames: [{ key: 'bas_perso', frame: 0 }],
      frameRate: 20
    });
  }
}
