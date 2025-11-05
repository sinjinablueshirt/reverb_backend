---
timestamp: 'Sun Nov 02 2025 17:49:29 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_174929.5c2b51b0.md]]'
content_id: d2eb40c7bb684fda3dd40e73ded7e022be930c5f43f11aa652c9e9a0df916bca
---

# file: src/syncs/api.sync.ts

```typescript
import {
  Comment,
  FileUrl,
  MusicTagging,
  Requesting,
  UserAuthentication,
  Session,
} from "@concepts";
import { actions, Frames, Sync } from "@engine";

// ##################################
// #       Comment Concept          #
// ##################################

// Note: Assumes requests will include a `session` ID for authentication.
export const RemoveCommentRequest: Sync = ({ request, comment, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", comment, session },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate the user session before proceeding.
    return await frames.query(Session._getUser, { session }, { user });
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

// Note: These actions authenticate via username/password, not session. No changes needed.
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

export const RequestUploadRequest: Sync = ({ request, fileName, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", fileName, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Session._getUser, { session }, { user });
  },
  then: actions([FileUrl.requestUpload, { fileName, owner: user }]),
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
  { request, fileName, title, gcsObjectName, session, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", fileName, title, gcsObjectName, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Session._getUser, { session }, { user });
  },
  then: actions([FileUrl.confirmUpload, {
    fileName,
    title,
    gcsObjectName,
    owner: user,
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

export const DeleteFileRequest: Sync = ({ request, file, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", file, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Session._getUser, { session }, { user });
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

export const GetViewUrlRequest: Sync = ({ request, gcsObjectName, session, user, file }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/getViewUrl", gcsObjectName, session },
    { request },
  ]),
  where: async (frames) => {
    // Get user from session
    frames = await frames.query(Session._getUser, { session }, { user });
    // Get all files for that user
    frames = await frames.query(FileUrl._getFilesByUser, { user }, { file });
    // Only proceed if the user owns a file with the requested gcsObjectName
    return frames.filter(($) => $[file].gcsObjectName === $[gcsObjectName]);
  },
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

// Note: We assume MusicTagging actions accept a `user` parameter for authorization,
// implying that registries have owners.
export const AddTagRequest: Sync = ({ request, registry, tag, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", registry, tag, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Session._getUser, { session }, { user });
  },
  then: actions([MusicTagging.addTag, { registry, tag, user }]),
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

export const RemoveTagRequest: Sync = ({ request, registry, tag, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", registry, tag, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Session._getUser, { session }, { user });
  },
  then: actions([MusicTagging.removeTag, { registry, tag, user }]),
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

export const DeleteRegistryRequest: Sync = ({ request, registry, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", registry, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Session._getUser, { session }, { user });
  },
  then: actions([MusicTagging.deleteRegistry, { registry, user }]),
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
