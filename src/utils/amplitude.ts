declare global {
  interface Window {
    amplitude: {
      init: (apiKey: string, options?: any) => void;
      track: (eventName: string, eventProperties?: Record<string, any>) => void;
      setUserId: (userId: string | null) => void;
      setUserProperties: (userProperties: Record<string, any>) => void;
      add: (plugin: any) => void;
    };
    sessionReplay: {
      plugin: (options: { sampleRate: number }) => any;
    };
  }
}

export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.amplitude) {
    window.amplitude.track(eventName, eventProperties);
  } else {
    console.warn('Amplitude is not initialized');
  }
};

export const setAmplitudeUserId = (userId: string | null) => {
  if (typeof window !== 'undefined' && window.amplitude) {
    window.amplitude.setUserId(userId);
  }
};

export const setAmplitudeUserProperties = (userProperties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.amplitude) {
    window.amplitude.setUserProperties(userProperties);
  }
};

export {};

