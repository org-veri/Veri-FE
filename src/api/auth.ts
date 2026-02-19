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

export interface ReissueRequest {
  refreshToken: string;
}

interface ReissueResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    accessToken: string;
  };
}

const handleReissueResponse = async (response: Response): Promise<ReissueResponse> => {
  const responseClone = response.clone();
  let errorData: ApiError = {};

  if (!response.ok) {
    try {
      errorData = await responseClone.json();
    } catch {
      // JSON 파싱 실패 시 빈 객체 유지
    }

    // 상태 코드별 에러 메시지 처리
    const statusMessages: Record<number, string> = {
      400: errorData.message || '잘못된 요청입니다. 리프레시 토큰을 확인해주세요.',
      409: errorData.message || '토큰 재발급 중 충돌이 발생했습니다.',
      500: errorData.message || '서버 오류가 발생했습니다.',
    };

    const errorMessage = statusMessages[response.status] || errorData.message || `HTTP ${response.status} 오류`;
    throw new Error(errorMessage);
  }

  const data: ReissueResponse = await response.json();

  if (!data.isSuccess || !data.result?.accessToken) {
    throw new Error(data.message || '유효하지 않은 응답: 액세스 토큰이 없습니다.');
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

/**
 * 리프레시 토큰을 이용하여 액세스 토큰을 재발급합니다.
 * 
 * @returns {Promise<string>} 새로 발급된 액세스 토큰
 * @throws {Error} 리프레시 토큰이 없거나 재발급에 실패한 경우
 * 
 * @example
 * try {
 *   const newToken = await reissueToken();
 *   console.log('토큰 재발급 성공');
 * } catch (error) {
 *   console.error('토큰 재발급 실패:', error.message);
 * }
 */
export const reissueToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const requestBody: ReissueRequest = {
      refreshToken: refreshToken
    };

    const response = await fetch(`${BASE_URL}/api/v1/auth/reissue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });

    const data = await handleReissueResponse(response);
    const newAccessToken = data.result.accessToken;
    
    if (!newAccessToken) {
      throw new Error('액세스 토큰이 응답에 포함되지 않았습니다.');
    }

    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('토큰 재발급 실패:', errorMessage);
    
    // 재발급 실패 시 토큰 제거
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

// 토큰 재발급 중복 요청 방지용 Promise
let reissuePromise: Promise<string> | null = null;

/**
 * 인증이 필요한 API 요청을 수행합니다.
 * 401 에러 발생 시 자동으로 토큰을 재발급하고 요청을 재시도합니다.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let accessToken = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (!accessToken && getRefreshToken()) {
    console.log('[fetchWithAuth] Access token 없음. 토큰 재발급을 시도합니다.');

    if (!reissuePromise) {
      reissuePromise = reissueToken().finally(() => {
        reissuePromise = null;
      });
    }

    try {
      accessToken = await reissuePromise;
      console.log('[fetchWithAuth] 토큰 재발급 성공.');
    } catch (reissueError) {
      console.error('[fetchWithAuth] 토큰 재발급 실패:', reissueError);
      removeAccessToken();
      removeRefreshToken();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    console.warn(`[fetchWithAuth] Access token is missing for URL: ${url}`);
  }

  let response = await fetch(url, {
    ...options,
    headers: headers as HeadersInit,
  });

  // 401 에러 발생 시 토큰 재발급 후 재요청
  if (response.status === 401) {
    console.warn('[fetchWithAuth] 401 Unauthorized. 토큰 재발급을 시도합니다.');

    // 재발급이 이미 진행 중이면 해당 Promise를 재사용 (중복 요청 방지)
    if (!reissuePromise) {
      reissuePromise = reissueToken().finally(() => {
        reissuePromise = null;
      });
    }

    try {
      accessToken = await reissuePromise;
      console.log('[fetchWithAuth] 토큰 재발급 성공. 요청을 재시도합니다.');
      headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(url, {
        ...options,
        headers: headers as HeadersInit,
      });

      if (!response.ok && response.status === 401) {
        console.error('[fetchWithAuth] 토큰 재발급 후에도 401 응답. 리프레시 토큰이 만료되었습니다.');
        removeAccessToken();
        removeRefreshToken();
      }
    } catch (reissueError) {
      console.error('[fetchWithAuth] 토큰 재발급 실패:', reissueError);
      removeAccessToken();
      removeRefreshToken();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
  }

  if (!response.ok) {
    const responseClone = response.clone();
    let errorMessage = '';

    try {
      const errorData = await responseClone.json();
      if (errorData.message && errorData.message.trim()) {
        errorMessage = errorData.message;
      } else if (errorData.code) {
        errorMessage = `오류 코드: ${errorData.code}`;
      }
    } catch {
      try {
        const text = await responseClone.text();
        if (text && text.trim()) {
          errorMessage = text.trim();
        }
      } catch {
        // 무시
      }
    }

    if (!errorMessage) {
      const statusMessages: Record<number, string> = {
        400: '잘못된 요청입니다.',
        401: '인증이 필요합니다.',
        403: '접근 권한이 없습니다.',
        404: '요청한 리소스를 찾을 수 없습니다.',
        500: '서버 오류가 발생했습니다.',
        502: '서버에 연결할 수 없습니다.',
        503: '서비스를 사용할 수 없습니다.',
      };
      errorMessage = statusMessages[response.status] || `서버 오류가 발생했습니다 (${response.status})`;
    }

    throw new Error(errorMessage);
  }

  return response;
};
