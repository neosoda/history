'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/use-auth-store';

interface ResearchConfirmationDialogProps {
  location: { name: string; lat: number; lng: number } | null;
  onConfirm: (customInstructions?: string) => void;
  onCancel: () => void;
  onSignUp?: () => void;
}

const PRESETS = [
  {
    id: 'general',
    label: 'Général',
    prompt: 'Fournir un aperçu historique complet de ce lieu, couvrant les événements majeurs, l\'importance culturelle et les développements clés à travers l\'histoire.',
  },
  {
    id: 'wars',
    label: 'Guerres',
    prompt: 'Se concentrer sur les guerres, les batailles et les conflits militaires qui ont eu lieu à cet endroit. Inclure des détails sur les forces en présence, les batailles clés, les stratégies, les résultats et l\'impact historique.',
  },
  {
    id: 'nature',
    label: 'Nature',
    prompt: 'Rechercher l\'histoire naturelle et la géographie de ce lieu, y compris les formations géologiques, l\'histoire du climat, les sites naturels, les écosystèmes et les changements environnementaux au fil du temps.',
  },
  {
    id: 'animals',
    label: 'Faune & Flore',
    prompt: 'Se concentrer sur la vie animale et la faune de ce lieu, y compris les espèces indigènes, la faune disparue, les efforts de conservation et la relation entre la faune et les établissements humains.',
  },
  {
    id: 'people',
    label: 'Personnalités',
    prompt: 'Rechercher les personnes notables associées à ce lieu, y compris les figures historiques, les dirigeants, les artistes, les scientifiques et leurs contributions à l\'histoire et à la culture.',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    prompt: 'Se concentrer sur l\'histoire architecturale et les bâtiments significatifs de ce lieu, y compris les structures historiques, les styles architecturaux, les techniques de construction et l\'importance culturelle.',
  },
  {
    id: 'culture',
    label: 'Culture',
    prompt: 'Rechercher le patrimoine culturel et artistique de ce lieu, y compris les traditions, les coutumes, les mouvements artistiques, la littérature, la musique et les pratiques culturelles à travers l\'histoire.',
  },
  {
    id: 'economy',
    label: 'Économie',
    prompt: 'Se concentrer sur l\'histoire économique et le commerce de ce lieu, y compris les principales industries, les routes commerciales, les développements économiques et l\'évolution du commerce.',
  },
  {
    id: 'news',
    label: 'Actualités',
    prompt: 'Rechercher les événements actuels et récents à cet endroit, y compris les développements politiques importants, les mouvements sociaux, les catastrophes, les célébrations et les incidents notables.',
  },
  {
    id: 'geology',
    label: 'Géologie',
    prompt: 'Se concentrer sur l\'histoire et les caractéristiques géologiques de ce lieu, y compris les formations rocheuses, l\'activité tectonique, l\'histoire volcanique, les modèles d\'érosion, les gisements minéraux et les forces géologiques qui ont façonné le paysage.',
  },
  {
    id: 'culinary',
    label: 'Gastronomie',
    prompt: 'Rechercher l\'histoire culinaire et la culture alimentaire de ce lieu, y compris les plats traditionnels, les techniques de cuisine, les ingrédients locaux, les traditions liées à l\'alimentation et l\'évolution de la cuisine au fil du temps.',
  },
];

export function ResearchConfirmationDialog({
  location,
  onConfirm,
  onCancel,
  onSignUp,
}: ResearchConfirmationDialogProps) {
  const { user } = useAuthStore();
  const [selectedPreset, setSelectedPreset] = useState<string>('general');
  const [customInstructions, setCustomInstructions] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  if (!location) return null;

  const handleConfirm = () => {
    if (customInstructions.trim()) {
      onConfirm(customInstructions.trim());
    } else {
      const preset = PRESETS.find(p => p.id === selectedPreset);
      onConfirm(preset?.prompt);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-background rounded-xl shadow-2xl max-w-md w-full border"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold truncate">
                Rechercher {location.name}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                Choisissez un axe ou laissez vide pour l'histoire générale
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 sm:p-2 hover:bg-accent rounded-lg transition-colors flex-shrink-0 min-h-11 min-w-11 flex items-center justify-center"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
            {/* Preset Pills */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-muted-foreground mb-1.5 sm:mb-2">
                Préréglages rapides (optionnel)
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      setCustomInstructions('');
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-all border min-h-8 ${selectedPreset === preset.id && !customInstructions
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-card-foreground border-border hover:bg-accent hover:text-accent-foreground'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instructions Dropdown */}
            <div>
              <button
                onClick={() => setShowCustom(!showCustom)}
                className="w-full flex items-center justify-between text-[10px] sm:text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-h-9"
              >
                <span>Instructions personnalisées</span>
                <ChevronDown className={`h-3 w-3 transition-transform flex-shrink-0 ${showCustom ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showCustom && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <Textarea
                      value={customInstructions}
                      onChange={(e) => {
                        setCustomInstructions(e.target.value);
                        if (e.target.value) setSelectedPreset('');
                      }}
                      placeholder="ex: Focus sur les peuples indigènes avant la colonisation..."
                      className="min-h-[70px] sm:min-h-[80px] text-xs sm:text-sm resize-none mt-1.5 sm:mt-2"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t">
            {!user ? (
              // Anonymous user - show signup incentive
              <div className="space-y-2">
                <Button
                  onClick={handleConfirm}
                  size="default"
                  variant="outline"
                  className="w-full font-semibold min-h-11 text-xs sm:text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="truncate">Continuer sans s'inscrire</span>
                </Button>
                {onSignUp && (
                  <Button
                    onClick={onSignUp}
                    size="default"
                    className="w-full font-semibold min-h-11 text-xs sm:text-sm"
                  >
                    <span className="truncate">S'inscrire pour sauvegarder</span>
                  </Button>
                )}
              </div>
            ) : (
              // Signed in user - show normal buttons
              <div className="flex gap-2 justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  size="sm"
                  className="min-h-11 text-xs sm:text-sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirm}
                  size="default"
                  className="px-4 sm:px-6 font-semibold min-h-11 text-xs sm:text-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  <span className="truncate">Démarrer la recherche</span>
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
