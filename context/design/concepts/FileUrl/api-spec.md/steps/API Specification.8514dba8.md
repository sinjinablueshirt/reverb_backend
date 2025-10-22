---
timestamp: 'Mon Oct 20 2025 23:00:28 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_230028.15064528.md]]'
content_id: 8514dba80a834dd2327654c9cf1f94d415f571a8425eb5bc7a3fe1a1c5a9f1f6
---

# API Specification: FileUrl Concept

**Purpose:** to let file information be uploaded and displayed

***

## API Endpoints

### POST /api/FileUrl/requestUpload

**Description:** Requests presigned URLs in order to upload files to Google Cloud Storage.

**Requirements:**

* `fileName` isn't empty.
* No other file with `fileName` has been uploaded by `owner` (i.e., no confirmed file with this name for this user).

**Effects:**

* Generates a unique `gcsObjectName` that embeds a temporary file ID.
* Creates a pre-signed `uploadUrl` that allows the client to upload directly to GCS for a limited time.
* Returns both the `uploadUrl` and the `gcsObjectName`.
* (No database record is created at this stage).

**Request Body:**

```json
{
  "fileName": "string",
  "owner": "string"
}
```

**Success Response Body (Action):**

```json
{
  "uploadUrl": "string",
  "gcsObjectName": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/FileUrl/confirmUpload

**Description:** Confirms a successful file upload to GCS and creates a database record.

**Requirements:**

* An object exists in GCS with `gcsObjectName`.
* The `owner` and `fileName` provided as arguments match the information encoded within `gcsObjectName`.
* No `File` record already exists in the database with the file ID embedded in `gcsObjectName`.

**Effects:**

* Verifies the existence of the uploaded object in GCS.
* Extracts the unique file ID (`_id`) from `gcsObjectName`.
* Constructs a permanent public URL for retrieving the file.
* Saves a new `File` record in the concept's state (MongoDB) with `fileName`, `gcsObjectName`, `owner`, and `url`.
* Returns the ID of the newly created `File` record.

**Request Body:**

```json
{
  "fileName": "string",
  "gcsObjectName": "string",
  "owner": "string"
}
```

**Success Response Body (Action):**

```json
{
  "file": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/FileUrl/deleteFile

**Description:** Deletes a file from the concept's state and the external Google Cloud Storage.

**Requirements:**

* `file` exists
* `user` is its `owner`

**Effects:**

* Removes `file` from the concept's state (MongoDB).
* Deletes the corresponding file content from the external Google Cloud Storage service, rendering its `url` inaccessible.

**Request Body:**

```json
{
  "file": "string",
  "user": "string"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/FileUrl/getViewUrl

**Description:** Generates and returns a pre-signed URL that allows viewing/downloading the file from Google Cloud Storage for a limited time.

**Requirements:**

* `gcsObjectName` exists in GCS.

**Effects:**

* Generates and returns a pre-signed URL that allows viewing/downloading the file from Google Cloud Storage for a limited time.

**Request Body:**

```json
{
  "gcsObjectName": "string"
}
```

**Success Response Body (Action):**

```json
{
  "viewUrl": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/FileUrl/\_getFilesByUser

**Description:** Returns an array of `File` documents (metadata) owned by the specified `user`.

**Requirements:**

* `user` exists (conceptually, or an active user session).

**Effects:**

* Returns an array of `File` documents (metadata) owned by the specified `user`.

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string",
    "owner": "string",
    "url": "string",
    "gcsObjectName": "string",
    "fileName": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/FileUrl/\_getFileById

**Description:** Returns the `File` document (metadata) matching the given `fileId`, or `null` if not found.

**Requirements:**

* none

**Effects:**

* Returns the `File` document (metadata) matching the given `fileId`, or `null` if not found.

**Request Body:**

```json
{
  "fileId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "file": {
      "_id": "string",
      "owner": "string",
      "url": "string",
      "gcsObjectName": "string",
      "fileName": "string"
    }
  }
]
```

*(Note: If the file is not found, `file` will be `null` within the array element.)*

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
