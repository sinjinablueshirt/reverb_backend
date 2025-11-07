---
timestamp: 'Thu Nov 06 2025 22:33:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251106_223349.f12941f3.md]]'
content_id: cc6c539aced2d44e591ce2f6cd32023e5b4ef1b68f8b8d7db83e1b4c3629be2f
---

# file: src/syncs/auth.sync.ts

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

// #############################################################################
// # UserAuthentication and Sessioning Syncs
// #############################################################################

// UserAuthentication/register
export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

export const RegisterResponse: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// UserAuthentication/login -> Sessioning.create
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

export const CreateSessionOnLogin: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

export const LoginResponse: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// UserAuthentication/deleteUser
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
    [Requesting.request, { path: "/UserAuthentication/deleteUser" }, {
      request,
    }],
    [UserAuthentication.deleteUser, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteUserResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/deleteUser" }, {
      request,
    }],
    [UserAuthentication.deleteUser, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// UserAuthentication/changePassword
export const ChangePasswordRequest: Sync = (
  { request, username, oldPassword, newPassword },
) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/changePassword", username, oldPassword, newPassword },
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
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, {
      request,
    }],
    [UserAuthentication.changePassword, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const ChangePasswordResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/changePassword" }, {
      request,
    }],
    [UserAuthentication.changePassword, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// Sessioning/delete
export const DeleteSessionRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/Sessioning/delete", session },
    { request },
  ]),
  then: actions([Sessioning.delete, { session }]),
});

export const DeleteSessionResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/delete" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteSessionResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/delete" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// Sessioning/_getUser
export const GetUserFromSessionRequest: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/Sessioning/_getUser", session },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Requesting.respond, { request, user }]),
});

// #############################################################################
// # Comment Syncs
// #############################################################################

// Comment/register
export const RegisterCommentResourceRequest: Sync = (
  { request, session, resource, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/register", session, resource },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Comment.register, { resource }]),
});

export const RegisterCommentResourceResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/register" }, { request }],
    [Comment.register, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RegisterCommentResourceResponseError: Sync = (
  { request, error },
) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/register" }, { request }],
    [Comment.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// Comment/addComment
export const AddCommentRequest: Sync = (
  { request, session, resource, text, date, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/addComment", session, resource, text, date },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([Comment.addComment, { resource, commenter: user, text, date }]),
});

export const AddCommentResponse: Sync = ({ request, comment }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/addComment" }, { request }],
    [Comment.addComment, {}, { comment }],
  ),
  then: actions([Requesting.respond, { request, comment }]),
});

export const AddCommentResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Comment/addComment" }, { request }],
    [Comment.addComment, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// Comment/removeComment
export const RemoveCommentRequest: Sync = (
  { request, session, comment, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/Comment/removeComment", session, comment },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
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

// #############################################################################
// # FileUrl Syncs
// #############################################################################

// FileUrl/requestUpload
export const RequestUploadRequest: Sync = (
  { request, session, fileName, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", session, fileName },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
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

// FileUrl/confirmUpload
export const ConfirmUploadRequest: Sync = (
  { request, session, fileName, title, gcsObjectName, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", session, fileName, title, gcsObjectName },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    FileUrl.confirmUpload,
    { fileName, title, gcsObjectName, owner: user },
  ]),
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

// FileUrl/deleteFile
export const DeleteFileRequest: Sync = ({ request, session, file, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", session, file },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
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

// FileUrl/getViewUrl
export const GetViewUrlRequest: Sync = (
  { request, session, gcsObjectName, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/getViewUrl", session, gcsObjectName },
    { request },
  ]),
  where: async (frames) => {
    // Authorize that a logged-in user is making the request
    return frames.query(Sessioning._getUser, { session }, { user });
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

// #############################################################################
// # MusicTagging Syncs
// #############################################################################

// MusicTagging/registerResource
export const RegisterMusicResourceRequest: Sync = (
  { request, session, resource, description, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/registerResource", session, resource, description },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([MusicTagging.registerResource, { resource, description }]),
});

export const RegisterMusicResourceResponse: Sync = ({ request, registry }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/registerResource" }, {
      request,
    }],
    [MusicTagging.registerResource, {}, { registry }],
  ),
  then: actions([Requesting.respond, { request, registry }]),
});

export const RegisterMusicResourceResponseError: Sync = (
  { request, error },
) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/registerResource" }, {
      request,
    }],
    [MusicTagging.registerResource, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// MusicTagging/addTag
export const AddMusicTagRequest: Sync = (
  { request, session, registry, tag, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", session, registry, tag },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([MusicTagging.addTag, { registry, tag }]),
});

export const AddMusicTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const AddMusicTagResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// MusicTagging/removeTag
export const RemoveMusicTagRequest: Sync = (
  { request, session, registry, tag, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", session, registry, tag },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([MusicTagging.removeTag, { registry, tag }]),
});

export const RemoveMusicTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const RemoveMusicTagResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// MusicTagging/deleteRegistry
export const DeleteMusicRegistryRequest: Sync = (
  { request, session, registry, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", session, registry },
    { request },
  ]),
  where: async (frames) => {
    return frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([MusicTagging.deleteRegistry, { registry }]),
});

export const DeleteMusicRegistryResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, {
      request,
    }],
    [MusicTagging.deleteRegistry, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

export const DeleteMusicRegistryResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, {
      request,
    }],
    [MusicTagging.deleteRegistry, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
