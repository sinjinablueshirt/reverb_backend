---
timestamp: 'Sun Nov 02 2025 12:47:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_124749.f3dae070.md]]'
content_id: a1e762fc244143c3700ded02ce7673340a3981541d9e437aab04e64698606721
---

# file: src/syncs/comment.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Comment, Requesting, Sessioning } from "@concepts";

/**
 * Handles a request to remove a comment after authenticating the user.
 * Note: The API spec for removeComment takes a 'user', but a more secure
 * implementation uses a session token to identify the user.
 */
export const RemoveCommentRequest: Sync = ({ request, comment, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", comment, session },
    { request },
  ]),
  where: async (frames) => {
    // Authorize the request by getting the user from the session
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Comment.removeComment, { comment, user }]),
});

/**
 * Responds to the client after a comment is successfully removed.
 */
export const RemoveCommentResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/removeComment" }, { request }],
    [Comment.removeComment, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to the client with an error if removing the comment fails.
 */
export const RemoveCommentError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/removeComment" }, { request }],
    [Comment.removeComment, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
