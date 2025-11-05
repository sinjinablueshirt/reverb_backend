# API Specification: UserAuthentication Concept

**Purpose:** to identify and authenticate users so that only legitimate users can access their own accounts.

---

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Creates and saves a new user, returning the identifier of the created user.

**Requirements:**
- A user with the same username doesn't already exist.

**Effects:**
- Creates and saves a new user.
- Returns the created user's identifier.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuthentication/login

**Description:** Authenticates a user with the provided username and password, returning the user's identifier if successful.

**Requirements:**
- A user exists that has a username and password that matches the passed in username and password.

**Effects:**
- Returns the user that has a username and password that matches the passed in username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**
```json
{
  "user": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuthentication/deleteUser

**Description:** Deletes a user from the system based on their username and password.

**Requirements:**
- A user exists that has a username and password that matches the passed in username and password.

**Effects:**
- Deletes the user that has a username and password that matches the passed in username and password.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
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

### POST /api/UserAuthentication/changePassword

**Description:** Changes the password for an existing user after verifying their current credentials.

**Requirements:**
- A user exists that has a username and password that matches the passed in username and oldPassword.

**Effects:**
- Changes the user's password to newPassword.

**Request Body:**
```json
{
  "username": "string",
  "oldPassword": "string",
  "newPassword": "string"
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

### POST /api/UserAuthentication/_getUserById

**Description:** Retrieves the username for a given user ID.

**Requirements:**
- A user with the given ID must exist.

**Effects:**
- Returns the username of the user with the given ID.

**Request Body:**
```json
{
  "id": "string"
}
```

**Success Response Body (Query):**
```json
{
  "username": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

# API Specification: Comment Concept

**Purpose:** associate some text with another artifact (usually itself textual) that remarks on, augments or explains it

---

## API Endpoints

### POST /api/Comment/register

**Description:** Registers a new resource in the system, enabling it to receive comments.

**Requirements:**
- The `resource` isn't already registered.

**Effects:**
- Saves the `resource` with an empty set of `comments`.

**Request Body:**
```json
{
  "resource": "ID"
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

### POST /api/Comment/addComment

**Description:** Adds a new comment to a specified resource by a given user.

**Requirements:**
- The `resource` is registered.

**Effects:**
- Creates and saves a new `comment` made by `commenter` with the provided `text` at the specified `date` under the `resource`.
- Returns the `ID` of the newly created `comment`.

**Request Body:**
```json
{
  "resource": "ID",
  "commenter": "ID",
  "text": "string",
  "date": "string"
}
```

**Success Response Body (Action):**
```json
{
  "comment": "ID"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Comment/removeComment

**Description:** Removes an existing comment from the system, ensuring that the calling user is the original commenter.

**Requirements:**
- The `comment` exists.
- The `user` is the `commenter` of the specified `comment`.

**Effects:**
- Removes the `comment` from the `resource` it is bound to.
- Deletes the `comment` itself.

**Request Body:**
```json
{
  "comment": "ID",
  "user": "ID"
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

### POST /api/Comment/_getCommentsByResource

**Description:** Retrieves all comments associated with a specific resource.

**Requirements:**
- The `resource` is registered.

**Effects:**
- Returns a list of all comments associated with the specified resource.

**Request Body:**
```json
{
  "resource": "ID"
}
```

**Success Response Body (Query):**
```json
{
    "comments":
        [
        {
            "_id": "ID",
            "text": "string",
            "commenter": "ID",
            "date": "string"
        }
        ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/Comment/_getCommentById

**Description:** Retrieves a specific comment by its unique identifier.

**Requirements:**
- The `commentId` exists.

**Effects:**
- Returns the comment object if found, otherwise an empty array.

**Request Body:**
```json
{
  "commentId": "ID"
}
```

**Success Response Body (Query):**
```json
{
    "comment":
        {
            "_id": "ID",
            "text": "string",
            "commenter": "ID",
            "date": "string"
        }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

# API Specification: MusicTagging Concept

**Purpose:** Manage musical resources by associating them with descriptions and automatically suggested or manually added tags, enabling search and organization.

---

## API Endpoints

### POST /api/MusicTagging/registerResource

**Description:** Registers a new musical resource with a description in the system.

**Requirements:**
- No `Registry` entry exists in the state for the given `resource`.

**Effects:**
- A new `Registry` entry is created in the concept's state with the given `resource`, `description`, and an empty set of `tags`.
- The identifier of the new `Registry` entry is returned.

**Request Body:**
```json
{
  "resource": "string",
  "description": "string"
}
```

**Success Response Body (Action):**
```json
{
  "registry": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MusicTagging/addTag

**Description:** Adds a specific tag to an existing musical resource registry.

**Requirements:**
- `registry` exists in the state.
- `tag` is not already present in `registry.tags`.

**Effects:**
- `tag` is added to the `tags` set of the specified `registry`.

**Request Body:**
```json
{
  "registry": "string",
  "tag": "string"
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

### POST /api/MusicTagging/removeTag

**Description:** Removes a specific tag from an existing musical resource registry.

**Requirements:**
- `registry` exists in the state.
- `tag` is present in `registry.tags`.

**Effects:**
- `tag` is removed from the `tags` set of the specified `registry`.

**Request Body:**
```json
{
  "registry": "string",
  "tag": "string"
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

### POST /api/MusicTagging/deleteRegistry

**Description:** Deletes an existing musical resource registry and all its associated data.

**Requirements:**
- `registry` exists in the state.

**Effects:**
- The specified `registry` entry and all its associated data are removed from the state.

**Request Body:**
```json
{
  "registry": "string"
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

### POST /api/MusicTagging/suggestTags

**Description:** Uses an internal LLM to create a set of tags that fit the provided description in a musical context and returns them.

**Requirements:**
- `description` is not empty

**Effects:**
- uses an internal llm to create a set of tags that fit the `description` in a musical context and returns this set.
- Tags already present in `existingTags` are not suggested.

**Request Body:**
```json
{
  "description": "string",
  "existingTags": ["string"]
}
```

**Success Response Body (Action):**
```json
{
  "tags": ["string"]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MusicTagging/_getRegistriesByTags

**Description:** Retrieves all musical resource registries that contain at least all the tags in a given set.

**Requirements:**
- The `tags` array in the request body must not be empty.

**Effects:**
- Returns a set of `Registry` objects where each `Registry` has at least all the tags specified in the input `tags` array.

**Request Body:**
```json
{
  "tags": ["string"]
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "resource": "string",
    "description": "string",
    "tags": ["string"]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MusicTagging/_getRegistryById

**Description:** Retrieves a single musical resource registry by its unique identifier.

**Requirements:**
- The `id` in the request body must be a valid registry identifier.
- A `Registry` with the given `id` must exist in the state.

**Effects:**
- Returns the `Registry` object identified by the input `id`.

**Request Body:**
```json
{
  "id": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "resource": "string",
    "description": "string",
    "tags": ["string"]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/MusicTagging/_getRegistryByResource

**Description:** Retrieves a single musical resource registry by its associated resource identifier.

**Requirements:**
- The `resource` in the request body must be a valid resource identifier.
- A `Registry` entry associated with the given `resource` must exist in the state.

**Effects:**
- Returns the `Registry` object associated with the input `resource`.

**Request Body:**
```json
{
  "resource": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "_id": "string",
    "resource": "string",
    "description": "string",
    "tags": ["string"]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

# API Specification: FileUrl Concept

**Purpose:** to let file information be uploaded and displayed

---

## API Endpoints

### POST /api/FileUrl/requestUpload

**Description:** Generates pre-signed URLs for clients to upload files directly to GCS.

**Requirements:**
- `fileName` isn't empty.
- No other file with `fileName` has been uploaded by `owner` (i.e., no confirmed file with this name for this user).

**Effects:**
- Generates a unique `gcsObjectName` that embeds a temporary file ID.
- Creates a pre-signed `uploadUrl` that allows the client to upload directly to GCS for a limited time.
- Returns both the `uploadUrl` and the `gcsObjectName`.
- (No database record is created at this stage).

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

---

### POST /api/FileUrl/confirmUpload

**Description:** Confirms a file upload to GCS and creates a permanent file record in the database.

**Requirements:**
- An object exists in GCS with `gcsObjectName`.
- The `owner` and `fileName` provided as arguments match the information encoded within `gcsObjectName`.
- No `File` record already exists in the database with the file ID embedded in `gcsObjectName`.

**Effects:**
- Verifies the existence of the uploaded object in GCS.
- Extracts the unique file ID (`_id`) from `gcsObjectName`.
- Constructs a permanent public URL for retrieving the file.
- Saves a new `File` record in the concept's state (MongoDB) with `fileName`, `gcsObjectName`, `owner`, and `url`.
- Returns the ID of the newly created `File` record.

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

---

### POST /api/FileUrl/deleteFile

**Description:** Deletes a file record from the database and its corresponding content from GCS.

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

### POST /api/FileUrl/getViewUrl

**Description:** Generates a pre-signed URL for viewing/downloading a file from GCS.

**Requirements:**
- `gcsObjectName` exists in GCS.

**Effects:**
- Generates and returns a pre-signed URL that allows viewing/downloading the file from Google Cloud Storage for a limited time.

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

---

### POST /api/FileUrl/_getFilesByUser

**Description:** Returns an array of file metadata owned by the specified user.

**Requirements:**
- `user` exists (conceptually, or an active user session).

**Effects:**
- Returns an array of `File` documents (metadata) owned by the specified `user`.

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

---

### POST /api/FileUrl/_getFileById

**Description:** Returns the file metadata matching the given file ID, or null if not found.

**Requirements:**
- none

**Effects:**
- Returns the `File` document (metadata) matching the given `fileId`, or `null` if not found.

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

---

### POST /api/FileUrl/_getFileTitleById

**Description:** Retrieves the title of a file by its ID.

**Requirements:**
- none

**Effects:**
- Returns the title of the file.

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
