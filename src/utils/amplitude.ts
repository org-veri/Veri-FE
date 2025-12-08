// Amplitude Analytics 유틸리티 함수

// Amplitude 타입 정의
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

/**
 * Amplitude 이벤트 추적 함수
 * @param eventName 이벤트 이름 (예: 'Sign Up', 'Book View', 'Card Created')
 * @param eventProperties 이벤트 속성 (선택사항)
 * 
 * @example
 * trackEvent('Sign Up', { method: 'kakao' });
 * trackEvent('Book View', { bookId: '123', bookTitle: 'Example Book' });
 */
export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.amplitude) {
    window.amplitude.track(eventName, eventProperties);
  } else {
    console.warn('Amplitude is not initialized');
  }
};

/**
 * 사용자 ID 설정
 * @param userId 사용자 ID
 */
export const setAmplitudeUserId = (userId: string | null) => {
  if (typeof window !== 'undefined' && window.amplitude) {
    window.amplitude.setUserId(userId);
  }
};

/**
 * 사용자 속성 설정
 * @param userProperties 사용자 속성 객체
 */
export const setAmplitudeUserProperties = (userProperties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.amplitude) {
    window.amplitude.setUserProperties(userProperties);
  }
};

export {};

