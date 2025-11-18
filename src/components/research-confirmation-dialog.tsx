'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResearchConfirmationDialogProps {
  location: { name: string; lat: number; lng: number } | null;
  onConfirm: (customInstructions?: string) => void;
  onCancel: () => void;
}

const PRESETS = [
  {
    id: 'general',
    label: 'General',
    prompt: 'Provide a comprehensive historical overview of this location, covering major events, cultural significance, and key developments throughout history.',
  },
  {
    id: 'wars',
    label: 'Wars',
    prompt: 'Focus on wars, battles, and military conflicts that have taken place at this location. Include details about the opposing forces, key battles, strategies, outcomes, and historical impact.',
  },
  {
    id: 'nature',
    label: 'Nature',
    prompt: 'Research the natural history and geography of this location, including geological formations, climate history, natural landmarks, ecosystems, and environmental changes over time.',
  },
  {
    id: 'animals',
    label: 'Wildlife',
    prompt: 'Focus on the animal life and wildlife of this location, including native species, extinct fauna, conservation efforts, and the relationship between wildlife and human settlement.',
  },
  {
    id: 'people',
    label: 'People',
    prompt: 'Research notable people associated with this location, including historical figures, leaders, artists, scientists, and their contributions to history and culture.',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    prompt: 'Focus on architectural history and significant buildings at this location, including historical structures, architectural styles, construction techniques, and cultural importance.',
  },
  {
    id: 'culture',
    label: 'Culture',
    prompt: 'Research the cultural and artistic heritage of this location, including traditions, customs, art movements, literature, music, and cultural practices throughout history.',
  },
  {
    id: 'economy',
    label: 'Economy',
    prompt: 'Focus on the economic history and trade of this location, including major industries, trade routes, economic developments, and the evolution of commerce.',
  },
];

export function ResearchConfirmationDialog({
  location,
  onConfirm,
  onCancel,
}: ResearchConfirmationDialogProps) {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">
                Research {location.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose a focus or leave blank for general history
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Preset Pills */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Quick presets (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      setCustomInstructions('');
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                      selectedPreset === preset.id && !customInstructions
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
                className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Custom instructions</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
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
                      placeholder="e.g., Focus on indigenous peoples before colonization..."
                      className="min-h-[80px] text-sm resize-none mt-2"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex gap-2 justify-between items-center">
            <Button
              variant="ghost"
              onClick={onCancel}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              size="default"
              className="px-6 font-semibold"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start Research
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
