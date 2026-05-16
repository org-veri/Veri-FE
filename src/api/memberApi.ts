import { fetchWithAuth } from './auth';

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

export interface DefaultApiResponse<T> {
    isSuccess: boolean;
    code: string;
    message: string;
    result: T;
}

export interface MemberProfile {
    id?: number;
    email: string;
    nickname: string;
    image: string;
    numOfReadBook: number;
    numOfCard: number;
    followerCount?: number;
    followingCount?: number;
}

export interface GetMemberProfileResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: MemberProfile | null;
}

export interface UpdateMemberInfoRequest {
    nickname?: string | null;
    profileImageUrl?: string | null;
}

export interface UpdateMemberInfoResponse {
    id: number;
    nickname: string;
    image: string;
}

export interface GetMemberInfoUpdateResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: UpdateMemberInfoResponse;
}

export interface CheckNicknameExistsResponse {
    isSuccess: boolean;
    code: string;
    message: string;
    result: { exists: boolean };
}

export async function getMemberProfile(): Promise<GetMemberProfileResponse> {
    const url = `${BASE_URL}/api/members/me`;

    try {
        const response = await fetchWithAuth(url, {
            method: 'GET',
        });

        const data: GetMemberProfileResponse = await response.json();

        if (!data.isSuccess) {
            throw new Error(`프로필 로드 실패: ${data.message || '알 수 없는 오류'}`);
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export async function updateMemberInfo(
    updateData: UpdateMemberInfoRequest
): Promise<GetMemberInfoUpdateResponse> {
    const url = `${BASE_URL}/api/members/me/info`;

    try {
        const response = await fetchWithAuth(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        const data: GetMemberInfoUpdateResponse = await response.json();

        if (!data.isSuccess) {
            throw new Error(`내 정보 수정 실패: ${data.message || '알 수 없는 오류'}`);
        }

        return data;
    } catch (error) {
        throw error;
    }
}

export async function checkNicknameExists(
    nickname: string
): Promise<CheckNicknameExistsResponse> {
    const url = new URL(`${BASE_URL}/api/members/nickname/exists`);
    url.searchParams.append('nickname', nickname);

    try {
        const response = await fetchWithAuth(url.toString(), {
            method: 'GET',
        });

        const data: CheckNicknameExistsResponse = await response.json();

        if (!data.isSuccess) {
            throw new Error(`닉네임 중복 확인 실패: ${data.message || '알 수 없는 오류'}`);
        }

        return data;
    } catch (error) {
        throw error;
    }
}
