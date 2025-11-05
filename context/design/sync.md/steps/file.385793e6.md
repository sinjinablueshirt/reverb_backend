---
timestamp: 'Sun Nov 02 2025 12:47:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_124749.f3dae070.md]]'
content_id: 385793e6611fab060f08f62e1e7b4727ff2f58e6a85d0430c9e6df9c8f48f3dc
---

# file: src/syncs/fileUrl.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { FileUrl, Requesting, Sessioning } from "@concepts";

/**
 * Handles a request for a pre-signed upload URL after authenticating the user.
 */
export const RequestUpload: Sync = ({ request, fileName, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", fileName, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([FileUrl.requestUpload, { fileName, owner: user }]),
});

/**
 * Responds to the client with the generated pre-signed URL and object name.
 */
export const RequestUploadResponse: Sync = ({ request, uploadUrl, gcsObjectName }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/requestUpload" }, { request }],
    [FileUrl.requestUpload, {}, { uploadUrl, gcsObjectName }],
  ),
  then: actions([Requesting.respond, { request, uploadUrl, gcsObjectName }]),
});

/**
 * Responds with an error if the upload request fails.
 */
export const RequestUploadError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/requestUpload" }, { request }],
    [FileUrl.requestUpload, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the confirmation of a file upload after authenticating the user.
 */
export const ConfirmUpload: Sync = ({ request, fileName, title, gcsObjectName, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", fileName, title, gcsObjectName, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([FileUrl.confirmUpload, { fileName, title, gcsObjectName, owner: user }]),
});

/**
 * Responds with the new file ID after successful confirmation.
 */
export const ConfirmUploadResponse: Sync = ({ request, file }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/confirmUpload" }, { request }],
    [FileUrl.confirmUpload, {}, { file }],
  ),
  then: actions([Requesting.respond, { request, file }]),
});

/**
 * Responds with an error if the upload confirmation fails.
 */
export const ConfirmUploadError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/confirmUpload" }, { request }],
    [FileUrl.confirmUpload, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the request to delete a file after authenticating the user.
 */
export const DeleteFile: Sync = ({ request, file, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/deleteFile", file, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([FileUrl.deleteFile, { file, user }]),
});

/**
 * Responds after a file is successfully deleted.
 */
export const DeleteFileResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/deleteFile" }, { request }],
    [FileUrl.deleteFile, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds with an error if file deletion fails.
 */
export const DeleteFileError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/deleteFile" }, { request }],
    [FileUrl.deleteFile, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the request for a pre-signed view URL.
 * The API spec doesn't indicate authentication is needed for this action.
 */
export const GetViewUrl: Sync = ({ request, gcsObjectName }) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/getViewUrl", gcsObjectName },
    { request },
  ]),
  then: actions([FileUrl.getViewUrl, { gcsObjectName }]),
});

/**
 * Responds with the pre-signed view URL.
 */
export const GetViewUrlResponse: Sync = ({ request, viewUrl }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/getViewUrl" }, { request }],
    [FileUrl.getViewUrl, {}, { viewUrl }],
  ),
  then: actions([Requesting.respond, { request, viewUrl }]),
});

/**
 * Responds with an error if getting the view URL fails.
 */
export const GetViewUrlError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/getViewUrl" }, { request }],
    [FileUrl.getViewUrl, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
