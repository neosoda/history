"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MissingKeysDialog() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<{
    deepresearchKeyPresent: boolean;
    mapboxKeyPresent: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch environment status
        const envRes = await fetch("/api/env-status", { cache: "no-store" });
        if (!envRes.ok) throw new Error("Failed to fetch env status");
        const envData = await envRes.json();

        if (!cancelled) {
          setStatus(envData);

          const missing =
            !envData.deepresearchKeyPresent ||
            !envData.mapboxKeyPresent;

          // Only show dialog if API keys are missing
          if (missing) setOpen(true);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) return null;

  const missingDeepResearch = !status.deepresearchKeyPresent;
  const missingMapbox = !status.mapboxKeyPresent;

  // Don't show if no API key issues
  if (!missingDeepResearch && !missingMapbox) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuration requise</DialogTitle>
          <DialogDescription>
            Cette application nécessite des clés API pour fonctionner pleinement. Certaines fonctionnalités sont désactivées tant que les clés ne sont pas ajoutées.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {missingDeepResearch && (
            <div className="rounded-md border p-3">
              <div className="font-medium">Clé API DeepResearch manquante</div>
              <div className="text-muted-foreground">
                Ajoutez DEEPRESEARCH_API_KEY ou VALYU_API_KEY à votre environnement pour activer la recherche historique.
              </div>
            </div>
          )}
          {missingMapbox && (
            <div className="rounded-md border p-3">
              <div className="font-medium">Jeton d'accès Mapbox manquant</div>
              <div className="text-muted-foreground">
                Ajoutez NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN pour activer le globe interactif.
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
          <a
            href="https://platform.valyu.ai"
            target="_blank"
            rel="noreferrer"
          >
            <Button>Obtenir une clé API</Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
