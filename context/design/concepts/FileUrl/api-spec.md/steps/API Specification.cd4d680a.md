---
timestamp: 'Sat Oct 18 2025 15:17:05 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_151705.421c8ad0.md]]'
content_id: cd4d680a259a4e65b5c0e0883c73e39e9f46751392ae636550c597773ca636cc
---

# API Specification: FileUrl Concept

**Purpose:** to let file information be uploaded and displayed

***

## API Endpoints

### POST /api/FileUrl/requestUpload

**Description:** Initiates a file upload process by providing a pre-signed URL for direct Google Cloud Storage interaction.

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

**Description:** Finalizes a file upload, verifying its presence in Google Cloud Storage and recording its metadata in the system.

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

**Description:** Removes a file's metadata from the system and deletes its corresponding content from Google Cloud Storage.

**Requirements:**

* `file` exists.
* `user` is its `owner`.

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

### POST /api/FileUrl/\_getFilesByUser

**Description:** Retrieves metadata for all files owned by a specific user.

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

**Description:** Fetches metadata for a single file identified by its unique ID.

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
    "owner": "string",
    "url": "string",
    "gcsObjectName": "string",
    "fileName": "string"
  }
]
```

*(If the file is not found, an empty array `[]` will be returned instead of an array containing a null object.)*

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
