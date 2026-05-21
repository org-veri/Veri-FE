import type { NavigateFunction } from 'react-router-dom';
import { PATH } from '../config/routes';
import { getCurrentUserId } from '../api/auth/authApi';

export function navigateToMemberProfile(
  navigate: NavigateFunction,
  memberId: number | undefined | null
): void {
  if (memberId == null) return;

  const myId = getCurrentUserId();
  if (myId !== null && myId === memberId) {
    navigate(PATH.MY_PAGE);
    return;
  }

  navigate(`${PATH.MEMBER_PROFILE}/${memberId}`);
}
