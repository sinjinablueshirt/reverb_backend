---
timestamp: 'Sun Nov 02 2025 17:52:09 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_175209.cbeb948c.md]]'
content_id: 7f45afae4619f99bd8f8739dced4e2fdaffc375e68b7b60cfbf5ccf938296151
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
import { actions, Sync } from "@engine";

// ##################################
// #       Comment Concept          #
// ##################################

// The Comment.removeComment action requires that the provided 'user' is the original
// commenter. This sync passes the parameters, and the concept action enforces authorization.
export const RemoveCommentRequest: Sync = ({ request, comment, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", comment, user },
    { request },
  ]),
  then: actions([Comment.removeComment, { comment, user }]),
});

export const RemoveCommentResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/removeComment" }, { request }],
    [Comment.removeComment, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

// This sync catches authorization errors returned by the Comment.removeComment action.
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

// Authentication is handled by the concept action, which validates the credentials.
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

// Authentication is handled by the concept action, which validates the credentials.
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

export const RequestUploadRequest: Sync = ({ request, fileName, owner }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", fileName, owner },
    { request },
  ]),
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

export const ConfirmUploadRequest: Sync = (
  { request, fileName, title, gcsObjectName, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", fileName, title, gcsObjectName, owner },
    { request },
  ]),
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

// The FileUrl.deleteFile action requires that the 'user' is the file's 'owner'.
// The concept action enforces this authorization.
export const DeleteFileRequest: Sync = ({ request, file, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", file, user },
    { request },
  ]),
  then: actions([FileUrl.deleteFile, { file, user }]),
});

export const DeleteFileResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/deleteFile" }, { request }],
    [FileUrl.deleteFile, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

// This sync catches authorization errors returned by the FileUrl.deleteFile action.
export const DeleteFileResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/deleteFile" }, { request }],
    [FileUrl.deleteFile, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

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

// ASSUMPTION: To authorize MusicTagging actions, we assume the client sends a `user` ID.
// We also assume the `_getRegistryById` query returns a registry object containing an `owner` field.
// These assumptions are necessary because the provided concept actions do not take a `user` for auth.

// This sync authorizes the user in the `where` clause and proceeds if successful.
export const AddTagRequest: Sync = (
  { request, registry, tag, user, retrievedRegistry },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", registry, tag, user },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(
      MusicTagging._getRegistryById,
      { id: registry },
      { retrievedRegistry },
    );
    return frames.filter(($) =>
      $[retrievedRegistry] && $[retrievedRegistry].owner === $[user]
    );
  },
  then: actions([MusicTagging.addTag, { registry, tag }]),
});

// This sync catches authorization failures and responds with an error immediately.
export const AddTagAuthFailure: Sync = (
  { request, registry, tag, user, retrievedRegistry },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", registry, tag, user },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(
      MusicTagging._getRegistryById,
      { id: registry },
      { retrievedRegistry },
    );
    return frames.filter(($) =>
      !$[retrievedRegistry] || $[retrievedRegistry].owner !== $[user]
    );
  },
  then: actions(
    [Requesting.respond, { request, error: "Unauthorized or registry not found" }],
  ),
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

export const RemoveTagRequest: Sync = (
  { request, registry, tag, user, retrievedRegistry },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", registry, tag, user },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(
      MusicTagging._getRegistryById,
      { id: registry },
      { retrievedRegistry },
    );
    return frames.filter(($) =>
      $[retrievedRegistry] && $[retrievedRegistry].owner === $[user]
    );
  },
  then: actions([MusicTagging.removeTag, { registry, tag }]),
});

export const RemoveTagAuthFailure: Sync = (
  { request, registry, tag, user, retrievedRegistry },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", registry, tag, user },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(
      MusicTagging._getRegistryById,
      { id: registry },
      { retrievedRegistry },
    );
    return frames.filter(($) =>
      !$[retrievedRegistry] || $[retrievedRegistry].owner !== $[user]
    );
  },
  then: actions(
    [Requesting.respond, { request, error: "Unauthorized or registry not found" }],
  ),
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

export const DeleteRegistryRequest: Sync = (
  { request, registry, user, retrievedRegistry },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", registry, user },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(
      MusicTagging._getRegistryById,
      { id: registry },
      { retrievedRegistry },
    );
    return frames.filter(($) =>
      $[retrievedRegistry] && $[retrievedRegistry].owner === $[user]
    );
  },
  then: actions([MusicTagging.deleteRegistry, { registry }]),
});

export const DeleteRegistryAuthFailure: Sync = (
  { request, registry, user, retrievedRegistry },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", registry, user },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(
      MusicTagging._getRegistryById,
      { id: registry },
      { retrievedRegistry },
    );
    return frames.filter(($) =>
      !$[retrievedRegistry] || $[retrievedRegistry].owner !== $[user]
    );
  },
  then: actions(
    [Requesting.respond, { request, error: "Unauthorized or registry not found" }],
  ),
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
