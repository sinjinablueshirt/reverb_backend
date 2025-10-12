---
timestamp: 'Sat Oct 11 2025 21:53:21 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_215321.755a9948.md]]'
content_id: 5324c331f4b97289976338732fcbad0422f262c2b40ba03e22fce7df0be9b6bb
---

# response:

```typescript
// file: src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts

import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts"; // Utility to get a clean database for testing
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";
import { ID, Empty } from "@utils/types.ts";

// Define consistent test data
const TEST_USERNAME = "john.doe";
const TEST_PASSWORD = "securePassword123";
const TEST_NEW_PASSWORD = "strongNewPassword456";

Deno.test("UserAuthenticationConcept", async (t) => {
  const [db, client] = await testDb();
  const concept = new UserAuthenticationConcept(db);

  await t.step("Scenario 1: Operational Principle - Register and Login", async () => {
    // 1. Register a new user
    // Action: register(username: String, password: String): User
    // Requires: a user with the same username doesn't already exist (satisfied, db is clean)
    // Effects: creates and saves a new user. Returns the user
    const registerResult = await concept.register({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    assertEquals(typeof registerResult, "object", "Register result should be an object");
    assertEquals("user" in registerResult, true, "Register result should contain 'user'");
    const userId = (registerResult as { user: ID }).user;
    assertEquals(typeof userId, "string", "User ID should be a string"); // Assuming ID is a string type

    // 2. Log in with the correct credentials
    // Action: login(username: String, password: String): User
    // Requires: a user exists that has a username and password that matches (satisfied by registration)
    // Effects: returns the user that has a username and password that matches
    const loginResult = await concept.login({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    assertEquals(typeof loginResult, "object", "Login result should be an object");
    assertEquals("user" in loginResult, true, "Login result should contain 'user'");
    assertEquals((loginResult as { user: ID }).user, userId, "Logged in user ID should match registered user ID");
  });

  await t.step("Scenario 2: Failed Registration and Login Attempts", async () => {
    const existingUsername = "existingUser";
    const existingPassword = "existingPass";

    // Pre-register a user for conflict testing
    const initialRegisterResult = await concept.register({
      username: existingUsername,
      password: existingPassword,
    });
    assertEquals("user" in initialRegisterResult, true, "Initial registration should succeed");

    // 1. Attempt to register a user with an already existing username
    // Action: register(username: String, password: String): User
    // Requires: a user with the same username doesn't already exist (NOT satisfied)
    // Effects: returns an error
    const registerConflictResult = await concept.register({
      username: existingUsername,
      password: "someOtherPassword",
    });
    assertEquals("error" in registerConflictResult, true, "Register conflict should return an error");
    assertEquals(
      (registerConflictResult as { error: string }).error,
      "A user with this username already exists.",
      "Error message for existing username mismatch",
    );

    // 2. Attempt to login with incorrect password for an existing user
    // Action: login(username: String, password: String): User
    // Requires: a user exists that has a username and password that matches (NOT satisfied)
    // Effects: returns an error
    const loginWrongPasswordResult = await concept.login({
      username: existingUsername,
      password: "wrong_password",
    });
    assertEquals("error" in loginWrongPasswordResult, true, "Login with wrong password should return an error");
    assertEquals(
      (loginWrongPasswordResult as { error: string }).error,
      "Invalid username or password.",
      "Error message for incorrect password",
    );

    // 3. Attempt to login with a non-existent username
    // Action: login(username: String, password: String): User
    // Requires: a user exists that has a username and password that matches (NOT satisfied)
    // Effects: returns an error
    const loginWrongUsernameResult = await concept.login({
      username: "non_existent_user",
      password: existingPassword,
    });
    assertEquals("error" in loginWrongUsernameResult, true, "Login with wrong username should return an error");
    assertEquals(
      (loginWrongUsernameResult as { error: string }).error,
      "Invalid username or password.",
      "Error message for non-existent username",
    );
  });

  await t.step("Scenario 3: Password Change Functionality", async () => {
    const userToChangePass = "chguser";
    const initialPass = "initial123";

    // 1. Register a user
    const registerResult = await concept.register({
      username: userToChangePass,
      password: initialPass,
    });
    assertEquals("user" in registerResult, true, "User registration for password change should succeed");
    const userId = (registerResult as { user: ID }).user;

    // 2. Verify login with the initial password
    const loginInitialPass = await concept.login({
      username: userToChangePass,
      password: initialPass,
    });
    assertEquals("user" in loginInitialPass, true, "Login with initial password should succeed");
    assertEquals((loginInitialPass as { user: ID }).user, userId, "Logged in user ID should match");

    // 3. Change the user's password using correct old password
    // Action: changePassword(username: String, oldPassword: String, newPassword: String)
    // Requires: a user exists that has a username and password that matches username and oldPassword (satisfied)
    // Effects: changes the user's password to newPassword
    const changePassResult = await concept.changePassword({
      username: userToChangePass,
      oldPassword: initialPass,
      newPassword: TEST_NEW_PASSWORD,
    });
    assertEquals(typeof changePassResult, "object", "Change password result should be an object");
    assertEquals("error" in changePassResult, false, "Change password should not return an error");
    assertEquals(changePassResult, {} as Empty, "Successful change password should return an empty object");

    // 4. Attempt to login with the old password (should now fail)
    const loginOldPassAfterChange = await concept.login({
      username: userToChangePass,
      password: initialPass,
    });
    assertEquals("error" in loginOldPassAfterChange, true, "Login with old password after change should fail");
    assertEquals(
      (loginOldPassAfterChange as { error: string }).error,
      "Invalid username or password.",
      "Error message for old password login after change",
    );

    // 5. Login with the new password (should succeed)
    const loginNewPassAfterChange = await concept.login({
      username: userToChangePass,
      password: TEST_NEW_PASSWORD,
    });
    assertEquals("user" in loginNewPassAfterChange, true, "Login with new password after change should succeed");
    assertEquals((loginNewPassAfterChange as { user: ID }).user, userId, "Logged in user ID should match");

    // 6. Attempt to change password with an incorrect old password
    // Action: changePassword(username: String, oldPassword: String, newPassword: String)
    // Requires: a user exists that has a username and password that matches username and oldPassword (NOT satisfied)
    // Effects: returns an error
    const changePassWrongOldResult = await concept.changePassword({
      username: userToChangePass,
      oldPassword: "incorrect_old_pass",
      newPassword: "even_newer_pass",
    });
    assertEquals("error" in changePassWrongOldResult, true, "Change password with wrong old password should fail");
    assertEquals(
      (changePassWrongOldResult as { error: string }).error,
      "Invalid username or old password.",
      "Error message for changing password with wrong old password",
    );
  });

  await t.step("Scenario 4: User Deletion Functionality", async () => {
    const userToDelete = "todelete";
    const deletePass = "delpass";

    // 1. Register a user for deletion
    const registerResult = await concept.register({
      username: userToDelete,
      password: deletePass,
    });
    assertEquals("user" in registerResult, true, "User registration for deletion should succeed");
    const userId = (registerResult as { user: ID }).user;

    // 2. Confirm user exists by logging in
    const loginBeforeDelete = await concept.login({
      username: userToDelete,
      password: deletePass,
    });
    assertEquals("user" in loginBeforeDelete, true, "Login before deletion should succeed");
    assertEquals((loginBeforeDelete as { user: ID }).user, userId, "Logged in user ID should match");

    // 3. Delete the user with correct credentials
    // Action: deleteUser(username: String, password: String)
    // Requires: a user exists that has a username and password that matches (satisfied)
    // Effects: deletes the user
    const deleteResult = await concept.deleteUser({
      username: userToDelete,
      password: deletePass,
    });
    assertEquals(typeof deleteResult, "object", "Delete user result should be an object");
    assertEquals("error" in deleteResult, false, "Delete user should not return an error");
    assertEquals(deleteResult, {} as Empty, "Successful delete user should return an empty object");

    // 4. Attempt to login with the deleted user's credentials (should fail)
    const loginAfterDelete = await concept.login({
      username: userToDelete,
      password: deletePass,
    });
    assertEquals("error" in loginAfterDelete, true, "Login after deletion should fail");
    assertEquals(
      (loginAfterDelete as { error: string }).error,
      "Invalid username or password.",
      "Error message for login after deletion",
    );

    // 5. Attempt to delete a non-existent user
    // Action: deleteUser(username: String, password: String)
    // Requires: a user exists that has a username and password that matches (NOT satisfied)
    // Effects: returns an error
    const deleteNonExistentResult = await concept.deleteUser({
      username: "nonexistent",
      password: "anypass",
    });
    assertEquals("error" in deleteNonExistentResult, true, "Delete non-existent user should fail");
    assertEquals(
      (deleteNonExistentResult as { error: string }).error,
      "Invalid username or password, or user does not exist.",
      "Error message for deleting non-existent user",
    );

    // 6. Attempt to delete a user with incorrect password (even if username exists/existed)
    // Action: deleteUser(username: String, password: String)
    // Requires: a user exists that has a username and password that matches (NOT satisfied)
    // Effects: returns an error
    const deleteWrongPassResult = await concept.deleteUser({
      username: userToDelete, // username might match a record that was already deleted
      password: "wrongpass",
    });
    assertEquals("error" in deleteWrongPassResult, true, "Delete with wrong password should fail");
    assertEquals(
      (deleteWrongPassResult as { error: string }).error,
      "Invalid username or password, or user does not exist.",
      "Error message for deleting with wrong password",
    );
  });

  await t.step("Scenario 5: Register, Delete, and Re-register the same user", async () => {
    const userToReregister = "recycleduser";
    const firstPassword = "firstPass";
    const secondPassword = "secondPass";

    // 1. Register the user for the first time
    const firstRegisterResult = await concept.register({
      username: userToReregister,
      password: firstPassword,
    });
    assertEquals("user" in firstRegisterResult, true, "First registration should succeed.");
    const firstUserId = (firstRegisterResult as { user: ID }).user;

    // 2. Login successfully with first credentials
    const firstLoginResult = await concept.login({
      username: userToReregister,
      password: firstPassword,
    });
    assertEquals("user" in firstLoginResult, true, "First login should succeed.");
    assertEquals((firstLoginResult as { user: ID }).user, firstUserId, "First logged in user ID should match.");

    // 3. Delete the user
    const deleteResult = await concept.deleteUser({
      username: userToReregister,
      password: firstPassword,
    });
    assertEquals("error" in deleteResult, false, "Deletion of the first registration should succeed.");
    assertEquals(deleteResult, {} as Empty);

    // 4. Attempt to login with the deleted user (should fail)
    const loginAfterFirstDelete = await concept.login({
      username: userToReregister,
      password: firstPassword,
    });
    assertEquals("error" in loginAfterFirstDelete, true, "Login after first delete should fail.");

    // 5. Re-register the user with the same username but a new password
    // Requires: a user with the same username doesn't already exist (satisfied, as it was deleted)
    // Effects: creates and saves a new user. Returns the user
    const reregisterResult = await concept.register({
      username: userToReregister,
      password: secondPassword,
    });
    assertEquals("user" in reregisterResult, true, "Re-registration with same username should succeed.");
    const reRegisteredUserId = (reregisterResult as { user: ID }).user;
    assertEquals(
      firstUserId !== reRegisteredUserId,
      true,
      "User ID should be different after re-registration (due to freshID()).",
    );

    // 6. Login successfully with the re-registered user's new password
    const reregisterLoginResult = await concept.login({
      username: userToReregister,
      password: secondPassword,
    });
    assertEquals("user" in reregisterLoginResult, true, "Login after re-registration should succeed.");
    assertEquals(
      (reregisterLoginResult as { user: ID }).user,
      reRegisteredUserId,
      "Logged in user ID should match the re-registered user ID.",
    );

    // 7. Attempt to login with the first password (should fail for the re-registered user)
    const oldPasswordLoginAttempt = await concept.login({
      username: userToReregister,
      password: firstPassword,
    });
    assertEquals(
      "error" in oldPasswordLoginAttempt,
      true,
      "Login with the first password after re-registration should fail.",
    );
  });

  await client.close(); // Close the MongoDB client connection
});
```
