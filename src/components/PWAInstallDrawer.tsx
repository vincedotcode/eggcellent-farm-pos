import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Zap, Wifi } from 'lucide-react';

export const PWAInstallDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWA();

  useEffect(() => {
    // Show drawer if installable and not dismissed
    if (isInstallable && !dismissed && !isInstalled) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed, isInstalled]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setDismissed(true);
    // Remember dismissal for session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or user dismissed
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="max-w-sm mx-auto">
        <DrawerHeader className="text-center">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <DrawerTitle className="flex items-center justify-center gap-2 text-primary">
                <Smartphone className="h-5 w-5" />
                Install EggPro ERP
              </DrawerTitle>
              <DrawerDescription className="mt-2">
                Get the full app experience with instant access from your home screen
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Zap className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium text-sm">Lightning Fast</p>
                <p className="text-xs text-muted-foreground">Instant loading and smooth performance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Wifi className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium text-sm">Works Offline</p>
                <p className="text-xs text-muted-foreground">Access your data even without internet</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Smartphone className="h-5 w-5 text-accent" />
              <div>
                <p className="font-medium text-sm">Native Feel</p>
                <p className="text-xs text-muted-foreground">Full-screen app experience</p>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <Button 
            onClick={handleInstall}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="w-full"
          >
            Maybe Later
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};