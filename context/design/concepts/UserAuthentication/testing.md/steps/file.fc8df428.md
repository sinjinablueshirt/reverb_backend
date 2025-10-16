---
timestamp: 'Thu Oct 16 2025 17:09:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_170952.67ef1173.md]]'
content_id: fc8df42826423cfb0ca011ff08ef8650542b0dd42d79a9f9ea4414bea47bb530
---

# file: src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts

```typescript
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts"; // Utility to get a clean database for testing
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";
import { Empty, ID } from "@utils/types.ts";

// Define consistent test data
const TEST_USERNAME = "john.doe";
const TEST_PASSWORD = "securePassword123";
const TEST_NEW_PASSWORD = "strongNewPassword456";

Deno.test("UserAuthenticationConcept", async (t) => {
  const [db, client] = await testDb();
  const concept = new UserAuthenticationConcept(db);

  await t.step(
    "Scenario 1: Operational Principle - Register and Login",
    async () => {
      console.log(
        "\n--- Scenario 1: Operational Principle - Register and Login ---",
      );

      // 1. Register a new user
      // Action: register(username: String, password: String): User
      // Requires: a user with the same username doesn't already exist (satisfied, db is clean)
      // Effects: creates and saves a new user. Returns the user
      console.log(
        `Attempting to register user: ${TEST_USERNAME} with password: ${TEST_PASSWORD}`,
      );
      const registerResult = await concept.register({
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
      });
      console.log("Register action output:", registerResult);

      assertEquals(
        typeof registerResult,
        "object",
        "Register result should be an object",
      );
      assertEquals(
        "user" in registerResult,
        true,
        "Register result should contain 'user'",
      );
      const userId = (registerResult as { user: ID }).user;
      assertEquals(typeof userId, "string", "User ID should be a string"); // Assuming ID is a string type
      console.log(
        `✅ Assertion: User '${TEST_USERNAME}' registered successfully with ID: ${userId}`,
      );

      // 2. Log in with the correct credentials
      // Action: login(username: String, password: String): User
      // Requires: a user exists that has a username and password that matches (satisfied by registration)
      // Effects: returns the user that has a username and password that matches
      console.log(
        `Attempting to log in user: ${TEST_USERNAME} with password: ${TEST_PASSWORD}`,
      );
      const loginResult = await concept.login({
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
      });
      console.log("Login action output:", loginResult);

      assertEquals(
        typeof loginResult,
        "object",
        "Login result should be an object",
      );
      assertEquals(
        "user" in loginResult,
        true,
        "Login result should contain 'user'",
      );
      assertEquals(
        (loginResult as { user: ID }).user,
        userId,
        "Logged in user ID should match registered user ID",
      );
      console.log(
        `✅ Assertion: User '${TEST_USERNAME}' logged in successfully with ID: ${
          (loginResult as { user: ID }).user
        }`,
      );
    },
  );

  await t.step(
    "Scenario 2: Failed Registration and Login Attempts",
    async () => {
      console.log(
        "\n--- Scenario 2: Failed Registration and Login Attempts ---",
      );

      const existingUsername = "existingUser";
      const existingPassword = "existingPass";

      // Pre-register a user for conflict testing
      console.log(`Pre-registering user: ${existingUsername}`);
      const initialRegisterResult = await concept.register({
        username: existingUsername,
        password: existingPassword,
      });
      assertEquals(
        "user" in initialRegisterResult,
        true,
        "Initial registration should succeed",
      );
      console.log(
        `✅ Pre-registration output: ${JSON.stringify(initialRegisterResult)}`,
      );

      // 1. Attempt to register a user with an already existing username
      // Action: register(username: String, password: String): User
      // Requires: a user with the same username doesn't already exist (NOT satisfied)
      // Effects: returns an error
      console.log(
        `Attempting to register user with existing username: ${existingUsername} (expected to fail)`,
      );
      const registerConflictResult = await concept.register({
        username: existingUsername,
        password: "someOtherPassword",
      });
      console.log("Register conflict action output:", registerConflictResult);
      assertEquals(
        "error" in registerConflictResult,
        true,
        "Register conflict should return an error",
      );
      assertEquals(
        (registerConflictResult as { error: string }).error,
        "A user with this username already exists.",
        "Error message for existing username mismatch",
      );
      console.log(
        `❌ Assertion: Registration with existing username correctly returned error: '${
          (registerConflictResult as { error: string }).error
        }'`,
      );

      // 2. Attempt to login with incorrect password for an existing user
      // Action: login(username: String, password: String): User
      // Requires: a user exists that has a username and password that matches (NOT satisfied)
      // Effects: returns an error
      console.log(
        `Attempting to log in user: ${existingUsername} with INCORRECT password (expected to fail)`,
      );
      const loginWrongPasswordResult = await concept.login({
        username: existingUsername,
        password: "wrong_password",
      });
      console.log(
        "Login with wrong password action output:",
        loginWrongPasswordResult,
      );
      assertEquals(
        "error" in loginWrongPasswordResult,
        true,
        "Login with wrong password should return an error",
      );
      assertEquals(
        (loginWrongPasswordResult as { error: string }).error,
        "Invalid username or password.",
        "Error message for incorrect password",
      );
      console.log(
        `❌ Assertion: Login with wrong password correctly returned error: '${
          (loginWrongPasswordResult as { error: string }).error
        }'`,
      );

      // 3. Attempt to login with a non-existent username
      // Action: login(username: String, password: String): User
      // Requires: a user exists that has a username and password that matches (NOT satisfied)
      // Effects: returns an error
      console.log(
        `Attempting to log in with NON-EXISTENT username: 'non_existent_user' (expected to fail)`,
      );
      const loginWrongUsernameResult = await concept.login({
        username: "non_existent_user",
        password: existingPassword,
      });
      console.log(
        "Login with non-existent username action output:",
        loginWrongUsernameResult,
      );
      assertEquals(
        "error" in loginWrongUsernameResult,
        true,
        "Login with wrong username should return an error",
      );
      assertEquals(
        (loginWrongUsernameResult as { error: string }).error,
        "Invalid username or password.",
        "Error message for non-existent username",
      );
      console.log(
        `❌ Assertion: Login with non-existent username correctly returned error: '${
          (loginWrongUsernameResult as { error: string }).error
        }'`,
      );
    },
  );

  await t.step("Scenario 3: Password Change Functionality", async () => {
    console.log("\n--- Scenario 3: Password Change Functionality ---");

    const userToChangePass = "chguser";
    const initialPass = "initial123";

    // 1. Register a user
    console.log(`Registering user for password change: ${userToChangePass}`);
    const registerResult = await concept.register({
      username: userToChangePass,
      password: initialPass,
    });
    assertEquals(
      "user" in registerResult,
      true,
      "User registration for password change should succeed",
    );
    const userId = (registerResult as { user: ID }).user;
    console.log(`✅ Registration output: ${JSON.stringify(registerResult)}`);

    // 2. Verify login with the initial password
    console.log(
      `Attempting to log in with initial password for ${userToChangePass}`,
    );
    const loginInitialPass = await concept.login({
      username: userToChangePass,
      password: initialPass,
    });
    console.log("Login with initial password output:", loginInitialPass);
    assertEquals(
      "user" in loginInitialPass,
      true,
      "Login with initial password should succeed",
    );
    assertEquals(
      (loginInitialPass as { user: ID }).user,
      userId,
      "Logged in user ID should match",
    );
    console.log(
      `✅ Assertion: User '${userToChangePass}' logged in successfully with initial password.`,
    );

    // 3. Change the user's password using correct old password
    // Action: changePassword(username: String, oldPassword: String, newPassword: String)
    // Requires: a user exists that has a username and password that matches username and oldPassword (satisfied)
    // Effects: changes the user's password to newPassword
    console.log(
      `Attempting to change password for ${userToChangePass} from '${initialPass}' to '${TEST_NEW_PASSWORD}'`,
    );
    const changePassResult = await concept.changePassword({
      username: userToChangePass,
      oldPassword: initialPass,
      newPassword: TEST_NEW_PASSWORD,
    });
    console.log("Change password action output:", changePassResult);
    assertEquals(
      typeof changePassResult,
      "object",
      "Change password result should be an object",
    );
    assertEquals(
      "error" in changePassResult,
      false,
      "Change password should not return an error",
    );
    assertEquals(
      changePassResult,
      {} as Empty,
      "Successful change password should return an empty object",
    );
    console.log(
      `✅ Assertion: Password for '${userToChangePass}' changed successfully.`,
    );

    // 4. Attempt to login with the old password (should now fail)
    console.log(
      `Attempting to log in with OLD password for ${userToChangePass} (expected to fail)`,
    );
    const loginOldPassAfterChange = await concept.login({
      username: userToChangePass,
      password: initialPass,
    });
    console.log(
      "Login with old password after change output:",
      loginOldPassAfterChange,
    );
    assertEquals(
      "error" in loginOldPassAfterChange,
      true,
      "Login with old password after change should fail",
    );
    assertEquals(
      (loginOldPassAfterChange as { error: string }).error,
      "Invalid username or password.",
      "Error message for old password login after change",
    );
    console.log(
      `❌ Assertion: Login with old password after change correctly returned error: '${
        (loginOldPassAfterChange as { error: string }).error
      }'`,
    );

    // 5. Login with the new password (should succeed)
    console.log(
      `Attempting to log in with NEW password for ${userToChangePass}`,
    );
    const loginNewPassAfterChange = await concept.login({
      username: userToChangePass,
      password: TEST_NEW_PASSWORD,
    });
    console.log(
      "Login with new password after change output:",
      loginNewPassAfterChange,
    );
    assertEquals(
      "user" in loginNewPassAfterChange,
      true,
      "Login with new password after change should succeed",
    );
    assertEquals(
      (loginNewPassAfterChange as { user: ID }).user,
      userId,
      "Logged in user ID should match",
    );
    console.log(
      `✅ Assertion: User '${userToChangePass}' logged in successfully with new password.`,
    );

    // 6. Attempt to change password with an incorrect old password
    // Action: changePassword(username: String, oldPassword: String, newPassword: String)
    // Requires: a user exists that has a username and password that matches username and oldPassword (NOT satisfied)
    // Effects: returns an error
    console.log(
      `Attempting to change password for ${userToChangePass} with INCORRECT old password (expected to fail)`,
    );
    const changePassWrongOldResult = await concept.changePassword({
      username: userToChangePass,
      oldPassword: "incorrect_old_pass",
      newPassword: "even_newer_pass",
    });
    console.log(
      "Change password with wrong old password output:",
      changePassWrongOldResult,
    );
    assertEquals(
      "error" in changePassWrongOldResult,
      true,
      "Change password with wrong old password should fail",
    );
    assertEquals(
      (changePassWrongOldResult as { error: string }).error,
      "Invalid username or old password.",
      "Error message for changing password with wrong old password",
    );
    console.log(
      `❌ Assertion: Change password with wrong old password correctly returned error: '${
        (changePassWrongOldResult as { error: string }).error
      }'`,
    );
  });

  await t.step("Scenario 4: User Deletion Functionality", async () => {
    console.log("\n--- Scenario 4: User Deletion Functionality ---");

    const userToDelete = "todelete";
    const deletePass = "delpass";

    // 1. Register a user for deletion
    console.log(`Registering user for deletion: ${userToDelete}`);
    const registerResult = await concept.register({
      username: userToDelete,
      password: deletePass,
    });
    assertEquals(
      "user" in registerResult,
      true,
      "User registration for deletion should succeed",
    );
    const userId = (registerResult as { user: ID }).user;
    console.log(`✅ Registration output: ${JSON.stringify(registerResult)}`);

    // 2. Confirm user exists by logging in
    console.log(`Attempting to log in user '${userToDelete}' before deletion`);
    const loginBeforeDelete = await concept.login({
      username: userToDelete,
      password: deletePass,
    });
    console.log("Login before deletion output:", loginBeforeDelete);
    assertEquals(
      "user" in loginBeforeDelete,
      true,
      "Login before deletion should succeed",
    );
    assertEquals(
      (loginBeforeDelete as { user: ID }).user,
      userId,
      "Logged in user ID should match",
    );
    console.log(
      `✅ Assertion: User '${userToDelete}' successfully logged in before deletion.`,
    );

    // 3. Delete the user with correct credentials
    // Action: deleteUser(username: String, password: String)
    // Requires: a user exists that has a username and password that matches (satisfied)
    // Effects: deletes the user
    console.log(
      `Attempting to delete user: ${userToDelete} with password: ${deletePass}`,
    );
    const deleteResult = await concept.deleteUser({
      username: userToDelete,
      password: deletePass,
    });
    console.log("Delete user action output:", deleteResult);
    assertEquals(
      typeof deleteResult,
      "object",
      "Delete user result should be an object",
    );
    assertEquals(
      "error" in deleteResult,
      false,
      "Delete user should not return an error",
    );
    assertEquals(
      deleteResult,
      {} as Empty,
      "Successful delete user should return an empty object",
    );
    console.log(`✅ Assertion: User '${userToDelete}' deleted successfully.`);

    // 4. Attempt to login with the deleted user's credentials (should fail)
    console.log(
      `Attempting to log in user '${userToDelete}' AFTER deletion (expected to fail)`,
    );
    const loginAfterDelete = await concept.login({
      username: userToDelete,
      password: deletePass,
    });
    console.log("Login after deletion output:", loginAfterDelete);
    assertEquals(
      "error" in loginAfterDelete,
      true,
      "Login after deletion should fail",
    );
    assertEquals(
      (loginAfterDelete as { error: string }).error,
      "Invalid username or password.",
      "Error message for login after deletion",
    );
    console.log(
      `❌ Assertion: Login after deletion correctly returned error: '${
        (loginAfterDelete as { error: string }).error
      }'`,
    );

    // 5. Attempt to delete a non-existent user
    // Action: deleteUser(username: String, password: String)
    // Requires: a user exists that has a username and password that matches (NOT satisfied)
    // Effects: returns an error
    console.log(
      `Attempting to delete NON-EXISTENT user: 'nonexistent' (expected to fail)`,
    );
    const deleteNonExistentResult = await concept.deleteUser({
      username: "nonexistent",
      password: "anypass",
    });
    console.log(
      "Delete non-existent user action output:",
      deleteNonExistentResult,
    );
    assertEquals(
      "error" in deleteNonExistentResult,
      true,
      "Delete non-existent user should fail",
    );
    assertEquals(
      (deleteNonExistentResult as { error: string }).error,
      "Invalid username or password, or user does not exist.",
      "Error message for deleting non-existent user",
    );
    console.log(
      `❌ Assertion: Deletion of non-existent user correctly returned error: '${
        (deleteNonExistentResult as { error: string }).error
      }'`,
    );

    // 6. Attempt to delete a user with incorrect password (even if username exists/existed)
    // Action: deleteUser(username: String, password: String)
    // Requires: a user exists that has a username and password that matches (NOT satisfied)
    // Effects: returns an error
    console.log(
      `Attempting to delete user '${userToDelete}' with INCORRECT password (expected to fail)`,
    );
    const deleteWrongPassResult = await concept.deleteUser({
      username: userToDelete, // username might match a record that was already deleted
      password: "wrongpass",
    });
    console.log(
      "Delete with wrong password action output:",
      deleteWrongPassResult,
    );
    assertEquals(
      "error" in deleteWrongPassResult,
      true,
      "Delete with wrong password should fail",
    );
    assertEquals(
      (deleteWrongPassResult as { error: string }).error,
      "Invalid username or password, or user does not exist.",
      "Error message for deleting with wrong password",
    );
    console.log(
      `❌ Assertion: Deletion with wrong password correctly returned error: '${
        (deleteWrongPassResult as { error: string }).error
      }'`,
    );
  });

  await t.step(
    "Scenario 5: Register, Delete, and Re-register the same user",
    async () => {
      console.log(
        "\n--- Scenario 5: Register, Delete, and Re-register the same user ---",
      );

      const userToReregister = "recycleduser";
      const firstPassword = "firstPass";
      const secondPassword = "secondPass";

      // 1. Register the user for the first time
      console.log(`Registering user '${userToReregister}' for the first time.`);
      const firstRegisterResult = await concept.register({
        username: userToReregister,
        password: firstPassword,
      });
      console.log("First registration output:", firstRegisterResult);
      assertEquals(
        "user" in firstRegisterResult,
        true,
        "First registration should succeed.",
      );
      const firstUserId = (firstRegisterResult as { user: ID }).user;
      console.log(
        `✅ Assertion: User '${userToReregister}' first registered with ID: ${firstUserId}`,
      );

      // 2. Login successfully with first credentials
      console.log(
        `Attempting to log in '${userToReregister}' with first password.`,
      );
      const firstLoginResult = await concept.login({
        username: userToReregister,
        password: firstPassword,
      });
      console.log("First login output:", firstLoginResult);
      assertEquals(
        "user" in firstLoginResult,
        true,
        "First login should succeed.",
      );
      assertEquals(
        (firstLoginResult as { user: ID }).user,
        firstUserId,
        "First logged in user ID should match.",
      );
      console.log(
        `✅ Assertion: User '${userToReregister}' successfully logged in with first password.`,
      );

      // 3. Delete the user
      console.log(`Attempting to delete user '${userToReregister}'.`);
      const deleteResult = await concept.deleteUser({
        username: userToReregister,
        password: firstPassword,
      });
      console.log("Deletion output:", deleteResult);
      assertEquals(
        "error" in deleteResult,
        false,
        "Deletion of the first registration should succeed.",
      );
      assertEquals(deleteResult, {} as Empty);
      console.log(
        `✅ Assertion: User '${userToReregister}' successfully deleted.`,
      );

      // 4. Attempt to login with the deleted user (should fail)
      console.log(
        `Attempting to log in '${userToReregister}' AFTER first deletion (expected to fail).`,
      );
      const loginAfterFirstDelete = await concept.login({
        username: userToReregister,
        password: firstPassword,
      });
      console.log("Login after first deletion output:", loginAfterFirstDelete);
      assertEquals(
        "error" in loginAfterFirstDelete,
        true,
        "Login after first delete should fail.",
      );
      console.log(
        `❌ Assertion: Login after first deletion correctly returned error.`,
      );

      // 5. Re-register the user with the same username but a new password
      // Requires: a user with the same username doesn't already exist (satisfied, as it was deleted)
      // Effects: creates and saves a new user. Returns the user
      console.log(
        `Attempting to RE-REGISTER user '${userToReregister}' with new password '${secondPassword}'.`,
      );
      const reregisterResult = await concept.register({
        username: userToReregister,
        password: secondPassword,
      });
      console.log("Re-registration output:", reregisterResult);
      assertEquals(
        "user" in reregisterResult,
        true,
        "Re-registration with same username should succeed.",
      );
      const reRegisteredUserId = (reregisterResult as { user: ID }).user;
      assertEquals(
        firstUserId !== reRegisteredUserId,
        true,
        "User ID should be different after re-registration (due to freshID()).",
      );
      console.log(
        `✅ Assertion: User '${userToReregister}' re-registered successfully with new ID: ${reRegisteredUserId}. New ID is different from old ID.`,
      );

      // 6. Login successfully with the re-registered user's new password
      console.log(
        `Attempting to log in '${userToReregister}' with new password AFTER re-registration.`,
      );
      const reregisterLoginResult = await concept.login({
        username: userToReregister,
        password: secondPassword,
      });
      console.log("Login after re-registration output:", reregisterLoginResult);
      assertEquals(
        "user" in reregisterLoginResult,
        true,
        "Login after re-registration should succeed.",
      );
      assertEquals(
        (reregisterLoginResult as { user: ID }).user,
        reRegisteredUserId,
        "Logged in user ID should match the re-registered user ID.",
      );
      console.log(
        `✅ Assertion: User '${userToReregister}' successfully logged in with new password after re-registration.`,
      );

      // 7. Attempt to login with the first password (should fail for the re-registered user)
      console.log(
        `Attempting to log in '${userToReregister}' with the FIRST password AFTER re-registration (expected to fail).`,
      );
      const oldPasswordLoginAttempt = await concept.login({
        username: userToReregister,
        password: firstPassword,
      });
      console.log(
        "Login with old password after re-registration output:",
        oldPasswordLoginAttempt,
      );
      assertEquals(
        "error" in oldPasswordLoginAttempt,
        true,
        "Login with the first password after re-registration should fail.",
      );
      console.log(
        `❌ Assertion: Login with first password after re-registration correctly returned error.`,
      );
    },
  );

  await client.close(); // Close the MongoDB client connection
});

```

<!-- # prompt: create tests that test all methods of the concept. Be sure to make tests that follow the operational principle of the concept specification. Tests should use a sequence of action executions that corresponds to the operational principle, representing the common expected usage of the concept. These sequence is not required to use all the actions; operational principles often do not include a deletion action, for example. Test sequences of action executions that correspond to less common cases: probing interesting corners of the functionality, undoing actions with deletions and cancellations, repeating actions with the same arguments, etc. In some of these scenarios actions may be expected to throw errors. You should have one test sequence for the operational principle, and 3-5 additional interesting scenarios. Every action should be executed successfully in at least one of the scenarios. -->

<!-- # prompt: add console.logs that display helpful messages to the console with action inputs and outputs so that a human reader can make sense of the test execution when it runs in the console -->
