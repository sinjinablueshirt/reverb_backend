---
timestamp: 'Sun Nov 02 2025 12:47:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_124749.f3dae070.md]]'
content_id: 3e9a1c7e751fabf0e8a79ec72629276d8ce84256783b41bd1cef0cf37b83dcde
---

# file: src/syncs/userAuthentication.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, UserAuthentication } from "@concepts";

/**
 * Handles the request to delete a user.
 * This is a direct passthrough as the concept action itself contains authentication (username/password).
 */
export const DeleteUserRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/deleteUser", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.deleteUser, { username, password }]),
});

/**
 * Responds to the client after a successful user deletion.
 */
export const DeleteUserResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/deleteUser" }, { request }],
    [UserAuthentication.deleteUser, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to the client with an error if user deletion fails.
 */
export const DeleteUserError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/deleteUser" }, { request }],
    [UserAuthentication.deleteUser, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the request to change a user's password.
 * This is a direct passthrough as the concept action itself contains authentication.
 */
export const ChangePasswordRequest: Sync = ({ request, username, oldPassword, newPassword }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/changePassword", username, oldPassword, newPassword },
    { request },
  ]),
  then: actions([UserAuthentication.changePassword, { username, oldPassword, newPassword }]),
});

/**
 * Responds to the client after a successful password change.
 */
export const ChangePasswordResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, { request }],
    [UserAuthentication.changePassword, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to the client with an error if password change fails.
 */
export const ChangePasswordError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, { request }],
    [UserAuthentication.changePassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
