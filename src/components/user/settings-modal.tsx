'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertCircle, CheckCircle, Mail, Monitor } from 'lucide-react';
import { ThemeSelector } from '@/components/ui/theme-toggle';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const user = useAuthStore((state) => state.user);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim() || newEmail === user.email) {
      setMessage({ type: 'error', text: 'Veuillez entrer une adresse e-mail différente' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { pb } = await import('@/lib/pocketbase');
      await pb.collection('users').requestEmailChange(newEmail.trim());

      setMessage({
        type: 'success',
        text: 'Demande de changement d\'e-mail envoyée. Veuillez consulter votre nouvelle adresse e-mail pour le lien de confirmation.'
      });
      setNewEmail('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Échec de la mise à jour de l\'e-mail'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[92vw]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Paramètres du compte</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Current User Info */}
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Thème
              </label>
            </div>
            <ThemeSelector />
          </div>

          {/* Email Update Form */}
          <form onSubmit={handleEmailUpdate} className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 block">
                Changer l'adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Entrez la nouvelle adresse e-mail"
                  className="pl-8 sm:pl-10 text-xs sm:text-sm min-h-11"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`flex items-start gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm ${message.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{message.text}</span>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 min-h-11 text-xs sm:text-sm"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || !newEmail.trim()}
                className="flex-1 min-h-11 text-xs sm:text-sm"
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour l\'e-mail'}
              </Button>
            </div>
          </form>

          <div className="text-[10px] sm:text-xs text-gray-500 p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <strong>Note :</strong> Vous recevrez des e-mails de confirmation sur votre adresse actuelle et sur la nouvelle.
            Vous devez confirmer le changement depuis les deux adresses par sécurité.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}