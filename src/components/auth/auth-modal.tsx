'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { track } from '@vercel/analytics';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSignUpSuccess?: (message: string) => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const signInWithValyu = useAuthStore((state) => state.signInWithValyu);
  const authLoading = useAuthStore((state) => state.loading);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track when auth modal is shown
  useEffect(() => {
    if (open) {
      track('Auth Modal Shown', {
        source: 'prompt_submit',
      });
    }
  }, [open]);

  const handleValyuSignIn = async () => {
    setLoading(true);
    setError(null);

    // Track sign in button click
    track('Valyu Sign In Clicked', {
      step: 'initiate',
    });

    try {
      const { error } = await signInWithValyu();
      if (error) {
        setError(error.message || 'Échec de l\'initialisation de la connexion');
        setLoading(false);
        // Track sign in error
        track('Valyu Sign In Error', {
          step: 'initiate',
          error: error.message || 'Failed to initiate sign in',
        });
      }
      // Don't close here as OAuth will redirect
      // Don't set loading false here as user will be redirected
    } catch (err) {
      setError('Une erreur inattendue est survenue');
      setLoading(false);
      // Track unexpected error
      track('Valyu Sign In Error', {
        step: 'initiate',
        error: 'unexpected_error',
      });
    }
  };

  const isLoading = loading || authLoading;

  const handleClose = () => {
    // Track modal dismissed without signing in
    track('Auth Modal Dismissed', {
      had_error: !!error,
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Se connecter avec Valyu</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            Valyu est la colonne vertébrale d'information de History, offrant à notre moteur d'IA un accès aux données en temps réel sur le web, ainsi qu'aux sources académiques et propriétaires.
          </p>

          {/* Free Credits Badge */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">🎁</span>
              <span className="text-green-600 dark:text-green-400 font-bold">10$ de crédits offerts</span>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Les nouveaux comptes reçoivent 10$ de crédits de recherche offerts
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            onClick={handleValyuSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connexion...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span>Se connecter avec</span>
                <Image
                  src="/valyu.svg"
                  alt="Valyu"
                  width={60}
                  height={20}
                  className="h-5 w-auto invert"
                />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Pas encore de compte ? Vous pouvez en créer un lors de la connexion.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
