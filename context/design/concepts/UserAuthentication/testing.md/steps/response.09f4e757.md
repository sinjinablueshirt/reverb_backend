---
timestamp: 'Sat Oct 11 2025 11:42:31 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_114231.0bc41718.md]]'
content_id: 09f4e7574803543bc219d03bdc87df2315414ea8cb5e2ba480edebdae6ee308e
---

# response:

```typescript
// file: src/UserAuthentication/UserAuthenticationConcept.ts
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "../../utils/types.ts"; // Adjust path as needed for your project structure
import { freshID } from "../../utils/database.ts"; // Adjust path as needed for your project structure

// Declare collection prefix, using the concept name for isolation
const PREFIX = "UserAuthentication" + ".";

/**
 * Interface representing a User document in the MongoDB collection.
 * Corresponds to the state: "a set of User with a username String and a password String".
 *
 * NOTE: In a real-world application, passwords should ALWAYS be hashed
 * (e.g., using bcrypt) before storage and never stored in plain text.
 * For the purpose of implementing the concept directly as specified, we
 * store it as a string, but this is a critical security vulnerability.
 */
interface UserDoc {
  _id: ID;
  username: string;
  password: string; // WARNING: Storing plain text password! Hash this in a real app.
}

/**
 * concept: UserAuthentication
 * purpose: to identify and authenticate users so that only legitimate users can access their own accounts.
 */
export default class UserAuthenticationConcept {
  private users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * action: register
   *
   * purpose: to identify and authenticate users so that only legitimate users can access their own accounts.
   * principle: once a user registers with a username and password, they can later log into the same user with the same username and password
   *
   * @param {string} username - The desired username for the new user.
   * @param {string} password - The password for the new user.
   *
   * @requires: A user with the same username doesn't already exist.
   * @effects: Creates and saves a new user. Returns the ID of the newly created user.
   * @returns {Promise<{ user: ID } | { error: string }>} An object containing the new user's ID on success,
   *                                                or an error message if the username is already taken.
   */
  async register({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ user: ID } | { error: string }> {
    // Precondition check: a user with the same username doesn't already exist
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: "A user with this username already exists." };
    }

    // Effect: Create and save a new user
    const newUser: UserDoc = {
      _id: freshID(), // Generate a new unique ID for the user
      username,
      password, // Again, hash this in a real application!
    };

    await this.users.insertOne(newUser);
    return { user: newUser._id };
  }

  /**
   * action: login
   *
   * purpose: to identify and authenticate users so that only legitimate users can access their own accounts.
   * principle: once a user registers with a username and password, they can later log into the same user with the same username and password
   *
   * @param {string} username - The username to log in with.
   * @param {string} password - The password for the given username.
   *
   * @requires: A user exists that has a username and password that matches the passed in username and password.
   * @effects: Returns the ID of the user that matches the provided credentials.
   * @returns {Promise<{ user: ID } | { error: string }>} An object containing the user's ID on successful login,
   *                                                or an error message for invalid credentials.
   */
  async login({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ user: ID } | { error: string }> {
    // Precondition check: a user exists that matches username and password
    const user = await this.users.findOne({ username, password });
    if (!user) {
      return { error: "Invalid username or password." };
    }
    // Effect: return the user's ID
    return { user: user._id };
  }

  /**
   * action: deleteUser
   *
   * @param {string} username - The username of the user to delete.
   * @param {string} password - The password of the user to delete (for verification).
   *
   * @requires: A user exists that has a username and password that matches the passed in username and password.
   * @effects: Deletes the user that has a username and password that matches the passed in username and password.
   * @returns {Promise<Empty | { error: string }>} An empty object on successful deletion,
   *                                             or an error message if the user is not found or credentials don't match.
   */
  async deleteUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<Empty | { error: string }> {
    // Precondition check: a user exists that matches username and password
    const result = await this.users.deleteOne({ username, password });

    if (result.deletedCount === 0) {
      return { error: "Invalid username or password, or user not found." };
    }
    // Effect: user deleted
    return {};
  }

  /**
   * action: changePassword
   *
   * @param {string} username - The username of the user whose password is to be changed.
   * @param {string} oldPassword - The current password of the user (for verification).
   * @param {string} newPassword - The new password for the user.
   *
   * @requires: A user exists that has a username and password that matches the passed in username and oldPassword.
   * @effects: Changes the user's password to newPassword.
   * @returns {Promise<Empty | { error: string }>} An empty object on successful password change,
   *                                             or an error message for invalid credentials.
   */
  async changePassword({
    username,
    oldPassword,
    newPassword,
  }: {
    username: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<Empty | { error: string }> {
    // Precondition check: a user exists that matches username and oldPassword
    const result = await this.users.updateOne(
      { username, password: oldPassword },
      { $set: { password: newPassword } },
    );

    if (result.matchedCount === 0) {
      return { error: "Invalid username or old password." };
    }
    // Effect: user's password changed.
    // Note: if `modifiedCount` is 0 but `matchedCount` is 1, it means the new password was the same.
    // The spec doesn't require an error for this, so we consider it a success.
    return {};
  }
}
```
