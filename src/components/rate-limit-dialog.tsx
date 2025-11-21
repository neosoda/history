'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Check, Github, CreditCard, Code, ChartLine, Building2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { track } from '@vercel/analytics';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { useRateLimit } from '@/lib/hooks/use-rate-limit';
import { createClient } from '@/utils/supabase/client-wrapper';
import { EnterpriseContactModal } from '@/components/enterprise/enterprise-contact-modal';

interface RateLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resetTime: Date;
  onShowAuth?: () => void;
}

export function RateLimitDialog({ open, onOpenChange, resetTime, onShowAuth }: RateLimitDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { tier, hasPolarCustomer } = useRateLimit();

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredLanguage') || 'Python';
    }
    return 'Python';
  });
  
  // Dynamic example queries
  const exampleQueries = useMemo(() => [
    "Latest Alzheimer's drug approvals",
    "Immunotherapy advancements in lung cancer",
    "Phase 3 trials for melanoma CAR-T therapy",
    "Pembrolizumab efficacy in NSCLC",
    "CRISPR safety in human trials",
    "Drug interactions between metformin and lisinopril",
    "COVID-19 vaccine efficacy comparison",
    "mRNA vaccine technology developments",
    "Monoclonal antibody treatments for cancer",
    "Gene therapy clinical trial outcomes"
  ], []);

  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLanguage', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (open) {
      // Track rate limit hit
      track('Rate Limit Hit', {
        resetTime: resetTime.toISOString(),
        remainingQueries: 0
      });
    }
  }, [open, resetTime]);

  // Typing animation effect
  useEffect(() => {
    if (!open) return;

    let timeout: NodeJS.Timeout;
    const currentExample = exampleQueries[currentExampleIndex];
    
    if (isTyping) {
      // Typing forward
      if (currentText.length < currentExample.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentExample.slice(0, currentText.length + 1));
        }, 50); // Typing speed
      } else {
        // Finished typing, wait then start erasing
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause after finishing
      }
    } else {
      // Erasing
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 30); // Erasing speed (faster)
      } else {
        // Finished erasing, move to next example
        setCurrentExampleIndex((prev) => (prev + 1) % exampleQueries.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [open, currentText, isTyping, currentExampleIndex, exampleQueries]);

  // Reset animation when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentExampleIndex(0);
      setCurrentText('');
      setIsTyping(true);
    }
  }, [open]);

  const formatResetTime = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleCopy = async (code: string) => {
    track('Code Copy', {
      source: 'rate_limit_dialog',
      language: activeTab,
      codeLength: code.length
    });
    
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpgrade = async (planType: string) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      // Create Polar checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ plan: planType })
      });

      if (response.ok) {
        const { checkoutUrl } = await response.json();
        
        // Track checkout initiation
        track('Checkout Started', {
          source: 'rate_limit_dialog',
          plan: planType
        });
        
        window.location.href = checkoutUrl;
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleBuildYourOwn = () => {
    track('Platform Clickthrough', {
      source: 'rate_limit_dialog',
      action: 'build_your_own',
      url: 'https://platform.valyu.ai/?utm_source=biomed.valyu.ai&utm_medium=rate_limit_dialog'
    });
    
    window.open('https://platform.valyu.ai/?utm_source=biomed.valyu.ai&utm_medium=rate_limit_dialog', '_blank');
  };

  const handleCreateAccount = () => {
    track('Auth Modal Opened', {
      source: 'rate_limit_dialog',
      trigger: 'create_account'
    });
    
    onShowAuth?.();
    onOpenChange(false);
  };

  const codeSnippet = `curl -X POST "https://api.valyu.ai/v1/search" \\
  -H "Authorization: x-api-key your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "latest tesla MD&A 10-k", "max_results": 2}'`;

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="fixed left-[50%] top-[50%] z-50 w-[92vw] sm:w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] p-4 sm:p-6">
            <DialogTitle className="sr-only">Daily Rate Limit Reached</DialogTitle>

            <div className="text-center space-y-4 sm:space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-lg sm:text-xl font-light text-foreground mb-1 sm:mb-2">
                  Daily limit reached
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Resets in <span className="font-medium">{formatResetTime(resetTime)}</span>
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2 sm:space-y-3">
                {!user ? (
                  <Button
                    onClick={handleCreateAccount}
                    disabled={loading}
                    className="w-full min-h-11 text-sm sm:text-base"
                  >
                    Create Account
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleUpgrade('pay_per_use')}
                      disabled={loading}
                      className="w-full min-h-11 text-sm sm:text-base"
                    >
                      <ChartLine className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="truncate">Can&apos;t wait? Pay Per Use</span>
                    </Button>
                    <Button
                      onClick={() => handleUpgrade('unlimited')}
                      disabled={loading}
                      variant="outline"
                      className="w-full min-h-11 text-sm sm:text-base"
                    >
                      <CreditCard className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Unlimited - $50/month
                    </Button>
                  </div>
                )}

                {/* Enterprise Option */}
                {user && process.env.NEXT_PUBLIC_APP_MODE !== 'development' && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded-lg border border-border">
                    <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-1">
                          Need enterprise deployment?
                        </h4>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          Deploy Valyu&apos;s infrastructure in your organization with custom data integrations and AI agents
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setShowEnterpriseModal(true);
                        track('Enterprise CTA Clicked', { source: 'rate_limit_dialog' });
                      }}
                      variant="outline"
                      className="w-full min-h-11 text-xs sm:text-sm"
                    >
                      <Building2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Book a Demo
                    </Button>
                  </div>
                )}

                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    onClick={() => {
                      track('GitHub CTA Click', {
                        source: 'rate_limit_dialog',
                        url: 'https://github.com/yorkeccak/history/'
                      });
                      window.open('https://github.com/yorkeccak/history/', '_blank');
                    }}
                    variant="ghost"
                    className="flex-1 min-h-11 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Github className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Host Yourself</span>
                  </Button>
                  <Button
                    onClick={handleBuildYourOwn}
                    variant="ghost"
                    className="flex-1 min-h-11 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Code className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Build with Valyu</span>
                  </Button>
                </div>
              </div>

              {/* Simple code example */}
              <div className="bg-muted rounded-lg p-3 sm:p-4 text-left">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">API Example</span>
                  <Button
                    onClick={() => handleCopy(codeSnippet)}
                    variant="ghost"
                    size="sm"
                    className="h-7 sm:h-8 px-2 min-h-11"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <pre className="text-[10px] sm:text-xs font-mono text-foreground overflow-x-auto">
                  {codeSnippet}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <EnterpriseContactModal
        open={showEnterpriseModal}
        onClose={() => setShowEnterpriseModal(false)}
      />
    </AnimatePresence>
  );
}