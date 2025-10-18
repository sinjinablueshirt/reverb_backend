[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@code](../../../src/concepts/MusicTagging/MusicTaggingConcept.ts)

# prompt: create an api spec for the MusicTagging concept

# response:

# API Specification: MusicTagging Concept

**Purpose:** To manage the association of descriptive tags with music resources, optionally using AI for tag generation.

---

## API Endpoints

### POST /api/MusicTagging/registerResource

**Description:** Registers a new music resource in the concept's state, associating it with a description and initializing an empty set of tags.

**Requirements:**
- No `Registry` entry exists in the state for the given `resource`.

**Effects:**
- A new `Registry` entry is created in the concept's state with the given `resource`, `description`, and an empty set of `tags`. The identifier of the new `Registry` entry is returned.

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

---

### POST /api/MusicTagging/addTag

**Description:** Adds a new tag to the set of tags associated with a specified music resource registry.

**Requirements:**
- `registry` exists in the state and `tag` is not already present in `registry.tags`.

**Effects:**
- `tag` is added to the `tags` set of the specified `registry`.

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

---

### POST /api/MusicTagging/removeTag

**Description:** Removes an existing tag from the set of tags associated with a specified music resource registry.

**Requirements:**
- `registry` exists in the state and `tag` is present in `registry.tags`.

**Effects:**
- `tag` is removed from the `tags` set of the specified `registry`.

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

---

### POST /api/MusicTagging/deleteRegistry

**Description:** Deletes a specified music resource registry and all its associated data from the state.

**Requirements:**
- `registry` exists in the state.

**Effects:**
- The specified `registry` entry and all its associated data are removed from the state.

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

---

### POST /api/MusicTagging/suggestTags

**Description:** Uses a Language Model (LLM) to suggest and add relevant musical tags to a specified music resource registry based on its description.

**Requirements:**
- `registry` exists in the state.

**Effects:**
- Uses `llm` to create a set of tags that fit the `registry.description` in a musical context and adds them to `registry.tags`. Tags already present in `registry.tags` are not re-added.

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