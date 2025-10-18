---
timestamp: 'Sat Oct 18 2025 13:39:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_133920.f08d4b2c.md]]'
content_id: ecbc95655b2ab2cdd65a1bcc728ffd47fc4cc75af664073863a0d245f85f1fcd
---

# API Specification: Comment Concept

**Purpose:** associate some text with another artifact (usually itself textual) that remarks on, augments or explains it

***

## API Endpoints

### POST /api/Comment/register

**Description:** Registers a new resource in the system, enabling it to receive comments.

**Requirements:**

* The `resource` isn't already registered.

**Effects:**

* Saves the `resource` with an empty set of `comments`.

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

***

### POST /api/Comment/addComment

**Description:** Adds a new comment to a specified resource by a given user.

**Requirements:**

* The `resource` is registered.

**Effects:**

* Creates and saves a new `comment` made by `commenter` with the provided `text` at the specified `date` under the `resource`.
* Returns the `ID` of the newly created `comment`.

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

***

### POST /api/Comment/removeComment

**Description:** Removes an existing comment from the system, ensuring that the calling user is the original commenter.

**Requirements:**

* The `comment` exists.
* The `user` is the `commenter` of the specified `comment`.

**Effects:**

* Removes the `comment` from the `resource` it is bound to.
* Deletes the `comment` itself.

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

***

### POST /api/Comment/\_getCommentsByResource

**Description:** Retrieves all comments associated with a specific resource.

**Requirements:**

* The `resource` is registered.

**Effects:**

* Returns a list of all comments associated with the specified resource.

**Request Body:**

```json
{
  "resource": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "ID",
    "text": "string",
    "commenter": "ID",
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

### POST /api/Comment/\_getCommentById

**Description:** Retrieves a specific comment by its unique identifier.

**Requirements:**

* The `commentId` exists.

**Effects:**

* Returns the comment object if found, otherwise an empty array.

**Request Body:**

```json
{
  "commentId": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "ID",
    "text": "string",
    "commenter": "ID",
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
