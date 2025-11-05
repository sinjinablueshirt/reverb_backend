---
timestamp: 'Sun Nov 02 2025 17:43:21 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_174321.6fef3c75.md]]'
content_id: 8616cc13965890c4d6dff529d22d75df5e697927f114aa826060ec4bcd44befc
---

# file: src/syncs/api.sync.ts

```typescript
import {
  Comment,
  FileUrl,
  MusicTagging,
  Requesting,
  UserAuthentication,
} from "@concepts";
import { actions, Frames, Sync } from "@engine";

// ##################################
// #       Comment Concept          #
// ##################################

/**
 * Handles a request to remove a comment.
 * Authorization: The `where` clause ensures the action only proceeds if the requesting `user`
 * is the original `commenter` of the comment.
 */
export const RemoveCommentRequest: Sync = (
  { request, comment, user, commentDoc },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", comment, user },
    { request },
  ]),
  where: async (frames: Frames) => {
    // Fetch the comment to get its author
    frames = await frames.query(
      Comment._getCommentById,
      { commentId: comment },
      { comment: commentDoc },
    );
    // Only allow frames where the commenter matches the user making the request
    return frames.filter(($) => $[commentDoc]?.commenter === $[user]);
  },
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

// ##################################
// # UserAuthentication Concept     #
// ##################################

/**
 * Handles a request to delete a user.
 * Authorization: This action is self-authenticating by requiring the user's current password.
 * No additional session-based check is needed in the `where` clause.
 */
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

/**
 * Handles a request to change a password.
 * Authorization: This action is self-authenticating by requiring the user's current password.
 * No additional session-based check is needed in the `where` clause.
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
 * Handles a request for a file upload URL.
 * Authorization: The `where` clause verifies that the `owner` specified in the request
 * corresponds to a valid, existing user.
 */
export const RequestUploadRequest: Sync = ({ request, fileName, owner }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", fileName, owner },
    { request },
  ]),
  where: async (frames: Frames) => {
    // Verify the owner exists in the system before proceeding.
    // If _getUserById returns no results, the frame will be dropped and the 'then' will not fire.
    return await frames.query(UserAuthentication._getUserById, { id: owner }, {});
  },
  then: actions([FileUrl.requestUpload, { fileName, owner }]),
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
 * Handles a request to confirm a file upload.
 * Authorization: The `where` clause verifies that the `owner` specified in the request
 * corresponds to a valid, existing user.
 */
export const ConfirmUploadRequest: Sync = (
  { request, fileName, title, gcsObjectName, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", fileName, title, gcsObjectName, owner },
    { request },
  ]),
  where: async (frames: Frames) => {
    // Verify the owner exists in the system before proceeding.
    return await frames.query(UserAuthentication._getUserById, { id: owner }, {});
  },
  then: actions([FileUrl.confirmUpload, {
    fileName,
    title,
    gcsObjectName,
    owner,
  }]),
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
 * Handles a request to delete a file.
 * Authorization: The `where` clause verifies the requesting `user` is the file's `owner`.
 */
export const DeleteFileRequest: Sync = ({ request, file, user, fileDoc }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", file, user },
    { request },
  ]),
  where: async (frames: Frames) => {
    frames = await frames.query(
      FileUrl._getFileById,
      { fileId: file },
      { fileDoc },
    );
    return frames.filter(($) => $[fileDoc]?.owner === $[user]);
  },
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

/**
 * Handles a request for a temporary file view URL.
 * Authorization: None. This is treated as a public action, allowing link sharing.
 * Anyone with the GCS object name can request a view URL.
 */
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

/**
 * Handles a request to add a tag to a music registry.
 * Authorization: None specified in the concept. Assumed to be a public action.
 */
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

/**
 * Handles a request to remove a tag from a music registry.
 * Authorization: None specified in the concept. Assumed to be a public action.
 */
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

/**
 * Handles a request to delete a music registry.
 * Authorization: None specified in the concept. Assumed to be a public action.
 */
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
