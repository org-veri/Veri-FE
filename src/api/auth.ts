const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

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

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2 || typeof parts[1] !== 'string') {
      console.error("유효하지 않은 JWT 형식");
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

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
  const payload = decodeJwt(token);
  if (!payload?.exp || typeof payload.exp !== 'number') {
    return true;
  }
  return payload.exp < Date.now() / 1000;
};

const handleApiResponse = async (response: Response): Promise<AuthResponse> => {
  if (!response.ok) {
    const responseClone = response.clone();
    let errorData: ApiError = {};
    try {
      errorData = await responseClone.json();
    } catch {
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

interface ReissueResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    accessToken: string;
  };
}

const handleReissueResponse = async (response: Response): Promise<ReissueResponse> => {
  if (!response.ok) {
    const responseClone = response.clone();
    let errorData: ApiError = {};
    try {
      errorData = await responseClone.json();
    } catch {
    }
    throw new Error(errorData.message || `HTTP ${response.status} 오류`);
  }

  const data: ReissueResponse = await response.json();

  if (!data.isSuccess || !data.result?.accessToken) {
    throw new Error('유효하지 않은 응답: 액세스 토큰이 없습니다.');
  }

  return data;
};

export const handleSocialLoginCallback = async (provider: string, code: string, state: string): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/oauth2/${provider}?code=${code}&state=${state}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await handleApiResponse(response);
    return {
      accessToken: data.result.accessToken,
      refreshToken: data.result.refreshToken
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('소셜 로그인 콜백 처리 실패:', errorMessage);
    throw error;
  }
};

export const fetchTestToken = async (): Promise<string> => {
  return makeApiRequest('/api/v1/oauth2/test-token');
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    if (isTokenExpired(token)) {
      console.warn('액세스 토큰이 만료되었습니다.');
      removeAccessToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('토큰 검증 중 오류:', error);
    removeAccessToken();
    return null;
  }
};

export const getAccessTokenAsync = async (autoReissue: boolean = true): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    if (isTokenExpired(token)) {
      console.warn('액세스 토큰이 만료되었습니다.');
      
      if (autoReissue && getRefreshToken()) {
        try {
          console.log('토큰을 자동으로 재발급합니다.');
          const newToken = await reissueToken();
          return newToken;
        } catch (reissueError) {
          console.error('토큰 자동 재발급 실패:', reissueError);
          removeAccessToken();
          removeRefreshToken();
          return null;
        }
      } else {
        removeAccessToken();
        return null;
      }
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

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return;

  try {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  } catch (error) {
    console.error('리프레시 토큰 저장 중 오류:', error);
  }
};

export const removeRefreshToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('refreshToken');
};

export const reissueToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/reissue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        refreshToken: refreshToken
      })
    });

    const data = await handleReissueResponse(response);
    const newAccessToken = data.result.accessToken;
    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('토큰 재발급 실패:', errorMessage);
    removeAccessToken();
    removeRefreshToken();
    throw error;
  }
};

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

  if (import.meta.env.DEV) {
    console.warn('[getCurrentUserId] User ID not found in payload. Available keys:', Object.keys(payload));
  }

  return null;
};
