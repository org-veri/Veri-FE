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
      } catch {
        return null;
      }
    }

    return JSON.parse(jsonPayload);
  } catch {
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
  const responseClone = response.clone();
  let errorData: ApiError = {};

  if (!response.ok) {
    try {
      errorData = await responseClone.json();
    } catch {}

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

export const handleSocialLoginCallback = async (provider: string, code: string, state: string): Promise<{ accessToken: string }> => {
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
    };
  } catch (error) {
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
      removeAccessToken();
      return null;
    }

    return token;
  } catch {
    removeAccessToken();
    return null;
  }
};

export const getAccessTokenAsync = async (autoReissue: boolean = true): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    let token = localStorage.getItem('accessToken');
    if (!token && autoReissue) {
      try {
        token = await reissueToken();
        return token;
      } catch (reissueError) {
        return null;
      }
    }
    if (!token) return null;

    if (isTokenExpired(token)) {
      if (autoReissue) {
        try {
          const newToken = await reissueToken();
          return newToken;
        } catch (reissueError) {
          removeAccessToken();
          return null;
        }
      } else {
        removeAccessToken();
        return null;
      }
    }

    return token;
  } catch {
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
  } catch {}
};

export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
};

export const reissueToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/reissue`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await handleReissueResponse(response);
    const newAccessToken = data.result.accessToken;

    if (!newAccessToken) {
      throw new Error('액세스 토큰이 응답에 포함되지 않았습니다.');
    }

    setAccessToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    removeAccessToken();
    throw error;
  }
};

export const getCurrentUserId = (): number | null => {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  const payload = decodeJwt(token);
  if (!payload) {
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

  return null;
};

let reissuePromise: Promise<string> | null = null;

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let accessToken = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (!accessToken) {
    if (!reissuePromise) {
      reissuePromise = reissueToken().finally(() => {
        reissuePromise = null;
      });
    }

    try {
      accessToken = await reissuePromise;
    } catch {
      removeAccessToken();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers: headers as HeadersInit,
  });

  if (response.status === 401) {
    if (!reissuePromise) {
      reissuePromise = reissueToken().finally(() => {
        reissuePromise = null;
      });
    }

    try {
      accessToken = await reissuePromise;
      headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(url, {
        ...options,
        headers: headers as HeadersInit,
      });

      if (!response.ok && response.status === 401) {
        removeAccessToken();
      }
    } catch {
      removeAccessToken();
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
