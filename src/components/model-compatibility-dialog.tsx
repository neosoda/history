"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ModelCompatibilityDialogProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  error: string;
  modelName?: string;
}

export function ModelCompatibilityDialog({
  open,
  onClose,
  onContinue,
  error,
  modelName,
}: ModelCompatibilityDialogProps) {
  const isToolError = error.toLowerCase().includes("tool") || error.toLowerCase().includes("function");
  const isThinkingError = error.toLowerCase().includes("thinking");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <DialogTitle>Problème de compatibilité du modèle</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {isToolError && (
              <>
                <p className="mb-2">
                  <span className="font-semibold">{modelName || "Ce modèle"}</span> ne supporte pas
                  l'appel d'outils (appels de fonctions).
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cela signifie qu'il ne pourra pas exécuter de code Python, effectuer des recherches sur le web, récupérer des données biomédicales ou utiliser d'autres outils interactifs. Vous pouvez toujours avoir une conversation, mais les fonctionnalités seront limitées aux réponses textuelles uniquement.
                </p>
              </>
            )}
            {isThinkingError && (
              <>
                <p className="mb-2">
                  <span className="font-semibold">{modelName || "Ce modèle"}</span> ne supporte pas
                  le mode réflexion (raisonnement en chaîne de pensée).
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Le modèle fonctionnera toujours normalement, mais n'affichera pas ses étapes de raisonnement.
                </p>
              </>
            )}
            {!isToolError && !isThinkingError && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {error}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={onContinue} className="w-full">
            Continuer quand même
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
