---
timestamp: 'Sat Oct 11 2025 21:46:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_214618.72f54239.md]]'
content_id: 2125cce65b841fad0e519cb509fb3d3f8f25956c9da89730cf6e731cc3ac03e5
---

# file: src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts

```typescript
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts"; // Assuming this utility exists
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";

Deno.test("UserAuthenticationConcept", async (t) => {
  let db: Awaited<ReturnType<typeof testDb>>[0];
  let client: Awaited<ReturnType<typeof testDb>>[1];
  let concept: UserAuthenticationConcept;

  Deno.test.beforeEach(async () => {
    [db, client] = await testDb();
    concept = new UserAuthenticationConcept(db);
  });

  Deno.test.afterEach(async () => {
    await client.close();
  });

  // --- Scenario 1: Operational Principle Test (Register -> Login) ---
  await t.step("should fulfill the operational principle (register and then login)", async () => {
    const username = "testuser_op";
    const password = "password123";

    // Action: register
    const registerResult = await concept.register({ username, password });
    if ("error" in registerResult) {
      throw new Error(`Registration failed: ${registerResult.error}`);
    }
    const registeredUserId = registerResult.user;

    // Verify effect: user is created and returned
    assertEquals(typeof registeredUserId, "string", "Registered user ID should be a string");

    // Action: login
    const loginResult = await concept.login({ username, password });

    // Verify effect: login is successful and returns the correct user ID
    if ("error" in loginResult) {
      throw new Error(`Login failed: ${loginResult.error}`);
    }
    const loggedInUserId = loginResult.user;

    assertEquals(loggedInUserId, registeredUserId, "Logged in user ID should match registered user ID");
  });

  // --- Scenario 2: Registration and Login Failures ---
  await t.step("should handle registration and login failures", async () => {
    const username = "failuser";
    const password = "password456";

    // Register a user successfully first to set up for failure cases
    const registerResult = await concept.register({ username, password });
    if ("error" in registerResult) {
      throw new Error(`Setup registration failed: ${registerResult.error}`);
    }

    // Test `requires` for register: a user with the same username doesn't already exist
    // Action: Try to register with the same username again
    const reRegisterResult = await concept.register({ username, password: "newpassword" });
    assertEquals("error" in reRegisterResult, true, "Should return an error for duplicate username");
    assertEquals(reRegisterResult.error, "A user with this username already exists.", "Error message should match");

    // Test `requires` for login: a user exists that has a username and password that matches
    // Action: Try to login with incorrect username
    const wrongUsernameLogin = await concept.login({ username: "nonexistent", password });
    assertEquals("error" in wrongUsernameLogin, true, "Should return an error for wrong username");
    assertEquals(wrongUsernameLogin.error, "Invalid username or password.", "Error message should match");

    // Action: Try to login with incorrect password
    const wrongPasswordLogin = await concept.login({ username, password: "wrongpassword" });
    assertEquals("error" in wrongPasswordLogin, true, "Should return an error for wrong password");
    assertEquals(wrongPasswordLogin.error, "Invalid username or password.", "Error message should match");
  });

  // --- Scenario 3: Change Password Functionality ---
  await t.step("should allow changing password and prevent login with old password", async () => {
    const username = "changeuser";
    const oldPassword = "oldpass";
    const newPassword = "newpass";

    // Action: Register a user
    const registerResult = await concept.register({ username, password: oldPassword });
    if ("error" in registerResult) {
      throw new Error(`Setup registration failed: ${registerResult.error}`);
    }
    const userId = registerResult.user;

    // Action: Log in with original password (should succeed)
    const loginOldPassResult = await concept.login({ username, password: oldPassword });
    assertEquals("user" in loginOldPassResult, true, "Should successfully log in with old password");
    assertEquals(loginOldPassResult.user, userId, "Logged in user ID should match");

    // Test `requires` for changePassword: user exists with username and oldPassword
    // Action: Try to change password with incorrect old password (should fail)
    const failedChangeResult = await concept.changePassword({ username, oldPassword: "wrongoldpass", newPassword });
    assertEquals("error" in failedChangeResult, true, "Should return an error for wrong old password");
    assertEquals(failedChangeResult.error, "Invalid username or old password.", "Error message should match");

    // Action: Change the user's password
    const changePassResult = await concept.changePassword({ username, oldPassword, newPassword });
    assertEquals("error" in changePassResult, false, "Password change should succeed");
    assertEquals(changePassResult, {}, "Successful password change should return empty object");

    // Action: Try to log in with the old password (should fail)
    const loginAfterChangeOldPass = await concept.login({ username, password: oldPassword });
    assertEquals("error" in loginAfterChangeOldPass, true, "Should fail to log in with old password after change");
    assertEquals(loginAfterChangeOldPass.error, "Invalid username or password.", "Error message should match");

    // Action: Log in with the new password (should succeed)
    const loginAfterChangeNewPass = await concept.login({ username, password: newPassword });
    assertEquals("user" in loginAfterChangeNewPass, true, "Should successfully log in with new password");
    assertEquals(loginAfterChangeNewPass.user, userId, "Logged in user ID should match after password change");
  });

  // --- Scenario 4: Delete User Functionality ---
  await t.step("should allow deleting a user and prevent further login", async () => {
    const username = "deleteuser";
    const password = "deletepass";

    // Action: Register a user
    const registerResult = await concept.register({ username, password });
    if ("error" in registerResult) {
      throw new Error(`Setup registration failed: ${registerResult.error}`);
    }
    const userId = registerResult.user;

    // Action: Log in (should succeed)
    const loginBeforeDelete = await concept.login({ username, password });
    assertEquals("user" in loginBeforeDelete, true, "Should successfully log in before deletion");
    assertEquals(loginBeforeDelete.user, userId, "Logged in user ID should match");

    // Test `requires` for deleteUser: user exists with username and password
    // Action: Try to delete a user with wrong credentials (should fail)
    const failedDeleteWrongPass = await concept.deleteUser({ username, password: "wrongpass" });
    assertEquals("error" in failedDeleteWrongPass, true, "Should return error for wrong password during delete");
    assertEquals(failedDeleteWrongPass.error, "Invalid username or password, or user does not exist.", "Error message should match");

    const failedDeleteWrongUser = await concept.deleteUser({ username: "nonexistent", password });
    assertEquals("error" in failedDeleteWrongUser, true, "Should return error for nonexistent username during delete");
    assertEquals(failedDeleteWrongUser.error, "Invalid username or password, or user does not exist.", "Error message should match");

    // Action: Delete the user
    const deleteResult = await concept.deleteUser({ username, password });
    assertEquals("error" in deleteResult, false, "User deletion should succeed");
    assertEquals(deleteResult, {}, "Successful deletion should return empty object");

    // Action: Try to log in with the deleted user's credentials (should fail)
    const loginAfterDelete = await concept.login({ username, password });
    assertEquals("error" in loginAfterDelete, true, "Should fail to log in after user is deleted");
    assertEquals(loginAfterDelete.error, "Invalid username or password.", "Error message should match");

    // Action: Try to delete the same user again (should fail as user no longer exists)
    const reDeleteResult = await concept.deleteUser({ username, password });
    assertEquals("error" in reDeleteResult, true, "Should return error for deleting already deleted user");
    assertEquals(reDeleteResult.error, "Invalid username or password, or user does not exist.", "Error message should match");
  });

  // --- Scenario 5: Repetitive Actions and Edge Cases ---
  await t.step("should handle repetitive actions and edge cases gracefully", async () => {
    const username = "repeatuser";
    const password = "repeatpass";
    const newPassword = "newrepeatpass";
    const superNewPassword = "supernewpass";

    // Register a user
    await concept.register({ username, password });

    // Attempt to register the same user again (should fail)
    const reRegisterResult = await concept.register({ username, password: "anotherpass" });
    assertEquals("error" in reRegisterResult, true, "Re-registration should fail");
    assertEquals(reRegisterResult.error, "A user with this username already exists.", "Error message should match");

    // Change password from 'repeatpass' to 'newrepeatpass'
    const firstChangeResult = await concept.changePassword({ username, oldPassword: password, newPassword });
    assertEquals("error" in firstChangeResult, false, "First password change should succeed");

    // Attempt to change password again, using 'newrepeatpass' as the current old password
    const secondChangeResult = await concept.changePassword({ username, oldPassword: newPassword, newPassword: superNewPassword });
    assertEquals("error" in secondChangeResult, false, "Second password change with new password as old should succeed");
    assertEquals(secondChangeResult, {}, "Successful password change should return empty object");

    // Verify login with the latest password
    const loginWithSuperNewPass = await concept.login({ username, password: superNewPassword });
    assertEquals("user" in loginWithSuperNewPass, true, "Should successfully log in with super new password");

    // Delete the user using the latest password
    const deleteResult = await concept.deleteUser({ username, password: superNewPassword });
    assertEquals("error" in deleteResult, false, "User deletion should succeed with latest password");
    assertEquals(deleteResult, {}, "Successful deletion should return empty object");

    // Attempt to delete the same user again (should fail)
    const reDeleteResult = await concept.deleteUser({ username, password: superNewPassword });
    assertEquals("error" in reDeleteResult, true, "Re-deletion should fail as user no longer exists");
    assertEquals(reDeleteResult.error, "Invalid username or password, or user does not exist.", "Error message should match");
  });
});
```
