[@api-extraction-from-code](../../tools/api-extraction-from-code.md)

[@code](../../../src/concepts/UserAuthentication/UserAuthenticationConcept.ts)

# prompt: create an api spec for the UserAuthentication concept

# response:

# API Specification: UserAuthentication Concept

**Purpose:** to identify and authenticate users so that only legitimate users can access their own accounts.

---

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** creates and saves a new user. Returns the user.

**Requirements:**
- a user with the same username doesn't already exist

**Effects:**
- creates and saves a new user. Returns the user

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
---

### POST /api/UserAuthentication/login

**Description:** returns the user that has a username and password that matches the passed in username and password.

**Requirements:**
- a user exists that has a username and password that matches the passed in username and password

**Effects:**
- returns the user that has a username and password that matches the passed in username and password

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
---

### POST /api/UserAuthentication/deleteUser

**Description:** deletes the user that has a username and password that matches the passed in username and password.

**Requirements:**
- a user exists that has a username and password that matches the passed in username and password

**Effects:**
- deletes the user that has a username and password that matches the passed in username and password

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
---

### POST /api/UserAuthentication/changePassword

**Description:** changes the user's password to newPassword.

**Requirements:**
- a user exists that has a username and password that matches the passed in username and oldPassword

**Effects:**
- changes the user's password to newPassword

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
---