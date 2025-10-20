---
timestamp: 'Mon Oct 20 2025 11:37:16 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_113716.f441c060.md]]'
content_id: 90e9c3388bd2d8c83ce0bbfa6c9fd91eec08bf555faf088df9527033bca0d1f2
---

# API Specification: MusicTagging Concept

**Purpose:** Enable the categorization and discovery of music resources through user-defined and AI-suggested tags based on resource descriptions.

***

## API Endpoints

### POST /api/MusicTagging/registerResource

**Description:** Creates a new `Registry` entry in the concept's state with the given `resource`, `description`, and an empty set of `tags`. The identifier of the new `Registry` entry is returned.

**Requirements:**

* No `Registry` entry exists in the state for the given `resource`.

**Effects:**

* A new `Registry` entry is created in the concept's state with the given `resource`, `description`, and an empty set of `tags`. The identifier of the new `Registry` entry is returned.

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

**Description:** Adds a `tag` to the `tags` set of the specified `registry`.

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

**Description:** Removes a `tag` from the `tags` set of the specified `registry`.

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

**Description:** Removes the specified `registry` entry and all its associated data from the state.

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

**Description:** Uses an internal LLM to create a set of tags that fit the `registry.description` in a musical context and adds them to `registry.tags`. Tags already present in `registry.tags` are not re-added.

**Requirements:**

* `registry` exists in the state.

**Effects:**

* Uses an internal LLM to create a set of tags that fit the `registry.description` in a musical context and adds them to `registry.tags`. Tags already present in `registry.tags` are not re-added.

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

### POST /api/MusicTagging/getRegistriesByTags

**Description:** Obtains all registries that have at least all the tags in a set of tags.

**Requirements:**

* The `tags` array in the request body must not be empty.

**Effects:**

* Returns all registries that have at least all the tags in a set of tags.

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

### POST /api/MusicTagging/getRegistryById

**Description:** Obtains a registry from its ID.

**Requirements:**

* A valid `id` is provided in the request body.

**Effects:**

* Returns the registry corresponding to the given ID.

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
