# Design system

La palette reprend `PortFolio/src/_variables.scss` du portfolio de Clément.
Les valeurs communes vivent dans `server/client/src/style/theme.css`.

| Rôle | Clair | Sombre |
| --- | --- | --- |
| Principal | `#4F46E5` | `#6C63FF` |
| Secondaire | `#6C63FF` | `#9F8CFF` |
| Accent | `#9F8CFF` | `#BBAAFF` |
| Fond | `#F5F7FF` | `#05070C` |
| Panneau | `#FFFFFF` | `#101724` |
| Titre | `#111827` | `#F8FAFC` |

Les bordures, le texte secondaire et les boutons sont adaptés à une interface
dense : bordures discrètes, texte lavande pour les liens sombres et fond violet
plus foncé sous les libellés blancs. Les couleurs de succès, d'avertissement et
d'erreur gardent leur sens fonctionnel.

- Utiliser les variables sémantiques, jamais une couleur de marque en dur dans un composant.
- Pour une surface teintée : `color-mix(in srgb, var(--primary) 10%, var(--bg-panel))`.
- Pour un lien ou une petite icône interactive : `--text-link`, lisible dans les deux thèmes.
- Typographie : Manrope pour le texte et les titres ; monospace pour les surtitres.
- Rayons : `--radius-sm` pour les contrôles, `--radius-md` pour les éléments internes, `--radius-lg` pour les panneaux.
- Ombres : `--shadow-xs` ou `--shadow-sm` pour le contenu ; ombres plus fortes réservées aux éléments flottants.
- Conserver un focus clavier visible et respecter `prefers-reduced-motion`.

`app.css` contient les composants existants, `polish.css` les règles communes de
présentation, et `topbar.css`, `home.css`, `shopping-board.css` les mises en page
spécifiques. La navigation affiche ses libellés sur ordinateur et passe en barre
inférieure pour les sessions connectées sur mobile.
