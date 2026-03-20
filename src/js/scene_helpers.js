const PLAYER_SPRITESHEETS = [
  { key: 'droite_perso', path: 'src/assets/images/playerRight.png' },
  { key: 'gauche_perso', path: 'src/assets/images/playerLeft.png' },
  { key: 'haut_perso', path: 'src/assets/images/playerUp.png' },
  { key: 'bas_perso', path: 'src/assets/images/playerDown.png' }
];

export function chargerSpritesheetsJoueur(scene) {
  PLAYER_SPRITESHEETS.forEach(({ key, path }) => {
    scene.load.spritesheet(key, path, {
      frameWidth: 48,
      frameHeight: 68
    });
  });
}

export function chargerCalqueSiPresent(map, nomsDeCalque, tilesets, profondeur) {
  const noms = Array.isArray(nomsDeCalque) ? nomsDeCalque : [nomsDeCalque];

  for (const nomDuCalque of noms) {
    if (map.getLayerIndex(nomDuCalque) === null) {
      continue;
    }

    const calque = map.createLayer(nomDuCalque, tilesets, 0, 0);
    calque.setDepth(profondeur);
    return calque;
  }

  return null;
}

export function activerCollisionsSolides(layers) {
  layers.forEach((layer) => {
    if (!layer) {
      return;
    }

    layer.forEachTile((tile) => {
      const prop = tile.properties?.estsolide;
      if (prop === true || prop === 'true') {
        tile.setCollision(true);
      }
    });
  });
}

export function ajouterCollisionsJoueur(scene, player, layers) {
  layers.forEach((layer) => {
    if (layer) {
      scene.physics.add.collider(player, layer);
    }
  });
}

export function arreterMusique(scene, son) {
  if (son?.isPlaying) {
    son.stop();
  }

  const musiquePrincipale = scene.sound.get('musique');
  if (musiquePrincipale?.isPaused) {
    musiquePrincipale.resume();
  }
}
