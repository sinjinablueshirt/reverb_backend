---
timestamp: 'Sun Nov 02 2025 13:05:50 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_130550.ea443835.md]]'
content_id: 9b935e87c09e7735ef6e4de4eaf22e45029c82ae2cfb3c5be04aec5a1d5961ed
---

# file: src/syncs/userAuthentication.sync.ts

```typescript
import { Requesting, UserAuthentication } from "@concepts";
import { actions, Sync } from "@engine";

/**
 * Handles the request to delete a user.
 * This sync listens for a specific request path, then calls the corresponding
 * UserAuthentication action with the provided credentials.
 */
export const DeleteUserRequest: Sync = (
  { request, username, password },
) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/deleteUser", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.deleteUser, { username, password }]),
});

/**
 * Responds to a successful user deletion.
 */
export const DeleteUserResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/deleteUser" }, {
      request,
    }],
    [UserAuthentication.deleteUser, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to a failed user deletion.
 */
export const DeleteUserResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/deleteUser" }, {
      request,
    }],
    [UserAuthentication.deleteUser, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the request to change a user's password.
 */
export const ChangePasswordRequest: Sync = (
  { request, username, oldPassword, newPassword },
) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/changePassword", username, oldPassword, newPassword },
    { request },
  ]),
  then: actions(
    [UserAuthentication.changePassword, { username, oldPassword, newPassword }],
  ),
});

/**
 * Responds to a successful password change.
 */
export const ChangePasswordResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, {
      request,
    }],
    [UserAuthentication.changePassword, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to a failed password change.
 */
export const ChangePasswordResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, {
      request,
    }],
    [UserAuthentication.changePassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
