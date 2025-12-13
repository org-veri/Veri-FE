import { authHandlers } from './authHandlers';
import { bookHandlers } from './bookHandlers';
import { cardHandlers } from './cardHandlers';
import { communityHandlers } from './communityHandlers';
import { communityCommentsHandlers } from './communityCommentsHandlers';
import { imageHandlers } from './imageHandlers';
import { memberHandlers } from './memberHandlers';
import { bookmarkHandlers } from './bookmarkHandlers';

export const handlers = [
  ...authHandlers,
  ...bookHandlers,
  ...cardHandlers,
  ...communityHandlers,
  ...communityCommentsHandlers,
  ...imageHandlers,
  ...memberHandlers,
  ...bookmarkHandlers,
];
