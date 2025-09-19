// Progressive Web App utilities and mobile enhancements

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  startUrl: string;
  scope: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: 'any' | 'maskable' | 'monochrome';
  }>;
  categories: string[];
  lang: string;
  dir: 'ltr' | 'rtl';
  preferRelatedApplications: boolean;
  relatedApplications?: Array<{
    platform: string;
    url: string;
    id?: string;
  }>;
}

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: InstallPromptEvent | null = null;
  private isInstalled = false;
  private isOnline = true;
  private updateAvailable = false;
  private serviceWorker: ServiceWorker | null = null;

  constructor() {
    this.initializePWA();
  }

  private async initializePWA() {
    if (typeof window === 'undefined') return;

    // Check if app is already installed
    this.checkInstallationStatus();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as InstallPromptEvent;
      this.showInstallBanner();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallBanner();
      this.trackInstallation();
    });

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOfflineStatus();
    });

    // Register service worker
    await this.registerServiceWorker();

    // Check for updates
    this.checkForUpdates();
  }

  private checkInstallationStatus() {
    // Check if running in standalone mode (installed)
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');
  }

  private showInstallBanner() {
    if (this.isInstalled) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 transform translate-y-full transition-transform duration-300';
    
    banner.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">Install AR Hub</h3>
            <p class="text-xs text-gray-600 dark:text-gray-300">Get quick access and offline support</p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button id="pwa-install-dismiss" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <button id="pwa-install-button" class="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600 transition-colors">
            Install
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animate in
    setTimeout(() => {
      banner.classList.remove('translate-y-full');
    }, 100);

    // Set up event listeners
    const installButton = banner.querySelector('#pwa-install-button');
    const dismissButton = banner.querySelector('#pwa-install-dismiss');

    installButton?.addEventListener('click', () => {
      this.installApp();
    });

    dismissButton?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  private hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.add('translate-y-full');
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.trackInstallation();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorker = registration.active || registration.waiting || registration.installing;
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                this.showUpdateBanner();
              }
            });
          }
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private showUpdateBanner() {
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.className = 'fixed top-4 left-4 right-4 z-50 bg-green-500 text-white rounded-lg shadow-lg p-4 transform -translate-y-full transition-transform duration-300';
    
    banner.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <div>
            <h3 class="text-sm font-medium">Update Available</h3>
            <p class="text-xs opacity-90">A new version is ready to install</p>
          </div>
        </div>
        <div class="flex space-x-2">
          <button id="pwa-update-dismiss" class="text-white opacity-70 hover:opacity-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <button id="pwa-update-button" class="bg-white text-green-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
            Update
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animate in
    setTimeout(() => {
      banner.classList.remove('-translate-y-full');
    }, 100);

    // Set up event listeners
    const updateButton = banner.querySelector('#pwa-update-button');
    const dismissButton = banner.querySelector('#pwa-update-dismiss');

    updateButton?.addEventListener('click', () => {
      this.updateApp();
    });

    dismissButton?.addEventListener('click', () => {
      this.hideUpdateBanner();
    });
  }

  private hideUpdateBanner() {
    const banner = document.getElementById('pwa-update-banner');
    if (banner) {
      banner.classList.add('-translate-y-full');
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
  }

  public async updateApp(): Promise<void> {
    if (this.serviceWorker) {
      this.serviceWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  private checkForUpdates() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    }
  }

  private handleOnlineStatus() {
    // Show online indicator
    this.showStatusIndicator('online', 'You\'re back online');
    
    // Sync any pending data
    this.syncPendingData();
  }

  private handleOfflineStatus() {
    // Show offline indicator
    this.showStatusIndicator('offline', 'You\'re offline - some features may be limited');
  }

  private showStatusIndicator(status: 'online' | 'offline', message: string) {
    const indicator = document.createElement('div');
    indicator.id = 'pwa-status-indicator';
    indicator.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transform -translate-y-full transition-transform duration-300 ${
      status === 'online' 
        ? 'bg-green-500 text-white' 
        : 'bg-yellow-500 text-white'
    }`;
    
    indicator.textContent = message;
    document.body.appendChild(indicator);

    // Animate in
    setTimeout(() => {
      indicator.classList.remove('-translate-y-full');
    }, 100);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      indicator.classList.add('-translate-y-full');
      setTimeout(() => {
        indicator.remove();
      }, 300);
    }, 3000);
  }

  private async syncPendingData() {
    // Implement data synchronization logic here
    // This would sync any data that was queued while offline
    console.log('Syncing pending data...');
  }

  private trackInstallation() {
    // Track installation in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installation'
      });
    }
  }

  // Public methods
  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public isAppOnline(): boolean {
    return this.isOnline;
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  public hasUpdate(): boolean {
    return this.updateAvailable;
  }

  public async shareContent(data: ShareData): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }
    return false;
  }

  public async addToHomeScreen(): Promise<boolean> {
    return this.installApp();
  }
}

// Mobile-specific utilities
export class MobileEnhancements {
  private isMobile = false;
  private isTouch = false;
  private orientation = 'portrait';

  constructor() {
    this.initializeMobileDetection();
    this.setupMobileFeatures();
  }

  private initializeMobileDetection() {
    if (typeof window === 'undefined') return;

    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        this.handleOrientationChange();
      }, 100);
    });

    // Listen for resize events
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  private setupMobileFeatures() {
    if (!this.isMobile) return;

    // Add mobile-specific classes
    document.documentElement.classList.add('mobile');

    // Prevent zoom on input focus (iOS)
    this.preventZoomOnInput();

    // Add touch feedback
    this.addTouchFeedback();

    // Optimize scrolling
    this.optimizeScrolling();

    // Add pull-to-refresh
    this.addPullToRefresh();
  }

  private preventZoomOnInput() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
      });

      input.addEventListener('blur', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1');
        }
      });
    });
  }

  private addTouchFeedback() {
    // Add touch feedback to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"], input[type="submit"]');
    
    interactiveElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.classList.add('touch-active');
      });

      element.addEventListener('touchend', () => {
        setTimeout(() => {
          element.classList.remove('touch-active');
        }, 150);
      });
    });
  }

  private optimizeScrolling() {
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';

    // Add momentum scrolling for iOS
    document.documentElement.style.webkitOverflowScrolling = 'touch';
  }

  private addPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (!isPulling) return;

      currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;

      if (pullDistance > 0) {
        e.preventDefault();
        // Add pull-to-refresh visual feedback
        this.showPullToRefreshIndicator(pullDistance);
      }
    });

    document.addEventListener('touchend', () => {
      if (!isPulling) return;

      const pullDistance = currentY - startY;
      if (pullDistance > 100) {
        // Trigger refresh
        this.triggerRefresh();
      }

      this.hidePullToRefreshIndicator();
      isPulling = false;
    });
  }

  private showPullToRefreshIndicator(distance: number) {
    let indicator = document.getElementById('pull-to-refresh-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'pull-to-refresh-indicator';
      indicator.className = 'fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-2 transform -translate-y-full transition-transform duration-200';
      indicator.innerHTML = `
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Pull to refresh</span>
        </div>
      `;
      document.body.appendChild(indicator);
    }

    const progress = Math.min(distance / 100, 1);
    indicator.style.transform = `translateY(${(progress - 1) * 100}%)`;
  }

  private hidePullToRefreshIndicator() {
    const indicator = document.getElementById('pull-to-refresh-indicator');
    if (indicator) {
      indicator.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        indicator.remove();
      }, 200);
    }
  }

  private triggerRefresh() {
    window.location.reload();
  }

  private handleOrientationChange() {
    // Dispatch custom event for orientation change
    window.dispatchEvent(new CustomEvent('orientationchange', {
      detail: { orientation: this.orientation }
    }));
  }

  private handleResize() {
    // Dispatch custom event for resize
    window.dispatchEvent(new CustomEvent('resize', {
      detail: { 
        width: window.innerWidth, 
        height: window.innerHeight,
        orientation: this.orientation
      }
    }));
  }

  public isMobileDevice(): boolean {
    return this.isMobile;
  }

  public isTouchDevice(): boolean {
    return this.isTouch;
  }

  public getOrientation(): string {
    return this.orientation;
  }

  public getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
}

// Export singleton instances
export const pwaManager = new PWAManager();
export const mobileEnhancements = new MobileEnhancements();

// React hook for PWA features
export function usePWA() {
  const [isInstalled, setIsInstalled] = React.useState(pwaManager.isAppInstalled());
  const [isOnline, setIsOnline] = React.useState(pwaManager.isAppOnline());
  const [canInstall, setCanInstall] = React.useState(pwaManager.canInstall());
  const [hasUpdate, setHasUpdate] = React.useState(pwaManager.hasUpdate());

  React.useEffect(() => {
    const handleAppInstalled = () => setIsInstalled(true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isInstalled,
    isOnline,
    canInstall,
    hasUpdate,
    install: () => pwaManager.installApp(),
    update: () => pwaManager.updateApp(),
    share: (data: ShareData) => pwaManager.shareContent(data),
  };
}

// React hook for mobile features
export function useMobile() {
  const [isMobile, setIsMobile] = React.useState(mobileEnhancements.isMobileDevice());
  const [isTouch, setIsTouch] = React.useState(mobileEnhancements.isTouchDevice());
  const [orientation, setOrientation] = React.useState(mobileEnhancements.getOrientation());
  const [viewportSize, setViewportSize] = React.useState(mobileEnhancements.getViewportSize());

  React.useEffect(() => {
    const handleOrientationChange = (e: CustomEvent) => {
      setOrientation(e.detail.orientation);
    };

    const handleResize = (e: CustomEvent) => {
      setViewportSize({
        width: e.detail.width,
        height: e.detail.height
      });
      setOrientation(e.detail.orientation);
    };

    window.addEventListener('orientationchange', handleOrientationChange as EventListener);
    window.addEventListener('resize', handleResize as EventListener);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange as EventListener);
      window.removeEventListener('resize', handleResize as EventListener);
    };
  }, []);

  return {
    isMobile,
    isTouch,
    orientation,
    viewportSize,
  };
}
