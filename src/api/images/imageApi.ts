import { API_BASE_URL } from '../apiClient';
import { fetchWithAuth } from '../auth/authApi';

interface ImageUploadApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    presignedUrl: string;
    publicUrl: string;
  };
}

export interface GetImagesQueryParams {
  page?: number;
  size?: number;
}

export interface GetImagesResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    content: string[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

/** @deprecated 게시글 이미지는 `uploadPostImage`(`community/postApi`) 사용 */
export async function uploadImage(file: File): Promise<string> {
  const presignedRequestData = {
    contentType: file.type,
    contentLength: file.size,
  };

  const response = await fetchWithAuth(`${API_BASE_URL}/api/cards/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(presignedRequestData),
  });

  const data: ImageUploadApiResponse = await response.json();
  const { presignedUrl, publicUrl } = data.result;

  if (!presignedUrl || !publicUrl) {
    throw new Error('백엔드 응답에 presignedUrl 또는 publicUrl이 누락되었습니다.');
  }

  const uploadResponse = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`S3 직접 업로드 실패: ${uploadResponse.statusText}`);
  }

  return publicUrl;
}
