---
timestamp: 'Sun Nov 02 2025 13:05:50 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_130550.ea443835.md]]'
content_id: d4947b7725cc08d1129c237dd1244f672d43c284f91a2c2706c6f6ba3f30a2a6
---

# file: src/syncs/fileUrl.sync.ts

```typescript
import { FileUrl, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

/**
 * Handles a request from an authenticated user to get an upload URL for a new file.
 */
export const RequestUploadRequest: Sync = (
  { request, fileName, session, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/requestUpload", fileName, session },
    { request },
  ]),
  where: async (frames) => {
    // Authenticate the user via their session to get the owner ID
    return await frames.query(Sessioning._getUser, { session }, { user: owner });
  },
  then: actions([FileUrl.requestUpload, { fileName, owner }]),
});

/**
 * Responds with the pre-signed upload URL upon successful request.
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
 * Responds with an error if the upload URL request fails.
 */
export const RequestUploadResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/requestUpload" }, { request }],
    [FileUrl.requestUpload, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the request to confirm a file upload, creating a permanent record.
 */
export const ConfirmUploadRequest: Sync = (
  { request, fileName, title, gcsObjectName, session, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/confirmUpload", fileName, title, gcsObjectName, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user: owner });
  },
  then: actions(
    [FileUrl.confirmUpload, { fileName, title, gcsObjectName, owner }],
  ),
});

/**
 * Responds with the new file's ID upon successful confirmation.
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
export const ConfirmUploadResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/confirmUpload" }, { request }],
    [FileUrl.confirmUpload, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles a request from an authenticated user to delete a file.
 */
export const DeleteFileRequest: Sync = ({ request, file, session, user }) => ({
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
 * Responds with an error if file deletion fails.
 */
export const DeleteFileResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/deleteFile" }, { request }],
    [FileUrl.deleteFile, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles a request from an authenticated user to get a temporary view URL for a file.
 */
export const GetViewUrlRequest: Sync = (
  { request, gcsObjectName, session, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/FileUrl/getViewUrl", gcsObjectName, session },
    { request },
  ]),
  where: async (frames) => {
    // Check for a valid session as an authorization gate
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([FileUrl.getViewUrl, { gcsObjectName }]),
});

/**
 * Responds with the pre-signed view URL upon successful request.
 */
export const GetViewUrlResponse: Sync = ({ request, viewUrl }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/getViewUrl" }, { request }],
    [FileUrl.getViewUrl, {}, { viewUrl }],
  ),
  then: actions([Requesting.respond, { request, viewUrl }]),
});

/**
 * Responds with an error if the view URL request fails.
 */
export const GetViewUrlResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/FileUrl/getViewUrl" }, { request }],
    [FileUrl.getViewUrl, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
