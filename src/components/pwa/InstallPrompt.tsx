'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show again after 7 days
    if (dismissed && daysSinceDismissed < 7) {
      return;
    }

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show instructions after delay
    if (iOS && !standalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-md mx-auto bg-[#3D2314] text-white rounded-lg shadow-2xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Image
                src="/ep-icon.png"
                alt="EP Fitness"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">Install EP Fitness</h3>
                  <p className="text-[#D4C4A8] text-sm mt-1">
                    {isIOS
                      ? 'Add to your home screen for quick access'
                      : 'Install for a better experience'}
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-[#D4C4A8] hover:text-white p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isIOS ? (
                <div className="mt-3 text-sm text-[#EBE4D6]">
                  <p className="flex items-center gap-2">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs">1</span>
                    Tap the share button
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs">2</span>
                    Scroll and tap &quot;Add to Home Screen&quot;
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="mt-3 w-full bg-white text-[#3D2314] font-semibold py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-[#EBE4D6] transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Install App
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div className="bg-[#4D3324] px-4 py-3 flex items-center justify-around text-xs text-[#D4C4A8]">
          <span className="flex items-center gap-1">
            <Smartphone className="h-4 w-4" />
            Works offline
          </span>
          <span>|</span>
          <span>Fast access</span>
          <span>|</span>
          <span>Push notifications</span>
        </div>
      </div>
    </div>
  );
}
