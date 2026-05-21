import { API_BASE_URL } from '../apiClient';
import { fetchWithAuth } from '../auth/authApi';

export interface OCRResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: { resultText: string } | null;
}

export const extractTextFromImage = async (imageUrl: string): Promise<string> => {
  const url = new URL(`${API_BASE_URL}/api/images/ocr`);
  url.searchParams.append('imageUrl', imageUrl);

  const response = await fetchWithAuth(url.toString(), {
    method: 'POST',
  });

  const data: OCRResponse = await response.json();

  if (!data.isSuccess || !data.result) {
    throw new Error(data.message || '텍스트 추출에 실패했습니다.');
  }

  return data.result.resultText;
};
