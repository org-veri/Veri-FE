import { fetchWithAuth } from './auth';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

// fetchWithAuth는 auth.ts에서 관리됩니다 (401 시 자동 토큰 재발급 지원)

export interface CardBookDetail {
  id: number;
  title: string;
  coverImageUrl: string;
  author: string;
}

export interface MyCardItem {
  cardId: number | undefined;
  content: string;
  image: string;
  created: string;
  isPublic: boolean;
}

export interface Card {
  cardId: number;
  content: string;
  imageUrl: string;
  createdAt: string,
  book: CardBookDetail | null;
  isPublic: boolean;
}

export interface GetMyCardsResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    cards: MyCardItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface GetCardDetailByIdResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    id: number;
    memberProfileResponse?: {
      id: number;
      nickname: string;
      profileImageUrl: string;
    };
    content: string;
    imageUrl: string;
    createdAt: string;
    isPublic: boolean;
    book: CardBookDetail | null;
  } | null;
}

export interface CreateCardRequest {
  memberBookId: number;
  content: string;
  imageUrl: string;
}

export interface CreateCardResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    cardId: number;
  };
}

export interface UpdateCardRequest {
  content: string;
  imageUrl: string;
}

export interface UpdateCardResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    id: number;
    content: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    book: CardBookDetail | null;
  };
}

export interface GetPresignedUrlRequest {
  contentType: string;
  contentLength: number;
}

export interface GetPresignedUrlResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    presignedUrl: string;
    publicUrl: string;
  };
}

export interface GetMyCardsQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface DeleteCardResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Record<string, never>;
}

export interface GetMyCardsCountResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: number;
}

export interface UpdateCardVisibilityResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    id: number;
    idPublic: boolean;
    memberProfileResponse?: {
      id: number;
      nickname: string;
      profileImageUrl: string;
    };
    content?: string;
    imageUrl?: string;
    createdAt?: string;
    book?: any;
    isPublic?: boolean;
  };
}

export async function getMyCards(params: GetMyCardsQueryParams = {}): Promise<GetMyCardsResponse> {
  const url = new URL(`${BASE_URL}/api/v1/cards/my`);
  if (params.page !== undefined) url.searchParams.append('page', String(params.page));
  if (params.size !== undefined) url.searchParams.append('size', String(params.size));
  if (params.sort) url.searchParams.append('sort', params.sort);

  try {
    const response = await fetchWithAuth(url.toString(), { method: 'GET' });
    const data: GetMyCardsResponse = await response.json();
    if (!data.isSuccess || !data.result || !Array.isArray(data.result.cards)) {
      throw new Error(`API call failed or data format is incorrect: ${data.message || 'Unknown error'}`);
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch my cards:', error);
    throw error;
  }
}

export async function getCardDetailById(cardId: number): Promise<GetCardDetailByIdResponse> {
  const url = `${BASE_URL}/api/v1/cards/${cardId}`;

  try {
    const response = await fetchWithAuth(url, { method: 'GET' });
    const data: GetCardDetailByIdResponse = await response.json();
    if (!data.isSuccess) {
      throw new Error(`API call failed: ${data.message || 'Unknown error'}`);
    }
    return data;
  } catch (error) {
    console.error(`Failed to fetch card detail for ID ${cardId}:`, error);
    throw error;
  }
}

export async function createCard(body: CreateCardRequest): Promise<CreateCardResponse> {
  const url = `${BASE_URL}/api/v1/cards`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data: CreateCardResponse = await response.json();
    if (!data.isSuccess) {
      throw new Error(data.message || '카드 생성에 실패했습니다.');
    }
    return data;
  } catch (error) {
    console.error('카드 생성 중 오류:', error);
    throw error;
  }
}

export async function getPresignedUrlForImageUpload(body: GetPresignedUrlRequest): Promise<GetPresignedUrlResponse> {
  const url = `${BASE_URL}/api/v1/cards/image`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data: GetPresignedUrlResponse = await response.json();
    if (!data.isSuccess) {
      throw new Error(data.message || 'Presigned URL 요청에 실패했습니다.');
    }
    return data;
  } catch (error) {
    console.error('Presigned URL 요청 중 오류:', error);
    throw error;
  }
}

export async function uploadImageAndGetUrl(file: File): Promise<string> {
  try {
    const presignedRequestData: GetPresignedUrlRequest = {
      contentType: file.type,
      contentLength: file.size,
    };

    const presignedResponse = await getPresignedUrlForImageUpload(presignedRequestData);
    const { presignedUrl, publicUrl } = presignedResponse.result;

    if (!presignedUrl || !publicUrl) {
      throw new Error("백엔드 응답에 presignedUrl 또는 publicUrl이 누락되었습니다.");
    }

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 직접 업로드 실패: ${uploadResponse.statusText || 'Unknown S3 error'}`);
    }

    console.log('이미지 S3 업로드 성공. Public URL:', publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error('이미지 업로드 과정에서 오류 발생:', error);
    throw new Error(`이미지 업로드 실패: ${error.message || "알 수 없는 오류"}`);
  }
}

export async function deleteCard(cardId: number): Promise<DeleteCardResponse> {
  const url = `${BASE_URL}/api/v1/cards/${cardId}`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      return { isSuccess: true, code: '204', message: '삭제 성공', result: {} };
    }

    const data: DeleteCardResponse = await response.json();
    if (!data.isSuccess) {
      throw new Error(data.message || '독서 카드 삭제에 실패했습니다.');
    }
    return data;
  } catch (error) {
    console.error('독서 카드 삭제 중 오류:', error);
    throw error;
  }
}

export async function getMyCardsCount(): Promise<GetMyCardsCountResponse> {
  const url = `${BASE_URL}/api/v1/cards/my/count`;
  try {
    const response = await fetchWithAuth(url, { method: 'GET' });
    const data: GetMyCardsCountResponse = await response.json();
    if (!data.isSuccess) {
      throw new Error(data.message || '내 독서카드 개수 조회에 실패했습니다.');
    }
    return data;
  } catch (error) {
    console.error('내 독서카드 개수 조회 중 오류:', error);
    throw error;
  }
}

export async function updateCard(cardId: number, body: UpdateCardRequest): Promise<UpdateCardResponse> {
  const url = `${BASE_URL}/api/v1/cards/${cardId}`;

  try {
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data: UpdateCardResponse = await response.json();
    if (!data.isSuccess) {
      throw new Error(data.message || '카드 수정에 실패했습니다.');
    }
    return data;
  } catch (error) {
    console.error('카드 수정 중 오류:', error);
    throw error;
  }
}

export async function updateCardVisibility(cardId: number, isPublic: boolean): Promise<UpdateCardVisibilityResponse> {
  const url = new URL(`${BASE_URL}/api/v1/cards/${cardId}/visibility`);
  url.searchParams.append('isPublic', String(isPublic));

  try {
    const response = await fetchWithAuth(url.toString(), {
      method: 'PATCH',
    });

    const data: UpdateCardVisibilityResponse = await response.json();
    if (!data.isSuccess) {
      const error: any = new Error(data.message || '카드 공개 여부 수정에 실패했습니다.');
      error.code = data.code;
      error.message = data.message;
      throw error;
    }
    return data;
  } catch (error) {
    console.error('카드 공개 여부 수정 중 오류:', error);
    throw error;
  }
}
