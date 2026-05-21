/**
 * 알림 API — Swagger「알림」
 */
import { makeApiRequest, type BaseApiResponse } from '../apiClient';

export interface NotificationItem {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export interface NotificationInboxResult {
  notifications: NotificationItem[];
  [key: string]: unknown;
}

export type GetNotificationInboxResponse = BaseApiResponse<NotificationInboxResult>;
export type MarkAllNotificationsReadResponse = BaseApiResponse<Record<string, never>>;
export type GetUnreadNotificationCountResponse = BaseApiResponse<{ count: number }>;

/** GET /api/notifications/inbox */
export const getNotificationInbox = async (): Promise<GetNotificationInboxResponse> => {
  return makeApiRequest<GetNotificationInboxResponse>('/api/notifications/inbox');
};

/** PATCH /api/notifications/read-all */
export const markAllNotificationsRead = async (): Promise<MarkAllNotificationsReadResponse> => {
  return makeApiRequest<MarkAllNotificationsReadResponse>('/api/notifications/read-all', {
    method: 'PATCH',
  });
};

/** GET /api/notifications/unread-count */
export const getUnreadNotificationCount = async (): Promise<GetUnreadNotificationCountResponse> => {
  return makeApiRequest<GetUnreadNotificationCountResponse>('/api/notifications/unread-count');
};
