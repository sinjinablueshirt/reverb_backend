---
timestamp: 'Mon Oct 20 2025 11:39:30 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_113930.34f88fc9.md]]'
content_id: 03a438106425cff2d973db799e7e2eaa1f1e3d53365c65c386060ddf3e8fc8e7
---

# API Specification: MusicTagging Concept

**Purpose:** Facilitate the categorization and discovery of musical resources through descriptive text and suggested tags.

***

## API Endpoints

### POST /api/MusicTagging/registerResource

**Description:** Registers a new musical resource with a description, initializing it with no tags.

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

**Description:** Adds a new tag to an existing musical resource registry.

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

**Description:** Removes an existing tag from a musical resource registry.

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

**Description:** Deletes a musical resource registry and all its associated tags.

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

**Description:** Uses an LLM to suggest and add new musical tags to a specified resource registry based on its description.

**Requirements:**

* `registry` exists in the state.

**Effects:**

* Uses `llm` to create a set of tags that fit the `registry.description` in a musical context.
* Adds the suggested tags to `registry.tags`.
* Tags already present in `registry.tags` are not re-added.

**Request Body:**

```json
{
  "registry": "string",
  "llm": "object"
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

### POST /api/MusicTagging/\_getRegistriesByTags

**Description:** Retrieves all musical resource registries that contain *all* of the specified tags.

**Requirements:**

* The `tags` array in the request body is not empty.

**Effects:**

* Returns a list of `Registry` objects whose `tags` set includes all the input `tags`.

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

**Description:** Retrieves a specific musical resource registry by its unique identifier.

**Requirements:**

* The provided `id` is a valid `RegistryID`.
* A `Registry` entry with the given `id` exists in the state.

**Effects:**

* Returns the `Registry` object associated with the given `id`.

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

**Description:** Retrieves a specific musical resource registry by its associated resource identifier.

**Requirements:**

* The provided `resource` is a valid `Resource` identifier.
* A `Registry` entry associated with the given `resource` exists in the state.

**Effects:**

* Returns the `Registry` object associated with the given `resource`.

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
