---
timestamp: 'Tue Oct 21 2025 19:25:42 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_192542.f9d1c8d9.md]]'
content_id: 421c1b8405de24290ff4d538d3e75b52a60cd4b8a90dc8b29ac2adbbdad0d341
---

# API Specification: Comment Concept

**Purpose:** associate some text with another artifact (usually itself textual) that remarks on, augments or explains it

***

## API Endpoints

### POST /api/Comment/register

**Description:** Registers a resource to allow comments to be associated with it.

**Requirements:**

* The `resource` isn't already registered.

**Effects:**

* Saves the `resource` with an empty set of `comments`.

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

**Description:** Creates and adds a new comment to a registered resource.

**Requirements:**

* The `resource` is registered.

**Effects:**

* Creates and saves a new comment made by `commenter` with `text` made at `date` under the `resource`.
* Returns the ID of the newly created `comment`.

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

**Description:** Removes a specific comment from its associated resource and deletes the comment itself.

**Requirements:**

* The `comment` exists.
* The `user` is its `commenter`.

**Effects:**

* Removes the `comment` from the `resource` it is bound to.
* Deletes the `comment` entry.

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

### POST /api/Comment/getCommentsByResource

**Description:** Retrieves all comments associated with a specific resource.

**Requirements:**

* The `resource` is registered.

**Effects:**

* Returns a list of all comments associated with the specified `resource`.

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
    "text": "string",
    "commenter": "string",
    "date": "string"
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

### POST /api/Comment/getCommentById

**Description:** Retrieves a single comment by its unique ID.

**Requirements:**

* (Implicit: The `commentId` might or might not exist; if not found, an empty array is returned.)

**Effects:**

* Returns the comment object if found.
* Returns an empty array if no comment with the given ID exists.

**Request Body:**

```json
{
  "commentId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string",
    "text": "string",
    "commenter": "string",
    "date": "string"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
