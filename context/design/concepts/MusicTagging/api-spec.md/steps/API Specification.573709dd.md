---
timestamp: 'Sat Oct 18 2025 13:40:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_134035.81d0ba21.md]]'
content_id: 573709dd17352a822576704a910acc1d5fbb274fc0851a8e28b91d5b553a35a9
---

# API Specification: MusicTagging Concept

**Purpose:** Facilitate the organization and discovery of music resources by associating them with descriptive tags, including AI-driven tag suggestions.

***

## API Endpoints

### POST /api/MusicTagging/registerResource

**Description:** Registers a new music resource with a description and initializes it with an empty set of tags.

**Requirements:**

* No `Registry` entry exists in the state for the given `resource`.

**Effects:**

* A new `Registry` entry is created in the concept's state with the given `resource`, `description`, and an empty set of `tags`.
* The identifier of the new `Registry` entry is returned.

**Request Body:**

```json
{
  "resource": "ID",
  "description": "string"
}
```

**Success Response Body (Action):**

```json
{
  "registry": "ID"
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

**Description:** Adds a new tag to an existing music resource registry.

**Requirements:**

* `registry` exists in the state.
* `tag` is not already present in `registry.tags`.

**Effects:**

* `tag` is added to the `tags` set of the specified `registry`.

**Request Body:**

```json
{
  "registry": "ID",
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

**Description:** Removes a tag from an existing music resource registry.

**Requirements:**

* `registry` exists in the state.
* `tag` is present in `registry.tags`.

**Effects:**

* `tag` is removed from the `tags` set of the specified `registry`.

**Request Body:**

```json
{
  "registry": "ID",
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

**Description:** Deletes a music resource registry and all its associated data.

**Requirements:**

* `registry` exists in the state.

**Effects:**

* The specified `registry` entry and all its associated data are removed from the state.

**Request Body:**

```json
{
  "registry": "ID"
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

**Description:** Uses an LLM to create a set of tags that fit the registry's description in a musical context and adds them to the registry's tags.

**Requirements:**

* `registry` exists in the state.

**Effects:**

* Uses `llm` to create a set of tags that fit the `registry.description` in a musical context and adds them to `registry.tags`.
* Tags already present in `registry.tags` are not re-added.

**Request Body:**

```json
{
  "registry": "ID",
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

### POST /api/MusicTagging/getRegistriesByTags

**Description:** Obtains all registries that have at least all the tags in a given set of tags.

**Requirements:**

* The input `tags` array must not be empty.

**Effects:**

* Returns a list of `Registry` objects whose `tags` set contains all the specified input tags.

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
    "_id": "ID",
    "resource": "ID",
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
