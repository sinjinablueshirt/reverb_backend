---
timestamp: 'Sun Nov 02 2025 12:44:01 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_124401.8017e2b6.md]]'
content_id: e6e6c1d103aeac735b4733970ec981c1a7925fdae653e02d5f7cac5c8b1a54c3
---

# API Specification: FileUrl Concept

**Purpose:** to let file information be uploaded and displayed

***

## API Endpoints

### POST /api/FileUrl/requestUpload

**Description:** Generates pre-signed URLs for clients to upload files directly to GCS.

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

**Description:** Confirms a file upload to GCS and creates a permanent file record in the database.

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
  "title": "string",
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

**Description:** Deletes a file record from the database and its corresponding content from GCS.

**Requirements:**

* `file` exists and `user` is its `owner`.

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

**Description:** Generates a pre-signed URL for viewing/downloading a file from GCS.

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

**Description:** Returns an array of file metadata owned by the specified user.

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
    "title": "string",
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

**Description:** Returns the file metadata matching the given file ID, or null if not found.

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
    "_id": "string",
    "title": "string",
    "owner": "string",
    "url": "string",
    "gcsObjectName": "string",
    "fileName": "string"
  }
]
```

*(Note: If the file is not found, an empty array `[]` will be returned. If found, an array containing one object with the specified structure will be returned.)*

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/FileUrl/\_getFileTitleById

**Description:** Retrieves the title of a file by its ID.

**Requirements:**

* none

**Effects:**

* Returns the title of the file.

**Request Body:**

```json
{
  "fileId": "string"
}
```

**Success Response Body (Query):**

```json
{
    "title": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
