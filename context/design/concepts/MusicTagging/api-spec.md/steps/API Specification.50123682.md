---
timestamp: 'Tue Oct 21 2025 19:57:00 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_195700.cdb38e35.md]]'
content_id: 501236826be93a1c4894e17f6d89ead3ae8bea0e59ca950db9262a8d22124f37
---

# API Specification: MusicTagging Concept

**Purpose:** Aid in categorizing musical resources by suggesting relevant tags based on a description.

***

## API Endpoints

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
