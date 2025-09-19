// Notification system and real-time updates

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  url?: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'promotion';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class NotificationManager {
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: false,
  };
  private toastContainer: HTMLElement | null = null;
  private activeToasts = new Map<string, HTMLElement>();
  private notificationQueue: NotificationData[] = [];
  private isOnline = true;

  constructor() {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    if (typeof window === 'undefined') return;

    // Check notification permission
    await this.checkPermission();

    // Create toast container
    this.createToastContainer();

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processNotificationQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data);
        }
      });
    }
  }

  private async checkPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    const permission = Notification.permission;
    this.permission = {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default',
    };
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default',
      };
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  public async showNotification(data: NotificationData): Promise<void> {
    // Add to queue if offline
    if (!this.isOnline) {
      this.notificationQueue.push(data);
      return;
    }

    if (this.permission.granted) {
      await this.showBrowserNotification(data);
    } else {
      // Fallback to toast notification
      this.showToast({
        id: data.id,
        type: data.type || 'info',
        title: data.title,
        message: data.body,
        duration: 5000,
        action: data.actions?.[0] ? {
          label: data.actions[0].title,
          onClick: () => this.handleNotificationAction(data.actions![0].action, data),
        } : undefined,
      });
    }
  }

  private async showBrowserNotification(data: NotificationData): Promise<void> {
    if (!this.permission.granted) return;

    const notification = new Notification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      tag: data.tag,
      data: data.data,
      requireInteraction: data.requireInteraction,
      silent: data.silent,
      timestamp: data.timestamp || Date.now(),
    });

    // Handle notification click
    notification.onclick = () => {
      this.handleNotificationClick(data);
      notification.close();
    };

    // Handle notification close
    notification.onclose = () => {
      this.trackNotificationEvent('close', data);
    };

    // Handle notification error
    notification.onerror = () => {
      this.trackNotificationEvent('error', data);
    };

    // Auto-close after 5 seconds unless requireInteraction is true
    if (!data.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    this.trackNotificationEvent('show', data);
  }

  private handleNotificationClick(data: NotificationData): void {
    this.trackNotificationEvent('click', data);

    // Focus the window
    if (window.focus) {
      window.focus();
    }

    // Navigate to URL if provided
    if (data.url) {
      window.location.href = data.url;
    }

    // Handle custom click logic
    if (data.data?.onClick) {
      data.data.onClick();
    }
  }

  private handleNotificationAction(action: string, data: NotificationData): void {
    this.trackNotificationEvent('action', { ...data, action });

    // Handle custom action logic
    if (data.data?.onAction) {
      data.data.onAction(action);
    }
  }

  private trackNotificationEvent(event: string, data: NotificationData): void {
    // Track notification events in analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', `notification_${event}`, {
        event_category: 'Notifications',
        event_label: data.type || 'default',
        custom_parameter_1: data.id,
      });
    }
  }

  private createToastContainer(): void {
    if (typeof window === 'undefined') return;

    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'toast-container';
    this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2 pointer-events-none';
    document.body.appendChild(this.toastContainer);
  }

  public showToast(toast: ToastNotification): void {
    if (!this.toastContainer) return;

    const toastElement = this.createToastElement(toast);
    this.activeToasts.set(toast.id, toastElement);
    this.toastContainer.appendChild(toastElement);

    // Animate in
    setTimeout(() => {
      toastElement.classList.remove('translate-x-full', 'opacity-0');
    }, 100);

    // Auto-dismiss
    if (toast.duration !== 0) {
      setTimeout(() => {
        this.dismissToast(toast.id);
      }, toast.duration || 5000);
    }
  }

  private createToastElement(toast: ToastNotification): HTMLElement {
    const toastElement = document.createElement('div');
    toastElement.id = `toast-${toast.id}`;
    toastElement.className = `bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm w-full transform transition-all duration-300 translate-x-full opacity-0 pointer-events-auto`;

    const typeColors = {
      success: 'border-l-4 border-l-green-500',
      info: 'border-l-4 border-l-blue-500',
      warning: 'border-l-4 border-l-yellow-500',
      error: 'border-l-4 border-l-red-500',
    };

    toastElement.classList.add(typeColors[toast.type]);

    const iconMap = {
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
    };

    toastElement.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-lg">${iconMap[toast.type]}</span>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">
            ${toast.title}
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
            ${toast.message}
          </p>
          ${toast.action ? `
            <div class="mt-3">
              <button class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                ${toast.action.label}
              </button>
            </div>
          ` : ''}
        </div>
        ${toast.dismissible !== false ? `
          <div class="ml-4 flex-shrink-0">
            <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Set up event listeners
    const closeButton = toastElement.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.dismissToast(toast.id);
      });
    }

    if (toast.action) {
      const actionButton = toastElement.querySelector('button:not([class*="ml-4"])');
      if (actionButton) {
        actionButton.addEventListener('click', () => {
          toast.action!.onClick();
          this.dismissToast(toast.id);
        });
      }
    }

    return toastElement;
  }

  public dismissToast(id: string): void {
    const toastElement = this.activeToasts.get(id);
    if (!toastElement) return;

    toastElement.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      toastElement.remove();
      this.activeToasts.delete(id);
    }, 300);
  }

  public dismissAllToasts(): void {
    for (const id of this.activeToasts.keys()) {
      this.dismissToast(id);
    }
  }

  private async processNotificationQueue(): Promise<void> {
    if (!this.isOnline || this.notificationQueue.length === 0) return;

    const notifications = [...this.notificationQueue];
    this.notificationQueue = [];

    for (const notification of notifications) {
      await this.showNotification(notification);
      // Add small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  public getPermission(): NotificationPermission {
    return { ...this.permission };
  }

  public isSupported(): boolean {
    return 'Notification' in window;
  }

  public getActiveToasts(): string[] {
    return Array.from(this.activeToasts.keys());
  }
}

// Real-time updates manager
class RealTimeManager {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners = new Map<string, Set<(data: any) => void>>();
  private isConnected = false;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    if (typeof window === 'undefined') return;

    // Only connect if user is authenticated
    this.connect();
  }

  private connect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      this.eventSource = new EventSource('/api/events');
      
      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('Real-time connection established');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse real-time message:', error);
        }
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.handleReconnect();
      };

      // Listen for specific event types
      this.eventSource.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data);
        notificationManager.showNotification(data);
      });

      this.eventSource.addEventListener('project_update', (event) => {
        const data = JSON.parse(event.data);
        this.emit('project_update', data);
      });

      this.eventSource.addEventListener('user_activity', (event) => {
        const data = JSON.parse(event.data);
        this.emit('user_activity', data);
      });

    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      this.handleReconnect();
    }
  }

  private handleMessage(data: any): void {
    if (data.type && this.listeners.has(data.type)) {
      const listeners = this.listeners.get(data.type)!;
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in real-time listener:', error);
        }
      });
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  public on(event: string, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off(event: string, listener: (data: any) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)!;
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  public isConnectedToRealTime(): boolean {
    return this.isConnected;
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
  }
}

// Export singleton instances
export const notificationManager = new NotificationManager();
export const realTimeManager = new RealTimeManager();

// Utility functions
export function showNotification(data: Omit<NotificationData, 'id'>): void {
  const notification: NotificationData = {
    ...data,
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  notificationManager.showNotification(notification);
}

export function showToast(toast: Omit<ToastNotification, 'id'>): void {
  const toastNotification: ToastNotification = {
    ...toast,
    id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  notificationManager.showToast(toastNotification);
}

export function showSuccessToast(title: string, message: string, duration?: number): void {
  showToast({
    type: 'success',
    title,
    message,
    duration,
  });
}

export function showErrorToast(title: string, message: string, duration?: number): void {
  showToast({
    type: 'error',
    title,
    message,
    duration,
  });
}

export function showInfoToast(title: string, message: string, duration?: number): void {
  showToast({
    type: 'info',
    title,
    message,
    duration,
  });
}

export function showWarningToast(title: string, message: string, duration?: number): void {
  showToast({
    type: 'warning',
    title,
    message,
    duration,
  });
}

// React hooks
export function useNotifications() {
  const [permission, setPermission] = React.useState(notificationManager.getPermission());
  const [isSupported, setIsSupported] = React.useState(notificationManager.isSupported());

  React.useEffect(() => {
    const checkPermission = () => {
      setPermission(notificationManager.getPermission());
    };

    // Check permission on mount
    checkPermission();

    // Listen for permission changes
    if ('Notification' in window) {
      const handlePermissionChange = () => {
        checkPermission();
      };

      // Note: There's no direct event for permission changes, so we poll
      const interval = setInterval(checkPermission, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  return {
    permission,
    isSupported,
    requestPermission: () => notificationManager.requestPermission(),
    showNotification: (data: Omit<NotificationData, 'id'>) => showNotification(data),
    showToast: (toast: Omit<ToastNotification, 'id'>) => showToast(toast),
    showSuccessToast,
    showErrorToast,
    showInfoToast,
    showWarningToast,
    dismissToast: (id: string) => notificationManager.dismissToast(id),
    dismissAllToasts: () => notificationManager.dismissAllToasts(),
  };
}

export function useRealTime() {
  const [isConnected, setIsConnected] = React.useState(realTimeManager.isConnectedToRealTime());

  React.useEffect(() => {
    const handleConnectionChange = () => {
      setIsConnected(realTimeManager.isConnectedToRealTime());
    };

    // Check connection status periodically
    const interval = setInterval(handleConnectionChange, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    on: (event: string, listener: (data: any) => void) => realTimeManager.on(event, listener),
    off: (event: string, listener: (data: any) => void) => realTimeManager.off(event, listener),
    disconnect: () => realTimeManager.disconnect(),
  };
}
