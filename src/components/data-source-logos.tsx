"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";

const logos = [
  {
    name: "PubMed Literature",
    src: "/pubmed.svg",
    description: "Accédez à la littérature biomédicale de PubMed",
    snippets: [
      {
        language: "Python",
        code: `from valyu import Valyu

valyu = Valyu(api_key="<your_api_key>")

# Recherche de littérature biomédicale
response = valyu.search(
    "efficacité du pembrolizumab dans le NSCLC",
    included_sources=["valyu/valyu-pubmed"]
    # ou laissez included_sources vide et nous le trouverons pour vous
)

# Accéder aux résultats
for result in response.results:
    print(f"Titre : {result.title}")
    print(f"Contenu : {result.content[:200]}...")`,
      },
      {
        language: "TypeScript",
        code: `import { Valyu } from 'valyu';

const valyu = new Valyu({ apiKey: '<your_api_key>' });

// Recherche de littérature biomédicale
const response = await valyu.search({
    query: 'efficacité du pembrolizumab dans le NSCLC',
    includedSources: ['valyu/valyu-pubmed'],
    // ou laissez included_sources vide et nous le trouverons pour vous
});

// Accéder aux résultats
response.results.forEach(result => {
});`,
      },
      {
        language: "cURL",
        code: `curl -X POST https://api.valyu.ai/v1/deepsearch \\
  -H "x-api-key: <your_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "efficacité du pembrolizumab dans le NSCLC",
    "included_sources": ["valyu/valyu-pubmed"] # ou laissez vide et nous le trouverons pour vous
  }'`,
      },
    ],
  },
  {
    name: "arXiv Papers",
    src: "/arxiv.svg",
    description: "Recherchez des articles académiques sur arXiv",
    snippets: [
      {
        language: "Python",
        code: `from valyu import Valyu

valyu = Valyu(api_key="<your_api_key>")

# Recherche d'articles académiques
response = valyu.search(
    "architecture transformer et mécanisme d'attention",
    included_sources=["valyu/valyu-arxiv"] # ou laissez vide et nous trouverons pour vous
)

# Obtenir les détails de l'article
for paper in response.results:
    print(f"Titre : {paper.title}")
    print(f"Auteurs : {paper.metadata.get('authors', [])}")
    print(f"Résumé : {paper.content[:300]}...")`,
      },
      {
        language: "TypeScript",
        code: `import { Valyu } from 'valyu';

const valyu = new Valyu({ apiKey: '<your_api_key>' });

// Recherche d'articles académiques
const response = await valyu.search({
    query: 'architecture transformer et mécanisme d\'attention',
    includedSources: ['valyu/valyu-arxiv'], // ou laissez vide et nous trouverons pour vous
});

// Obtenir les détails de l'article
response.results.forEach(paper => {
});`,
      },
      {
        language: "cURL",
        code: `curl -X POST https://api.valyu.ai/v1/deepsearch \\
  -H "x-api-key: <your_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "architecture transformer et mécanisme d'attention",
    "included_sources": ["valyu/valyu-arxiv"] # ou laissez vide et nous trouverons pour vous
  }'`,
      },
    ],
  },
  {
    name: "Clinical Trials",
    src: "/clinicaltrials.svg",
    description: "Données d'essais cliniques de ClinicalTrials.gov",
    snippets: [
      {
        language: "Python",
        code: `from valyu import Valyu

valyu = Valyu(api_key="<your_api_key>")

# Recherche d'essais cliniques
response = valyu.search(
    "pembrolizumab NSCLC essais Phase 3",
    included_sources=[
        "valyu/valyu-clinical-trials"
    ] # ou laissez vide et nous trouverons pour vous
)

# Extraire les données des essais cliniques
for trial in response.results:
    print(f"ID Essai : {trial.metadata.get('nct_id')}")
    print(f"Phase : {trial.metadata.get('phase')}")
    print(f"Statut : {trial.metadata.get('status')}")
    print(f"Données : {trial.content}")`,
      },
      {
        language: "TypeScript",
        code: `import { Valyu } from 'valyu';

const valyu = new Valyu({ apiKey: '<your_api_key>' });

// Recherche d'essais cliniques
const response = await valyu.search({
    query: 'pembrolizumab NSCLC essais Phase 3',
    includedSources: [
        "valyu/valyu-clinical-trials"
    ], // ou laissez vide et nous trouverons pour vous
});

// Extraire les données des essais cliniques
response.results.forEach(trial => {
});`,
      },
      {
        language: "cURL",
        code: `curl -X POST https://api.valyu.ai/v1/deepsearch \\
  -H "x-api-key: <your_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "pembrolizumab NSCLC essais Phase 3",
    "included_sources": [
        "valyu/valyu-clinical-trials"
    ] # ou laissez vide et nous trouverons pour vous
  }'`,
      },
    ],
  },
  {
    name: "FDA Drug Labels",
    src: "/fda.svg",
    description: "Informations et étiquettes des médicaments approuvés par la FDA",
    snippets: [
      {
        language: "Python",
        code: `from valyu import Valyu

valyu = Valyu(api_key="<your_api_key>")

# Recherche d'informations sur les médicaments FDA
response = valyu.search(
    "dosage notice pembrolizumab FDA",
    included_sources=[
        'valyu/valyu-fda-drug-labels'
    ] # ou laissez vide et nous trouverons pour vous
)

# Obtenir les informations sur le médicament
for drug in response.results:
    print(f"Médicament : {drug.metadata.get('drug_name')}")
    print(f"Indication : {drug.metadata.get('indication')}")
    print(f"Notice : {drug.content}")`,
      },
      {
        language: "TypeScript",
        code: `import { Valyu } from 'valyu';

const valyu = new Valyu({ apiKey: '<your_api_key>' });

// Recherche d'informations sur les médicaments FDA
const response = await valyu.search({
    query: 'dosage notice pembrolizumab FDA',
    includedSources: [
        'valyu/valyu-fda-drug-labels'
    ], // ou laissez vide et nous trouverons pour vous
});

// Obtenir les informations sur le médicament
response.results.forEach(drug => {
});`,
      },
      {
        language: "cURL",
        code: `curl -X POST https://api.valyu.ai/v1/deepsearch \\
  -H "x-api-key: <your_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "dosage notice pembrolizumab FDA",
    "included_sources": [
        "valyu/valyu-fda-drug-labels"
    ] # ou laissez vide et nous trouverons pour vous
  }'`,
      },
    ],
  },
  {
    name: "Web Search",
    src: "/web.svg",
    description: "Recherche web générale avec score de pertinence",
    snippets: [
      {
        language: "Python",
        code: `from valyu import Valyu

valyu = Valyu(api_key="<your_api_key>")

# Recherche sur le web
response = valyu.search(
    "développements récents thérapie génique CRISPR 2024"
)

# Obtenir les résultats classés
for result in response.results:
    print(f"Titre : {result.title}")
    print(f"URL : {result.metadata.get('url')}")
    print(f"Pertinence : {result.metadata.get('relevance_score')}")
    print(f"Contenu : {result.content[:200]}...")`,
      },
      {
        language: "TypeScript",
        code: `import { Valyu } from 'valyu';

const valyu = new Valyu({ apiKey: '<your_api_key>' });

// Recherche sur le web
const response = await valyu.search({
    query: 'développements récents thérapie génique CRISPR 2024'
});

// Obtenir les résultats classés
response.results.forEach(result => {
});`,
      },
      {
        language: "cURL",
        code: `curl -X POST https://api.valyu.ai/v1/deepsearch \\
  -H "x-api-key: <your_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "développements récents thérapie génique CRISPR 2024"
  }'`,
      },
    ],
  },
  {
    name: "Wiley",
    src: "/wy.svg",
    description: "Recherche académique via les publications Wiley",
    snippets: [
      {
        language: "Python",
        code: `from valyu import Valyu

valyu = Valyu(api_key="<your_api_key>")

# Recherche de publications Wiley
response = valyu.search(
    "mécanismes d'action de l'immunothérapie",
    included_sources=[
        "valyu/wiley-biomedical-books",
        "valyu/wiley-biomedical-papers"
    ] # ou laissez vide et nous choisirons les meilleures sources
)

# Accéder aux articles
for paper in response.results:
    print(f"Titre : {paper.title}")
    print(f"Journal : {paper.metadata.get('journal')}")
    print(f"DOI : {paper.metadata.get('doi')}")
    print(f"Résumé : {paper.content[:300]}...")`,
      },
      {
        language: "TypeScript",
        code: `import { Valyu } from 'valyu';

const valyu = new Valyu({ apiKey: '<your_api_key>' });

// Recherche de publications Wiley
const response = await valyu.search({
    query: 'mécanismes d\'action de l\'immunothérapie',
    includedSources: [
        "valyu/wiley-biomedical-books",
        "valyu/wiley-biomedical-papers"
    ], // ou laissez vide et nous choisirons les meilleures sources
});

// Accéder aux articles
response.results.forEach(paper => {
});`,
      },
      {
        language: "cURL",
        code: `curl -X POST https://api.valyu.ai/v1/deepsearch \\
  -H "x-api-key: <your_api_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "mécanismes d'action de l'immunothérapie",
    "included_sources": [
        "valyu/wiley-biomedical-books",
        "valyu/wiley-biomedical-papers"
    ] # ou laissez vide et nous choisirons les meilleures sources
  }'`,
      },
    ],
  },
];

const DataSourceLogos = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const controls = useAnimation();
  const animationRef = useRef<any>(null);
  const currentPositionRef = useRef(0);
  const animationStartTimeRef = useRef(0);

  // All logos from assets/banner
  const allLogos = [
    { name: "PubMed", src: "/assets/banner/pubmed.png" },
    { name: "ClinicalTrials", src: "/assets/banner/clinicaltrials.png" },
    { name: "bioRxiv", src: "/assets/banner/biorxiv.png" },
    { name: "medRxiv", src: "/assets/banner/medrxiv.png" },
    { name: "arXiv", src: "/assets/banner/arxiv.png" },
    { name: "DailyMed", src: "/assets/banner/dailymed.png" },
    { name: "WHO", src: "/assets/banner/who.png" },
    { name: "Wikipedia", src: "/assets/banner/wikipedia.png" },
    { name: "USPTO", src: "/assets/banner/uspto.png" },
  ];

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...allLogos, ...allLogos, ...allLogos];

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Start continuous animation
  useEffect(() => {
    const animate = async () => {
      currentPositionRef.current = 0;
      animationStartTimeRef.current = Date.now();

      await controls.start({
        x: [0, -100 * allLogos.length],
        transition: {
          // ↓↓↓ Decrease duration by 1.5x for 1.5x speed ↑↑↑
          duration: (allLogos.length * 3) / 1.5,
          ease: "linear",
          repeat: Infinity,
        }
      });
    };

    animate();
  }, [controls, allLogos.length]);

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);

    // Calculate current position based on elapsed time
    const elapsedTime = Date.now() - animationStartTimeRef.current;
    const totalDuration = ((allLogos.length * 3) / 1.5) * 1000; // Convert to ms
    const progress = (elapsedTime % totalDuration) / totalDuration;
    currentPositionRef.current = -100 * allLogos.length * progress;

    controls.stop();
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);

    // Get current position from ref
    const currentX = currentPositionRef.current;
    const targetX = -100 * allLogos.length;
    const remainingDistance = Math.abs(targetX - currentX);
    const totalDistance = 100 * allLogos.length;

    // Calculate remaining duration to maintain constant speed
    const totalDuration = (allLogos.length * 3) / 1.5;
    const remainingDuration = (remainingDistance / totalDistance) * totalDuration;

    // Update animation start time for next cycle
    animationStartTimeRef.current = Date.now();

    // Resume from current position with calculated duration
    controls.start({
      x: targetX,
      transition: {
        duration: remainingDuration,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      }
    });
  };

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="relative w-full overflow-hidden py-4">
      <motion.div
        className="flex gap-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          className="flex gap-12 flex-shrink-0"
          animate={controls}
        >
          {duplicatedLogos.map((logo, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={`${logo.name}-${index}`}
                className="relative flex-shrink-0"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                animate={{
                  scale: isHovered ? 1.3 : 1,
                }}
                transition={{
                  scale: { duration: 0.3 }
                }}
              >
                <div className="relative w-16 h-16">
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    fill
                    className="object-contain transition-all duration-500"
                    style={{
                      filter: isHovered
                        ? 'grayscale(0%)'
                        : isDark
                          ? 'grayscale(100%) opacity(0.3) brightness(2)'
                          : 'grayscale(100%) opacity(0.3)',
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Gradient edges for infinite scroll effect */}
      <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-[#F5F5F5] dark:from-gray-950 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-[#F5F5F5] dark:from-gray-950 to-transparent pointer-events-none" />
    </div>
  );
};

export default DataSourceLogos;