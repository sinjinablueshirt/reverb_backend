---
timestamp: 'Mon Nov 03 2025 21:27:46 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_212746.3c023712.md]]'
content_id: d5da0f27308cc555b5edd27ef0cd6349648b1b9b0b59110dcc4c1a00c915ca31
---

# file: src/syncs/auth.sync.ts

```typescript
/**
 * This file contains synchronizations for routes that have been excluded
 * from passthrough, typically because they require authorization or other
 * complex orchestration before executing a concept action.
 *
 * Each excluded route is generally implemented with a pair of syncs:
 * 1. A "Request" sync that triggers on `Requesting.request`, performs
 *    authorization (e.g., checking a session), and then calls the
 *    target concept action.
 * 2. A "Response" sync that triggers on the completion of the target
 *    concept action and the original request, and then sends a response
 *    back to the client via `Requesting.respond`. This includes handling
 *    both success and error cases.
 */

import { actions, Sync } from "@engine";
import {
  Comment,
  FileUrl,
  MusicTagging,
  Requesting,
  Sessioning, // Assuming Sessioning concept exists and is exported
  UserAuthentication,
} from "@concepts";

// #region Comment Syncs
export const RemoveCommentRequest: Sync = ({ request, comment, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", comment, session },
    { request },
  ]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([Comment.removeComment, { comment, user }]),
});

export const RemoveCommentResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/removeComment" }, { request }],
    [Comment.removeComment, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveCommentResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/removeComment" }, { request }],
    [Comment.removeComment, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
// #endregion

// #region UserAuthentication Syncs
export const DeleteUserRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/deleteUser", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.deleteUser, { username, password }]),
});

export const DeleteUserResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/deleteUser" }, { request }],
    [UserAuthentication.deleteUser, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteUserResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/deleteUser" }, { request }],
    [UserAuthentication.deleteUser, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const ChangePasswordRequest: Sync = ({ request, username, oldPassword, newPassword }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/changePassword", username, oldPassword, newPassword },
    { request },
  ]),
  then: actions([UserAuthentication.changePassword, { username, oldPassword, newPassword }]),
});

export const ChangePasswordResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, { request }],
    [UserAuthentication.changePassword, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ChangePasswordResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, { request }],
    [UserAuthentication.changePassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
// #endregion

// #region FileUrl Syncs
export const RequestUploadRequest: Sync = ({ request, fileName, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", fileName, session },
    { request },
  ]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([FileUrl.requestUpload, { fileName, owner: user }]),
});

export const RequestUploadResponse: Sync = ({ request, uploadUrl, gcsObjectName }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/requestUpload" }, { request }],
    [FileUrl.requestUpload, {}, { uploadUrl, gcsObjectName }],
  ),
  then: actions([Requesting.respond, { request, uploadUrl, gcsObjectName }]),
});

export const RequestUploadResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/requestUpload" }, { request }],
    [FileUrl.requestUpload, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const ConfirmUploadRequest: Sync = ({ request, fileName, title, gcsObjectName, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", fileName, title, gcsObjectName, session },
    { request },
  ]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([FileUrl.confirmUpload, { fileName, title, gcsObjectName, owner: user }]),
});

export const ConfirmUploadResponse: Sync = ({ request, file }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/confirmUpload" }, { request }],
    [FileUrl.confirmUpload, {}, { file }],
  ),
  then: actions([Requesting.respond, { request, file }]),
});

export const ConfirmUploadResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/confirmUpload" }, { request }],
    [FileUrl.confirmUpload, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DeleteFileRequest: Sync = ({ request, file, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", file, session },
    { request },
  ]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([FileUrl.deleteFile, { file, user }]),
});

export const DeleteFileResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/deleteFile" }, { request }],
    [FileUrl.deleteFile, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteFileResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/deleteFile" }, { request }],
    [FileUrl.deleteFile, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const GetViewUrlRequest: Sync = ({ request, gcsObjectName, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/getViewUrl", gcsObjectName, session },
    { request },
  ]),
  // Authorize by ensuring a user is logged in, even if the user ID is not used in the next step.
  where: (frames) => frames.query(Sessioning._getUser, { session }, {}),
  then: actions([FileUrl.getViewUrl, { gcsObjectName }]),
});

export const GetViewUrlResponse: Sync = ({ request, viewUrl }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/getViewUrl" }, { request }],
    [FileUrl.getViewUrl, {}, { viewUrl }],
  ),
  then: actions([Requesting.respond, { request, viewUrl }]),
});

export const GetViewUrlResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/getViewUrl" }, { request }],
    [FileUrl.getViewUrl, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
// #endregion

// #region MusicTagging Syncs
export const AddTagRequest: Sync = ({ request, registry, tag, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", registry, tag, session },
    { request },
  ]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, {}),
  then: actions([MusicTagging.addTag, { registry, tag }]),
});

export const AddTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const AddTagResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const RemoveTagRequest: Sync = ({ request, registry, tag, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", registry, tag, session },
    { request },
  ]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, {}),
  then: actions([MusicTagging.removeTag, { registry, tag }]),
});

export const RemoveTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveTagResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DeleteRegistryRequest: Sync = ({ request, registry, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", registry, session },
    { request },
  ]),
  where: (frames) => frames.query(Sessioning._getUser, { session }, {}),
  then: actions([MusicTagging.deleteRegistry, { registry }]),
});

export const DeleteRegistryResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, { request }],
    [MusicTagging.deleteRegistry, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteRegistryResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, { request }],
    [MusicTagging.deleteRegistry, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
// #endregion
```
