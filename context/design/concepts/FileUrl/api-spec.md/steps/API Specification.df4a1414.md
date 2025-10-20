---
timestamp: 'Sat Oct 18 2025 14:15:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_141501.87088110.md]]'
content_id: df4a14146bea5e7c0830756bbb3ebce963911cb8fba3579e1563f8e2e37210df
---

# API Specification: FileUrl Concept

**Purpose:** to let file information be uploaded and displayed

***

## API Endpoints

### POST /api/FileUrl/uploadFile

**Description:** Uploads a file to a storage service and associates it with an owner, returning a file ID and a URL for retrieval.

**Requirements:**

* `fileData` is a valid Blob object (representing the file content). (Interpreted as base64 encoded string for JSON transport.)
* `originalFileName` is a non-empty string.
* No other file with the same `originalFileName` has already been uploaded by this `owner`.

**Effects:**

* Saves a new `file` record with the provided `originalFileName` and `owner`.
* Uploads the contents of the `fileData` Blob to Google Cloud Storage.
* Obtains a unique public `url` to access this file in GCS.
* Stores this `url` along with other file information in the concept's state (MongoDB).
* Returns the ID of the newly created `file` record.

**Request Body:**

```json
{
  "fileData": "string (base64 encoded)",
  "originalFileName": "string",
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

**Description:** Deletes a file record and its corresponding content from storage, provided the requesting user is the owner.

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
    "originalFileName": "string"
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

**Description:** Retrieves metadata for a single file given its ID.

**Requirements:**

* none

**Effects:**

* Returns the `File` document (metadata) matching the given `fileId`, or an empty array if not found.

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
    "originalFileName": "string"
  }
]
```

*(Note: If no file is found, an empty array `[]` will be returned)*

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
