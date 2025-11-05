---
timestamp: 'Sun Nov 02 2025 13:05:50 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_130550.ea443835.md]]'
content_id: 3e3497d58292d1d78b19d54810b7aa8dac790d2c1bbbca57ce4dd516b1229e62
---

# file: src/syncs/comment.sync.ts

```typescript
import { Comment, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

/**
 * Handles the request to remove a comment.
 * It requires a valid session to identify the user making the request,
 * ensuring that only the original commenter can remove their comment.
 */
export const RemoveCommentRequest: Sync = ({ request, comment, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", comment, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Comment.removeComment, { comment, user }]),
});

/**
 * Responds to a successful comment removal.
 */
export const RemoveCommentResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/removeComment" }, { request }],
    [Comment.removeComment, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to a failed comment removal.
 */
export const RemoveCommentResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/removeComment" }, { request }],
    [Comment.removeComment, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
