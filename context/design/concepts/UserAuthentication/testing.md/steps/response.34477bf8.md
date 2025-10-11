---
timestamp: 'Sat Oct 11 2025 11:42:56 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_114256.3b0226fd.md]]'
content_id: 34477bf80385e370f089923826538b42936b930a2f9eccb63fb32b706081f86a
---

# response:

```typescript
// file: src/UserAuthentication/UserAuthenticationConcept.test.ts
import { Collection, Db, MongoClient } from "npm:mongodb";
import { assertEquals, assertExists, assertNotEquals, assertObjectMatch } from "jsr:@std/assert";
import { ID } from "../../utils/types.ts";
import { testDb } from "../../utils/database.ts"; // Adjust path as needed
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts"; // Path to the concept itself

Deno.test("UserAuthenticationConcept", async (t) => {
  let db: Db;
  let client: MongoClient;
  let concept: UserAuthenticationConcept;
  // This type is just for direct access for verification in tests;
  // the concept itself works with ID as a branded string.
  interface UserDocForTest {
    _id: ID;
    username: string;
    password: string;
  }
  let usersCollection: Collection<UserDocForTest>;

  // Setup for each test step to ensure a clean state
  Deno.test.beforeEach(async () => {
    [db, client] = await testDb(); // testDb already drops the database before giving a new connection
    concept = new UserAuthenticationConcept(db);
    // Directly access the collection to verify state changes, not through concept methods
    usersCollection = db.collection("UserAuthentication.users");
  });

  // Teardown for each test step
  Deno.test.afterEach(async () => {
    await client.close(); // Close the client connection after each test
  });

  await t.step("register: should register a new user successfully", async () => {
    const username = "testuser";
    const password = "password123";

    const result = await concept.register({ username, password });

    // Assert that a user ID is returned, not an error
    assertExists((result as { user: ID }).user, "Expected user ID to be returned on successful registration");
    const userId = (result as { user: ID }).user;
    assertNotEquals(userId, "", "User ID should not be empty");

    // Verify effects: user is stored in the database
    const storedUser = await usersCollection.findOne({ _id: userId });
    assertExists(storedUser, "User should be found in the database");
    assertEquals(storedUser.username, username, "Stored username should match");
    assertEquals(storedUser.password, password, "Stored password should match"); // WARNING: plain text for test, hash in real app
  });

  await t.step("register: should return an error if username already exists", async () => {
    const username = "existinguser";
    const password = "password123";

    // First successful registration
    const initialRegisterResult = await concept.register({ username, password });
    assertExists((initialRegisterResult as { user: ID }).user, "Initial registration should be successful");

    // Attempt to register again with the same username
    const duplicateRegisterResult = await concept.register({ username, password: "newpassword" });

    // Assert that an error is returned
    assertExists((duplicateRegisterResult as { error: string }).error, "Expected an error for duplicate username");
    assertEquals((duplicateRegisterResult as { error: string }).error, "A user with this username already exists.", "Error message should be specific");

    // Verify state: no new user was created
    const userCount = await usersCollection.countDocuments({ username });
    assertEquals(userCount, 1, "Only one user with the specified username should exist");
  });

  await t.step("login: should log in a user with correct credentials", async () => {
    const username = "loginuser";
    const password = "loginpass";

    // Register the user first
    const registerResult = await concept.register({ username, password });
    const registeredUserId = (registerResult as { user: ID }).user;
    assertExists(registeredUserId, "User should be registered successfully");

    // Attempt to log in
    const loginResult = await concept.login({ username, password });

    // Assert that the correct user ID is returned
    assertExists((loginResult as { user: ID }).user, "Expected user ID to be returned on successful login");
    assertEquals((loginResult as { user: ID }).user, registeredUserId, "Logged-in user ID should match registered user ID");
  });

  await t.step("login: should return an error for invalid username", async () => {
    const username = "nonexistent";
    const password = "anypass";

    // No user registered with this username
    const loginResult = await concept.login({ username, password });

    // Assert that an error is returned
    assertExists((loginResult as { error: string }).error, "Expected an error for invalid username");
    assertEquals((loginResult as { error: string }).error, "Invalid username or password.", "Error message should indicate invalid credentials");
  });

  await t.step("login: should return an error for incorrect password", async () => {
    const username = "wrongpassuser";
    const password = "correctpassword";

    // Register a user
    await concept.register({ username, password });

    // Attempt to log in with incorrect password
    const loginResult = await concept.login({ username, password: "wrongpassword" });

    // Assert that an error is returned
    assertExists((loginResult as { error: string }).error, "Expected an error for incorrect password");
    assertEquals((loginResult as { error: string }).error, "Invalid username or password.", "Error message should indicate invalid credentials");
  });

  await t.step("deleteUser: should delete a user successfully", async () => {
    const username = "todelete";
    const password = "delpass";

    // Register the user
    const registerResult = await concept.register({ username, password });
    const userId = (registerResult as { user: ID }).user;
    assertExists(userId, "User should be registered successfully");

    // Verify user exists before deletion
    assertExists(await usersCollection.findOne({ _id: userId }), "User should exist before deletion");

    // Attempt to delete the user
    const deleteResult = await concept.deleteUser({ username, password });

    // Assert successful deletion (empty object)
    assertObjectMatch(deleteResult, {}, "Expected empty object on successful deletion");

    // Verify effects: user is removed from the database
    const deletedUser = await usersCollection.findOne({ _id: userId });
    assertEquals(deletedUser, null, "User should be deleted from the database");
  });

  await t.step("deleteUser: should return an error for incorrect credentials during deletion", async () => {
    const username = "delauthuser";
    const password = "delauthpass";

    // Register a user
    await concept.register({ username, password });

    // Attempt to delete with incorrect password
    const deleteResult = await concept.deleteUser({ username, password: "wrongpassword" });

    // Assert error is returned
    assertExists((deleteResult as { error: string }).error, "Expected an error for incorrect credentials");
    assertEquals((deleteResult as { error: string }).error, "Invalid username or password, or user not found.", "Error message should be specific");

    // Verify state: user should still exist
    const userStillExists = await usersCollection.findOne({ username });
    assertExists(userStillExists, "User should still exist after failed deletion attempt");
  });

  await t.step("changePassword: should change a user's password successfully", async () => {
    const username = "changeuser";
    const oldPassword = "oldpass";
    const newPassword = "newpass";

    // Register the user
    await concept.register({ username, password: oldPassword });
    const initialUser = await usersCollection.findOne({ username });
    assertExists(initialUser, "User should exist for password change");
    assertEquals(initialUser.password, oldPassword, "Initial password should be correct");

    // Attempt to change password
    const changeResult = await concept.changePassword({ username, oldPassword, newPassword });

    // Assert successful change (empty object)
    assertObjectMatch(changeResult, {}, "Expected empty object on successful password change");

    // Verify effects: password is updated in the database
    const updatedUser = await usersCollection.findOne({ username });
    assertExists(updatedUser, "User should still exist after password change");
    assertEquals(updatedUser.password, newPassword, "Password should be updated to new password");
    assertNotEquals(updatedUser.password, oldPassword, "Password should no longer be the old password");

    // Verify old password no longer works for login
    const loginWithOldPass = await concept.login({ username, password: oldPassword });
    assertExists((loginWithOldPass as { error: string }).error, "Login with old password should fail");

    // Verify new password works for login
    const loginWithNewPass = await concept.login({ username, password: newPassword });
    assertExists((loginWithNewPass as { user: ID }).user, "Login with new password should succeed");
  });

  await t.step("changePassword: should return an error for incorrect old password", async () => {
    const username = "changerruser";
    const correctPassword = "correctpass";
    const wrongPassword = "wrongpass";
    const newPassword = "supernewpass";

    // Register the user
    await concept.register({ username, password: correctPassword });

    // Attempt to change password with incorrect old password
    const changeResult = await concept.changePassword({ username, oldPassword: wrongPassword, newPassword });

    // Assert error is returned
    assertExists((changeResult as { error: string }).error, "Expected an error for incorrect old password");
    assertEquals((changeResult as { error: string }).error, "Invalid username or old password.", "Error message should be specific");

    // Verify state: password should not have changed
    const userAfterAttempt = await usersCollection.findOne({ username });
    assertExists(userAfterAttempt, "User should still exist");
    assertEquals(userAfterAttempt.password, correctPassword, "Password should remain unchanged");
  });

  await t.step("changePassword: should succeed even if new password is same as old password", async () => {
    const username = "samepassuser";
    const password = "samepassword";

    // Register the user
    await concept.register({ username, password });

    // Attempt to change password to the exact same password
    const changeResult = await concept.changePassword({ username, oldPassword: password, newPassword: password });

    // Assert successful change (empty object)
    assertObjectMatch(changeResult, {}, "Expected empty object on changing to same password");

    // Verify effects: password in DB should still be the same (no change if `modifiedCount` is 0 but `matchedCount` is 1)
    const updatedUser = await usersCollection.findOne({ username });
    assertExists(updatedUser, "User should still exist");
    assertEquals(updatedUser.password, password, "Password should remain the same");

    // Verify login still works
    const loginResult = await concept.login({ username, password });
    assertExists((loginResult as { user: ID }).user, "Login should still succeed");
  });

  await t.step("trace: fulfills the principle of registering and logging in", async () => {
    // principle: once a user registers with a username and password, they can later log into the same user with the same username and password
    const username = "principleuser";
    const password = "principlepassword";

    // Action 1: Register the user
    const registerResult = await concept.register({ username, password });
    const registeredUserId = (registerResult as { user: ID }).user;
    assertExists(registeredUserId, "Step 1: User should be registered successfully");

    // Verify internal state after registration
    const userInDbAfterRegister = await usersCollection.findOne({ _id: registeredUserId });
    assertExists(userInDbAfterRegister, "Step 1: User should be stored in DB after registration");
    assertEquals(userInDbAfterRegister.username, username, "Step 1: Stored username matches");
    assertEquals(userInDbAfterRegister.password, password, "Step 1: Stored password matches");

    // Action 2: Log into the user with the same username and password
    const loginResult = await concept.login({ username, password });
    const loggedInUserId = (loginResult as { user: ID }).user;
    assertExists(loggedInUserId, "Step 2: Expected user ID to be returned on successful login");

    // Verify that the logged-in user is the same as the registered user
    assertEquals(loggedInUserId, registeredUserId, "Step 2: Logged-in user ID should match the registered user ID");

    console.log(`Trace: User '${username}' (ID: ${registeredUserId}) successfully registered and logged in.`);
  });
});

```
