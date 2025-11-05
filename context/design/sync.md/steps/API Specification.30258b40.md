---
timestamp: 'Sun Nov 02 2025 12:44:01 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_124401.8017e2b6.md]]'
content_id: 30258b4059c40d2da8050b19b96831f2589c921c072e7a0c9375ce7e19dd5729
---

# API Specification: MusicTagging Concept

**Purpose:** Manage musical resources by associating them with descriptions and automatically suggested or manually added tags, enabling search and organization.

***

## API Endpoints

### POST /api/MusicTagging/registerResource

**Description:** Registers a new musical resource with a description in the system.

**Requirements:**

* No `Registry` entry exists in the state for the given `resource`.

**Effects:**

* A new `Registry` entry is created in the concept's state with the given `resource`, `description`, and an empty set of `tags`.
* The identifier of the new `Registry` entry is returned.

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

***

### POST /api/MusicTagging/addTag

**Description:** Adds a specific tag to an existing musical resource registry.

**Requirements:**

* `registry` exists in the state.
* `tag` is not already present in `registry.tags`.

**Effects:**

* `tag` is added to the `tags` set of the specified `registry`.

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

***

### POST /api/MusicTagging/removeTag

**Description:** Removes a specific tag from an existing musical resource registry.

**Requirements:**

* `registry` exists in the state.
* `tag` is present in `registry.tags`.

**Effects:**

* `tag` is removed from the `tags` set of the specified `registry`.

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

***

### POST /api/MusicTagging/deleteRegistry

**Description:** Deletes an existing musical resource registry and all its associated data.

**Requirements:**

* `registry` exists in the state.

**Effects:**

* The specified `registry` entry and all its associated data are removed from the state.

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

***

### POST /api/MusicTagging/suggestTags

**Description:** Uses an internal LLM to create a set of tags that fit the provided description in a musical context and returns them.

**Requirements:**

* `description` is not empty

**Effects:**

* uses an internal llm to create a set of tags that fit the `description` in a musical context and returns this set.
* Tags already present in `existingTags` are not suggested.

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

***

### POST /api/MusicTagging/\_getRegistriesByTags

**Description:** Retrieves all musical resource registries that contain at least all the tags in a given set.

**Requirements:**

* The `tags` array in the request body must not be empty.

**Effects:**

* Returns a set of `Registry` objects where each `Registry` has at least all the tags specified in the input `tags` array.

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

***

### POST /api/MusicTagging/\_getRegistryById

**Description:** Retrieves a single musical resource registry by its unique identifier.

**Requirements:**

* The `id` in the request body must be a valid registry identifier.
* A `Registry` with the given `id` must exist in the state.

**Effects:**

* Returns the `Registry` object identified by the input `id`.

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

***

### POST /api/MusicTagging/\_getRegistryByResource

**Description:** Retrieves a single musical resource registry by its associated resource identifier.

**Requirements:**

* The `resource` in the request body must be a valid resource identifier.
* A `Registry` entry associated with the given `resource` must exist in the state.

**Effects:**

* Returns the `Registry` object associated with the input `resource`.

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
