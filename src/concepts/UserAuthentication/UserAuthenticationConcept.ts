import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts"; // Assuming @utils/database.ts provides freshID

// Declare collection prefix, use concept name
const PREFIX = "UserAuthentication" + ".";

// Generic types of this concept, User is an externally defined generic type
// In this context, it will be treated as an ID.
type User = ID;

/**
 * Interface for the User document stored in MongoDB.
 * Corresponds to "a set of Users with a username String and a password String"
 */
interface UserDocument {
  _id: User;
  username: string;
  password: string; // In a real app, passwords should be hashed and salted.
}

/**
 * @concept UserAuthentication
 * @purpose to identify and authenticate users so that only legitimate users can access their own accounts.
 */
export default class UserAuthenticationConcept {
  private users: Collection<UserDocument>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
  }

  /**
   * @action register
   * @requires a user with the same username doesn't already exist
   * @effects creates and saves a new user. Returns the user
   */
  async register(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    // Check precondition: a user with the same username doesn't already exist
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: "A user with this username already exists." };
    }

    // Effect: creates and saves a new user.
    const newUser: UserDocument = {
      _id: freshID(), // Generate a fresh ID for the new user
      username,
      password, // Store the password (in a real app, hash and salt it!)
    };

    await this.users.insertOne(newUser);

    // Effect: Returns the user
    return { user: newUser._id };
  }

  /**
   * @action login
   * @requires a user exists that has a username and password that matches the passed in username and password
   * @effects returns the user that has a username and password that matches the passed in username and password
   */
  async login(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    // Check precondition: a user exists that has a username and password that matches the passed in username and password
    const foundUser = await this.users.findOne({ username, password });

    if (!foundUser) {
      // If no user matches the credentials, return an error
      return { error: "Invalid username or password." };
    }

    // Effect: returns the user that has a username and password that matches
    return { user: foundUser._id };
  }

  /**
   * @action deleteUser
   * @requires a user exists that has a username and password that matches the passed in username and password
   * @effects deletes the user that has a username and password that matches the passed in username and password
   */
  async deleteUser(
    { username, password }: { username: string; password: string },
  ): Promise<Empty | { error: string }> {
    // Check precondition: a user exists that has a username and password that matches
    const result = await this.users.deleteOne({ username, password });

    if (result.deletedCount === 0) {
      // If no user was found/deleted, it means the precondition was not met
      return { error: "Invalid username or password, or user does not exist." };
    }

    // Effect: deletes the user. Return empty object on success.
    return {};
  }

  /**
   * @action changePassword
   * @requires a user exists that has a username and password that matches the passed in username and oldPassword
   * @effects changes the user's password to newPassword
   */
  async changePassword(
    { username, oldPassword, newPassword }: {
      username: string;
      oldPassword: string;
      newPassword: string;
    },
  ): Promise<Empty | { error: string }> {
    // Check precondition: a user exists that has a username and password that matches
    // the passed in username and oldPassword
    const result = await this.users.updateOne(
      { username, password: oldPassword },
      { $set: { password: newPassword } },
    );

    if (result.matchedCount === 0) {
      // If no user was found with the old credentials, the precondition was not met
      return { error: "Invalid username or old password." };
    }

    // Effect: changes the user's password to newPassword. Return empty object on success.
    return {};
  }
}
