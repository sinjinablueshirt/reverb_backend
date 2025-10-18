---
timestamp: 'Sat Oct 18 2025 11:17:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_111701.a101aece.md]]'
content_id: c642e5bd5ea3c5e66401065e751ecdf05c5893736e1f528fe3bc6af7c685e975
---

# API Specification: FileUrl Concept

**Purpose:** to let file information be uploaded and displayed

***

## API Endpoints

### POST /api/FileUrl/uploadFile

**Description:** Uploads a local file to Google Cloud Storage, creates a record in the concept's state, and returns the ID of the newly created file.

**Requirements:**

* `filePath` points to a valid file on the local filesystem where the concept is running.
* A file with this exact `filePath` has not already been uploaded by this `owner`.

**Effects:**

* Saves a new `file` record with the provided `filePath` and `owner`.
* Uploads the contents of the local file specified by `filePath` to Google Cloud Storage.
* Obtains a unique public `url` to access this file in GCS.
* Stores this `url` along with other file information in the concept's state (MongoDB).
* Returns the ID of the newly created `file` record.

**Request Body:**

```json
{
  "filePath": "string",
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

**Description:** Deletes a specified file record from the concept's state and its corresponding content from Google Cloud Storage, rendering its URL inaccessible.

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
