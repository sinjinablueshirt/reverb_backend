---
timestamp: 'Sun Nov 02 2025 17:39:04 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_173904.243c29a6.md]]'
content_id: a3d22412aa4fbc888d7a3b01163824e01c990ae4f1fe8ea1a26c750b45e623fc
---

# file: src/syncs/api.sync.ts

```typescript
import {
  Comment,
  FileUrl,
  MusicTagging,
  Requesting,
  Sessioning,
  UserAuthentication,
} from "@concepts";
import { actions, Sync } from "@engine";

// ##################################
// #       Comment Concept          #
// ##################################

/**
 * Handles an authenticated request to remove a comment.
 * It validates the session to get the user ID before proceeding.
 */
export const RemoveCommentRequest: Sync = (
  { request, comment, session, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", comment, session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Comment.removeComment, { comment, user }]),
});

/**
 * Responds with an error if the session provided for removing a comment is invalid.
 */
export const RemoveCommentAuthError: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { error });
  },
  then: actions([Requesting.respond, { request, error }]),
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

// ##################################
// # UserAuthentication Concept     #
// ##################################

// These actions use username/password for authentication, not sessions.

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
    [
      Requesting.request,
      { path: "/UserAuthentication/deleteUser" },
      { request },
    ],
    [UserAuthentication.deleteUser, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteUserResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/deleteUser" },
      { request },
    ],
    [UserAuthentication.deleteUser, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

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
  then: actions([UserAuthentication.changePassword, {
    username,
    oldPassword,
    newPassword,
  }]),
});

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

export const ChangePasswordResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/changePassword" },
      { request },
    ],
    [UserAuthentication.changePassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// ##################################
// #       FileUrl Concept          #
// ##################################

/**
 * Handles an authenticated request to get an upload URL for a file.
 * The file's owner is determined by the provided session.
 */
export const RequestUploadRequest: Sync = (
  { request, fileName, session, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", fileName, session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([FileUrl.requestUpload, { fileName, owner: user }]),
});

/**
 * Responds with an error if the session for requesting an upload URL is invalid.
 */
export const RequestUploadAuthError: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { error });
  },
  then: actions([Requesting.respond, { request, error }]),
});

export const RequestUploadResponse: Sync = (
  { request, uploadUrl, gcsObjectName },
) => ({
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

/**
 * Handles an authenticated request to confirm a file upload.
 * The file's owner is determined by the provided session.
 */
export const ConfirmUploadRequest: Sync = (
  { request, fileName, title, gcsObjectName, session, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", fileName, title, gcsObjectName, session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([FileUrl.confirmUpload, {
    fileName,
    title,
    gcsObjectName,
    owner: user,
  }]),
});

/**
 * Responds with an error if the session for confirming an upload is invalid.
 */
export const ConfirmUploadAuthError: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { error });
  },
  then: actions([Requesting.respond, { request, error }]),
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

/**
 * Handles an authenticated request to delete a file.
 * The user performing the action is identified by the session.
 */
export const DeleteFileRequest: Sync = ({ request, file, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", file, session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([FileUrl.deleteFile, { file, user }]),
});

/**
 * Responds with an error if the session for deleting a file is invalid.
 */
export const DeleteFileAuthError: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { error });
  },
  then: actions([Requesting.respond, { request, error }]),
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

// Assumed to be a public action as per the API spec.
export const GetViewUrlRequest: Sync = ({ request, gcsObjectName }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/getViewUrl", gcsObjectName },
    { request },
  ]),
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

// ##################################
// #    MusicTagging Concept        #
// ##################################

// These actions are treated as public since the concept's API spec
// does not include an owner/user for authentication checks.

export const AddTagRequest: Sync = ({ request, registry, tag }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", registry, tag },
    { request },
  ]),
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

export const RemoveTagRequest: Sync = ({ request, registry, tag }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", registry, tag },
    { request },
  ]),
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

export const DeleteRegistryRequest: Sync = ({ request, registry }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", registry },
    { request },
  ]),
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
```
