---
timestamp: 'Sun Nov 02 2025 13:33:21 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_133321.d6af5576.md]]'
content_id: 5c969b60057ec58ebf60119db0c56800661f6f24b5c71307f9067f7441c868ce
---

# file: src/syncs/request\_handling.sync.ts

```typescript
/**
 * This file contains the synchronizations for handling API routes that are
 * explicitly excluded from the default passthrough behavior. For each
 * excluded route, there is a request/response pair of syncs:
 *
 * 1.  **Request Sync**: Catches a `Requesting.request` action for a specific
 *     path and triggers the corresponding concept action.
 *
 * 2.  **Response Sync**: Catches the successful completion of the concept
 *     action that was triggered by a request and uses `Requesting.respond`
 *     to send the result back to the original requester.
 *
 * This pattern reifies HTTP requests as first-class citizens, allowing for
 * more complex logic, such as authorization checks in the `where` clause,
 * before a concept action is executed.
 */

import {
  Comment,
  FileUrl,
  MusicTagging,
  Requesting,
  UserAuthentication,
} from "@concepts";
import { actions, Sync } from "@engine";

// =============================================================================
// Comment Concept Syncs
// =============================================================================

/**
 * Handles a request to remove a comment.
 */
export const RemoveCommentRequest: Sync = ({ request, comment, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", comment, user },
    { request },
  ]),
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

// =============================================================================
// UserAuthentication Concept Syncs
// =============================================================================

/**
 * Handles a request to delete a user.
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
 * Responds to a successful user deletion.
 */
export const DeleteUserResponse: Sync = ({ request }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/deleteUser" },
      { request },
    ],
    [UserAuthentication.deleteUser, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Handles a request to change a user's password.
 */
export const ChangePasswordRequest: Sync = (
  { request, username, oldPassword, newPassword },
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/UserAuthentication/changePassword",
      username,
      oldPassword,
      newPassword,
    },
    { request },
  ]),
  then: actions([
    UserAuthentication.changePassword,
    { username, oldPassword, newPassword },
  ]),
});

/**
 * Responds to a successful password change.
 */
export const ChangePasswordResponse: Sync = ({ request }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/changePassword" },
      { request },
    ],
    [UserAuthentication.changePassword, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

// =============================================================================
// FileUrl Concept Syncs
// =============================================================================

/**
 * Handles a request to get a pre-signed URL for uploading a file.
 */
export const RequestUploadRequest: Sync = ({ request, fileName, owner }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", fileName, owner },
    { request },
  ]),
  then: actions([FileUrl.requestUpload, { fileName, owner }]),
});

/**
 * Responds to a successful upload URL request.
 */
export const RequestUploadResponse: Sync = (
  { request, uploadUrl, gcsObjectName },
) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/requestUpload" }, { request }],
    [FileUrl.requestUpload, {}, { uploadUrl, gcsObjectName }],
  ),
  then: actions([Requesting.respond, { request, uploadUrl, gcsObjectName }]),
});

/**
 * Handles a request to confirm a file upload.
 */
export const ConfirmUploadRequest: Sync = (
  { request, fileName, title, gcsObjectName, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", fileName, title, gcsObjectName, owner },
    { request },
  ]),
  then: actions([
    FileUrl.confirmUpload,
    { fileName, title, gcsObjectName, owner },
  ]),
});

/**
 * Responds to a successful upload confirmation.
 */
export const ConfirmUploadResponse: Sync = ({ request, file }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/confirmUpload" }, { request }],
    [FileUrl.confirmUpload, {}, { file }],
  ),
  then: actions([Requesting.respond, { request, file }]),
});

/**
 * Handles a request to delete a file.
 */
export const DeleteFileRequest: Sync = ({ request, file, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", file, user },
    { request },
  ]),
  then: actions([FileUrl.deleteFile, { file, user }]),
});

/**
 * Responds to a successful file deletion.
 */
export const DeleteFileResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/deleteFile" }, { request }],
    [FileUrl.deleteFile, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Handles a request for a pre-signed URL to view a file.
 */
export const GetViewUrlRequest: Sync = ({ request, gcsObjectName }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/getViewUrl", gcsObjectName },
    { request },
  ]),
  then: actions([FileUrl.getViewUrl, { gcsObjectName }]),
});

/**
 * Responds to a successful view URL request.
 */
export const GetViewUrlResponse: Sync = ({ request, viewUrl }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/getViewUrl" }, { request }],
    [FileUrl.getViewUrl, {}, { viewUrl }],
  ),
  then: actions([Requesting.respond, { request, viewUrl }]),
});

// =============================================================================
// MusicTagging Concept Syncs
// =============================================================================

/**
 * Handles a request to add a tag to a music registry.
 */
export const AddTagRequest: Sync = ({ request, registry, tag }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", registry, tag },
    { request },
  ]),
  then: actions([MusicTagging.addTag, { registry, tag }]),
});

/**
 * Responds to a successful tag addition.
 */
export const AddTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Handles a request to remove a tag from a music registry.
 */
export const RemoveTagRequest: Sync = ({ request, registry, tag }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", registry, tag },
    { request },
  ]),
  then: actions([MusicTagging.removeTag, { registry, tag }]),
});

/**
 * Responds to a successful tag removal.
 */
export const RemoveTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Handles a request to delete a music registry.
 */
export const DeleteRegistryRequest: Sync = ({ request, registry }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", registry },
    { request },
  ]),
  then: actions([MusicTagging.deleteRegistry, { registry }]),
});

/**
 * Responds to a successful registry deletion.
 */
export const DeleteRegistryResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, { request }],
    [MusicTagging.deleteRegistry, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});
```
