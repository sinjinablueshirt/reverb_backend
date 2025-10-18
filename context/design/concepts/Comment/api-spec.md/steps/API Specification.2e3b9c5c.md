---
timestamp: 'Sat Oct 18 2025 11:16:34 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_111634.22467f33.md]]'
content_id: 2e3b9c5ca95a7b3375f7f052b9ec966f2a97ac29f1f1f98ac22d4e3b8630fd60
---

# API Specification: Comment Concept

**Purpose:** associate some text with another artifact (usually itself textual) that remarks on, augments or explains it

***

## API Endpoints

### POST /api/Comment/register

**Description:** Registers a new resource, allowing comments to be associated with it.

**Requirements:**

* the `resource` isn't already registered

**Effects:**

* saves the `resource` with an empty set `comments`

**Request Body:**

```json
{
  "resource": "string"
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

### POST /api/Comment/addComment

**Description:** Adds a new comment to a registered resource.

**Requirements:**

* the `resource` is registered

**Effects:**

* creates and saves a new `comment` made by `commenter` with `text` made at `date` under the `resource`. Returns the newly made `comment`

**Request Body:**

```json
{
  "resource": "string",
  "commenter": "string",
  "text": "string",
  "date": "string"
}
```

**Success Response Body (Action):**

```json
{
  "comment": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Comment/removeComment

**Description:** Removes an existing comment from a resource, provided the user is the original commenter.

**Requirements:**

* `comment` exists and `user` is its `commenter`

**Effects:**

* removes the `comment` from the `resource` it is bound to and deletes it

**Request Body:**

```json
{
  "comment": "string",
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
