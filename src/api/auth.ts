// src/api/auth.ts

import {mockDelay, mockTokens, USE_MOCK_DATA} from './mock';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// 타입 정의
interface JwtPayload {
  exp?: number;
  [key: string]: any;
}

interface AuthResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
  };
}

interface ApiError {
  message?: string;
  code?: string;
}

// 유틸리티 함수들
const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2 || typeof parts[1] !== 'string') {
      console.error("유효하지 않은 JWT 형식");
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // 더 안전한 디코딩 방법
    let jsonPayload: string;
    try {
      const decoded = atob(base64);
      jsonPayload = decodeURIComponent(
        decoded
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (decodeError) {
      // 디코딩 실패 시 더 간단한 방법 시도
      try {
        jsonPayload = atob(base64);
      } catch (simpleError) {
        console.error("JWT 페이로드 디코딩 실패:", simpleError);
        return null;
      }
    }

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("JWT 디코딩 실패:", error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  // 목업 모드에서는 토큰 만료 검사 건너뛰기
  if (USE_MOCK_DATA) {
    return false;
  }

  const payload = decodeJwt(token);
  if (!payload?.exp || typeof payload.exp !== 'number') {
    return true; // exp가 없으면 만료된 것으로 간주
  }
  return payload.exp < Date.now() / 1000;
};

const handleApiResponse = async (response: Response): Promise<AuthResponse> => {
  if (!response.ok) {
    let errorData: ApiError = {};
    try {
      errorData = await response.json();
    } catch {
      // JSON 파싱 실패 시 무시
    }
    throw new Error(errorData.message || `HTTP ${response.status} 오류`);
  }

  const data: AuthResponse = await response.json();

  if (!data.isSuccess || !data.result?.accessToken) {
    throw new Error('유효하지 않은 응답: 액세스 토큰이 없습니다.');
  }

  return data;
};

const makeApiRequest = async (endpoint: string, options: RequestInit = {}): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      credentials: 'include'
    });

    const data = await handleApiResponse(response);
    return data.result.accessToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('API 요청 실패:', errorMessage);
    throw error;
  }
};

// 공개 API 함수들
export const handleSocialLoginCallback = async (provider: string, code: string, state: string): Promise<string> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockTokens.accessToken;
  }
  return makeApiRequest(`/api/v1/oauth2/${provider}?code=${code}&state=${state}`);
};

export const fetchTestToken = async (): Promise<string> => {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return mockTokens.accessToken;
  }
  return makeApiRequest('/api/v1/oauth2/test-token');
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // 목업 모드에서는 기본 토큰 반환
  if (USE_MOCK_DATA) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // 목업 토큰이 없으면 기본 목업 토큰 설정
      setAccessToken(mockTokens.accessToken);
      return mockTokens.accessToken;
    }
    return token;
  }

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    if (isTokenExpired(token)) {
      console.warn('액세스 토큰이 만료되었습니다.');
      removeAccessToken();
      throw new Error('TOKEN_EXPIRED');
    }

    return token;
  } catch (error) {
    console.error('토큰 검증 중 오류:', error);
    removeAccessToken();
    return null;
  }
};

export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return;

  try {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  } catch (error) {
    console.error('토큰 저장 중 오류:', error);
  }
};
export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
};

// 현재 로그인한 사용자 ID 추출
export const getCurrentUserId = (): number | null => {
  const token = getAccessToken();
  if (!token) {
    console.warn('[getCurrentUserId] Access token not found');
    return null;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    console.warn('[getCurrentUserId] Failed to decode JWT payload');
    return null;
  }

  // JWT 페이로드에서 사용자 ID 추출
  // 실제 백엔드 JWT 페이로드 구조: { sub: 'veri', id: 4, email: '...', nickName: '...', ... }
  const userId = payload.id || payload.memberId || payload.userId || payload.member_id;

  if (typeof userId === 'number') {
    return userId;
  }

  if (typeof userId === 'string') {
    const parsed = parseInt(userId, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  // 디버깅: 어떤 필드들이 있는지 확인
  if (import.meta.env.DEV) {
    console.warn('[getCurrentUserId] User ID not found in payload. Available keys:', Object.keys(payload));
  }

  return null;
};

