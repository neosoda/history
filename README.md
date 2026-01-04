# History

**[history.valyu.ai](https://history.valyu.ai)**

> Je ne peux pas m'empêcher de "doomscroller" sur Google Maps, alors j'ai construit une IA qui fait des recherches sur n'importe quel endroit sur Terre.

Une mappemonde 3D interactive qui vous permet d'explorer l'histoire fascinante de n'importe quel lieu sur la planète. Né de l'habitude d'ouvrir Google Maps en vue satellite à 2h du matin et de cliquer sur des points aléatoires — des atolls obscurs du Pacifique, des montagnes sans nom au Kirghizistan, ou des colonies arctiques de 9 habitants. Des endroits si reculés qu'ils n'ont même pas de page Wikipédia.

![History](public/history.png)

## Le Problème

J'ai un problème. Je peux perdre 6 heures à errer sur Google Maps. Juste à cliquer. Trouver des îles volcaniques qui ont l'air retouchées. Des fjords qui défient la physique. De minuscules points de terre au milieu de nulle part. Et à chaque fois, je me demande : **qu'est-ce que c'est que cet endroit ? Qui l'a trouvé ? Pourquoi existe-t-il ? Que s'est-il passé ici ?**

Ensuite, on essaie de faire des recherches et c'est l'enfer. 47 onglets Wikipédia. Un PDF du gouvernement kazakh mal traduit datant de 2003. Un blog de voyage de 1987. Un seul commentaire Reddit de 2014 qui dit "Je crois que mon oncle y est allé une fois." Vous assemblez les pièces comme un théoricien du complot et vous n'avez toujours pas l'histoire complète.

**L'information existe quelque part.** Bases de données historiques. Archives académiques. Registres coloniaux. Journaux d'exploration des années 1800. Mais elle est éparpillée partout et prend un temps fou à trouver.

## La Solution

Cliquez n'importe où sur le globe. Obtenez de vraies recherches. L'IA fouille des centaines de sources pendant 10 minutes et vous livre l'histoire complète. Avec des citations pour que vous sachiez que rien n'est inventé.

Ce n'est pas ChatGPT qui résume ses données d'entraînement. **C'est de la recherche réelle.** Elle explore :
- Les bases de données historiques et archives
- Les articles et journaux académiques
- Les registres coloniaux et journaux d'exploration
- Les relevés archéologiques
- Wikipédia et les bases de connaissances structurées
- Les sources web en temps réel

**Exemple : Tristan da Cunha** (l'île habitée la plus isolée au monde, 245 habitants)

Cliquez dessus et vous obtenez :
- La découverte par les explorateurs portugais en 1506
- L'annexion britannique en 1816 (position stratégique pendant les guerres napoléoniennes)
- L'éruption volcanique de 1961 qui a évacué toute la population
- L'économie actuelle (exportation de langoustes, philatélie)
- L'évolution culturelle de cette minuscule communauté
- Une chronologie complète avec sources

Ce qui prendrait des heures de recherche manuelle se fait automatiquement. Et vous pouvez tout vérifier.

## Pourquoi ce projet existe ?

Parce que j'ai passé des mois de ma vie à cliquer sur des îles aléatoires à 3h du matin sur Google Maps et que je veux enfin les comprendre. Pas seulement lire un court résumé Wikipédia. **De la vraie recherche historique. Rapidement.**

Les bases de données existent. Les archives sont numérisées. Les API sont prêtes. Il suffisait de les connecter à un globe et de les rendre accessibles.

**C'est à cela que l'IA devrait servir.** Pas à écrire des e-mails, mais à amplifier la curiosité humaine naturelle pour le monde.

## Fonctionnalités Clés

### Infrastructure de Recherche Réelle
- **API Valyu DeepResearch** - Accès aux bases de données académiques, archives et registres historiques.
- **Analyse approfondie** - Recherche pendant plusieurs minutes parmi des centaines de sources.
- **Citations complètes** - Chaque affirmation est liée à des sources vérifiables.
- **Suivi en temps réel** - Observez la recherche se dérouler, voyez chaque source consultée.

### Globe Interactif
- **Visualisation Satellite 3D** - Imagerie satellite Mapbox époustouflante avec projection globale.
- **Cliquez partout** - Pays, îles, montagnes ou caractéristiques géographiques.
- **Découverte Aléatoire** - Bouton "Lieu Aléatoire" pour explorer le monde au hasard.
- **Styles de Cartes Multiples** - Satellite, rues, extérieur, etc.

### Sauvegarde & Partage
- **Historique de Recherche** - Sauvegardez et revisitez vos découvertes (pour les utilisateurs connectés).
- **Liens de Partage** - Générez des liens publics vers vos recherches.
- **Multi-plateforme** - Fonctionne sur téléphone, tablette et ordinateur.

## Stack Technique

### Recherche
- **[API Valyu DeepResearch](https://platform.valyu.ai)** - Recherche exhaustive sur bases de données et archives.

### Frontend
- **[Next.js 15](https://nextjs.org)** + **[React 19](https://react.dev)** - Framework web moderne.
- **[Mapbox GL JS](https://www.mapbox.com/mapbox-gljs)** - Visualisation 3D du globe.
- **[Tailwind CSS](https://tailwindcss.com)** + **[Framer Motion](https://www.framer.com/motion/)** - Interface élégante et animations fluides.

### Backend & Persistance
- **[PocketBase](https://pocketbase.io/)** - Base de données unifiée et gestion de l'authentification.
- **Valyu OAuth** - Système de connexion et gestion des crédits de recherche.

### Infrastructure
- **Deployment** - Prêt pour Docker / Coolify.
- **TypeScript** - Sécurité du code sur tout le projet.

## Démarrage Rapide

### Prérequis
- Node.js 20+
- Une clé API Valyu DeepResearch ([disponible gratuitement sur platform.valyu.ai](https://platform.valyu.ai))
- Un jeton d'accès Mapbox ([gratuit sur mapbox.com](https://account.mapbox.com))
- Une instance PocketBase (ou installation locale)

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/yorkeccak/history.git
   cd history
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Créez un fichier `.env.local` à la racine :

   ```env
   # PocketBase (Requis)
   NEXT_PUBLIC_POCKETBASE_URL=http://votre-instance-pocketbase:8090
   POCKETBASE_ADMIN_EMAIL=votre-email-admin@exemple.com
   POCKETBASE_ADMIN_PASSWORD=votre-mot-de-passe-admin

   # Valyu API (Requis)
   VALYU_API_KEY=valyu_votre_cle_api

   # Mapbox (Requis)
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.votre_token_mapbox

   # Configuration App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Initialiser la base de données**
   Lancez le script de configuration pour créer les collections PocketBase nécessaires :
   ```bash
   npx ts-node scripts/setup-pocketbase.ts
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

## Contribution

History est entièrement open-source. Les contributions sont les bienvenues !

### Domaines de contribution
- Nouveaux styles de cartes et visualisations
- Systèmes de favoris et collections
- Galeries d'images pour les lieux historiques
- Optimisations mobiles
- Visualisations de données (chronologies, graphiques)

## Licence

Ce projet est disponible sous licence MIT.

---

**Conçu pour les passionnés de géographie, les amateurs d'histoire et les curieux du monde entier.**

*Explorer. Découvrir. Apprendre.*
