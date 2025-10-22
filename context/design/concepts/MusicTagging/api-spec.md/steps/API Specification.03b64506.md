---
timestamp: 'Tue Oct 21 2025 19:44:50 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_194450.1db87101.md]]'
content_id: 03b64506793f72646423602843b06c49609a9ecb7d34fe1145162010a0740244
---

# API Specification: MusicTagging Concept

**Purpose:** Manage musical resources by associating them with descriptions and automatically suggested or manually added tags, enabling search and organization.

***

## API Endpoints

### POST /api/MusicTagging/suggestTags

**Description:** Uses an external LLM to create a set of tags that fit a given description in a musical context, returning these suggested tags.

**Requirements:**

* `description` is not empty.

**Effects:**

* Uses `llm` to create a set of tags that fit the `description` in a musical context and returns this set.
* Tags already present in `existingTags` are not suggested.

**Request Body:**

```json
{
  "description": "string",
  "existingTags": ["string"],
  "llm": "object"
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
