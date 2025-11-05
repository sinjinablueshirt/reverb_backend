---
timestamp: 'Mon Nov 03 2025 21:37:52 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_213752.4c951287.md]]'
content_id: f845fd56db9c88785f59e357818ca3c4197ab2024760b45a861e4d0df09558d2
---

# API Specification: Sessioning Concept

**Purpose:** To maintain a user's logged-in state across multiple requests without re-sending credentials.

***

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session for a given user.

**Requirements:**

* true.

**Effects:**

* Creates a new Session `s`.
* Associates `s` with the given `user`.
* Returns `s` as `session`.

**Request Body:**

```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "session": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Sessioning/delete

**Description:** Deletes an existing session.

**Requirements:**

* The given `session` exists.

**Effects:**

* Removes the specified session.

**Request Body:**

```json
{
  "session": "ID"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "Session with id {session} not found"
}
```

***

### POST /api/Sessioning/\_getUser

**Description:** Retrieves the user associated with a given session.

**Requirements:**

* The given `session` exists.

**Effects:**

* Returns the user associated with the session.

**Request Body:**

```json
{
  "session": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "ID"
  }
]
```

**Error Response Body:**

```json
{
  "error": "Session with id {session} not found"
}
```

***
