[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@code](../../../src/concepts/FileUrl/FileUrlConcept.ts)

# prompt: create an api spec for the FileUrl concept

# response:

# API Specification: FileUrl Concept

**Purpose:** to let file information be uploaded and displayed

---

## API Endpoints

### POST /api/FileUrl/uploadFile

**Description:** Uploads a local file to Google Cloud Storage, creates a record in the concept's state, and returns the ID of the newly created file.

**Requirements:**
- `filePath` points to a valid file on the local filesystem where the concept is running.
- A file with this exact `filePath` has not already been uploaded by this `owner`.

**Effects:**
- Saves a new `file` record with the provided `filePath` and `owner`.
- Uploads the contents of the local file specified by `filePath` to Google Cloud Storage.
- Obtains a unique public `url` to access this file in GCS.
- Stores this `url` along with other file information in the concept's state (MongoDB).
- Returns the ID of the newly created `file` record.

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

---

### POST /api/FileUrl/deleteFile

**Description:** Deletes a specified file record from the concept's state and its corresponding content from Google Cloud Storage, rendering its URL inaccessible.

**Requirements:**
- `file` exists and `user` is its `owner`.

**Effects:**
- Removes `file` from the concept's state (MongoDB).
- Deletes the corresponding file content from the external Google Cloud Storage service, rendering its `url` inaccessible.

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

---