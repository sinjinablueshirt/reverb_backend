---
timestamp: 'Mon Oct 20 2025 12:21:13 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251020_122113.8db521b8.md]]'
content_id: b789d72fe4a9f6984d1d767f663e57977f7f123cd07c7d511ebe9d062878d952
---

# API Specification: UserAuthentication Concept

**Purpose:** to identify and authenticate users so that only legitimate users can access their own accounts.

***

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Creates and saves a new user, returning the identifier of the created user.

**Requirements:**

* A user with the same username doesn't already exist.

**Effects:**

* Creates and saves a new user.
* Returns the created user's identifier.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserAuthentication/login

**Description:** Authenticates a user with the provided username and password, returning the user's identifier if successful.

**Requirements:**

* A user exists that has a username and password that matches the passed in username and password.

**Effects:**

* Returns the user that has a username and password that matches the passed in username and password.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserAuthentication/deleteUser

**Description:** Deletes a user from the system based on their username and password.

**Requirements:**

* A user exists that has a username and password that matches the passed in username and password.

**Effects:**

* Deletes the user that has a username and password that matches the passed in username and password.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
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

### POST /api/UserAuthentication/changePassword

**Description:** Changes the password for an existing user after verifying their current credentials.

**Requirements:**

* A user exists that has a username and password that matches the passed in username and oldPassword.

**Effects:**

* Changes the user's password to newPassword.

**Request Body:**

```json
{
  "username": "string",
  "oldPassword": "string",
  "newPassword": "string"
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

### POST /api/UserAuthentication/getUserById

**Description:** Retrieves the username for a given user ID.

**Requirements:**

* A user with the given ID must exist.

**Effects:**

* Returns the username of the user with the given ID.

**Request Body:**

```json
{
  "id": "string"
}
```

**Success Response Body (Action):**

```json
{
  "username": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
