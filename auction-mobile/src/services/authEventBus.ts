/**
 * Authentication Event Bus
 * 
 * Simple event system to handle authentication events without circular dependencies
 */

type AuthEventType = 'AUTH_FAILURE' | 'AUTH_SUCCESS' | 'TOKEN_EXPIRED';

interface AuthEventListener {
  event: AuthEventType;
  callback: () => void;
}

class AuthEventBus {
  private listeners: AuthEventListener[] = [];

  /**
   * Subscribe to authentication events
   */
  subscribe(event: AuthEventType, callback: () => void): () => void {
    const listener: AuthEventListener = { event, callback };
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit an authentication event
   */
  emit(event: AuthEventType): void {
    console.log(`🚨 AuthEventBus: Emitting ${event} event`);
    
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => {
        try {
          listener.callback();
        } catch (error) {
          console.error(`❌ AuthEventBus: Error in ${event} listener:`, error);
        }
      });
  }

  /**
   * Clear all listeners (for cleanup)
   */
  clear(): void {
    this.listeners = [];
  }

  /**
   * Get debug information
   */
  getDebugInfo(): { totalListeners: number; eventCounts: Record<AuthEventType, number> } {
    const eventCounts = this.listeners.reduce((acc, listener) => {
      acc[listener.event] = (acc[listener.event] || 0) + 1;
      return acc;
    }, {} as Record<AuthEventType, number>);

    return {
      totalListeners: this.listeners.length,
      eventCounts,
    };
  }
}

// Export singleton instance
export const authEventBus = new AuthEventBus();
export default authEventBus;