---
timestamp: 'Sat Oct 18 2025 13:40:08 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_134008.52742947.md]]'
content_id: 782812fae952a3d754c14ed6840deceff0117f3b648aa73ae21f8e36c3c85771
---

# API Specification: FileUrl Concept

**Purpose:** to let file information be uploaded and displayed

***

## API Endpoints

### POST /api/FileUrl/uploadFile

**Description:** Saves a new file record, uploads the file contents to Google Cloud Storage, obtains a public URL, and returns the ID of the new file.

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

**Description:** Removes a file record from the concept's state and deletes the corresponding content from Google Cloud Storage.

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

**Description:** Obtain all files uploaded by a specific user.

**Requirements:**

* true (No explicit preconditions beyond valid input type)

**Effects:**

* Returns an array of `FileDocument` objects where the `owner` matches the input `user`.

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
    "filePath": "string",
    "owner": "string",
    "url": "string",
    "gcsObjectName": "string"
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

**Description:** Obtain the file metadata by its ID.

**Requirements:**

* true (No explicit preconditions beyond valid input type)

**Effects:**

* Returns an array containing the `FileDocument` object for the given `fileId`, or an empty array if no matching file is found.

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
    "filePath": "string",
    "owner": "string",
    "url": "string",
    "gcsObjectName": "string"
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
