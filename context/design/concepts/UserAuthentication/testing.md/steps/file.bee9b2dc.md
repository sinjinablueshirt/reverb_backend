---
timestamp: 'Sat Oct 11 2025 09:38:57 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_093857.c2458554.md]]'
content_id: bee9b2dc419833667b4d4c8decfa8f2b61e25d420e40a1b72410bf948025e107
---

# file: src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts

```typescript
import { assertEquals, assertNotEquals, assertObjectMatch } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";
import { ID } from "../../utils/types.ts"; // Assuming relative path for demonstration
import { MongoClient } from "npm:mongodb"; // Explicitly import MongoClient for type hint

Deno.test("UserAuthenticationConcept", async (t) => {
  let db: Deno.Kv | undefined; // Using Deno.Kv type for consistency with common usage, though it's MongoDB Db in practice
  let client: MongoClient | undefined;
  let authConcept: UserAuthenticationConcept;

  Deno.test.beforeEach(async () => {
    // testDb returns [Db, MongoClient] but we need to handle the Deno.Kv type if it were a Kv store
    // For MongoDB, it's actually [Db, MongoClient]
    const dbAndClient = await testDb();
    db = dbAndClient[0];
    client = dbAndClient[1];
    authConcept = new UserAuthenticationConcept(db as any); // Type assertion for Db as it's a mock or specific implementation
  });

  Deno.test.afterEach(async () => {
    if (client) {
      await client.close();
    }
  });

  await t.step("Principle: Register and then Login", async () => {
    // Trace:
    // 1. User registers with "alice" and "password123"
    // 2. User logs in with "alice" and "password123"
    // 3. Login is successful, returning Alice's user ID

    // 1. Register a user
    const registerResult = await authConcept.register({
      username: "alice",
      password: "password123",
    });
    assertObjectMatch(registerResult, { user: "user:" }); // Check if it returned a user ID (starts with "user:")
    const aliceId = (registerResult as { user: ID }).user;
    assertNotEquals(aliceId, undefined);

    // 2. Login with the registered user's credentials
    const loginResult = await authConcept.login({
      username: "alice",
      password: "password123",
    });

    // 3. Login is successful, returning Alice's user ID
    assertObjectMatch(loginResult, { user: aliceId });
    assertEquals((loginResult as { user: ID }).user, aliceId);
  });

  await t.step("Action: register - success", async () => {
    const registerResult = await authConcept.register({
      username: "bob",
      password: "bob_pass",
    });
    assertObjectMatch(registerResult, { user: "user:" });
    const bobId = (registerResult as { user: ID }).user;
    assertNotEquals(bobId, undefined);

    // Verify user exists by trying to log in
    const loginResult = await authConcept.login({
      username: "bob",
      password: "bob_pass",
    });
    assertObjectMatch(loginResult, { user: bobId });
  });

  await t.step("Action: register - username already exists (requires)", async () => {
    await authConcept.register({ username: "charlie", password: "pass" });
    const registerResult = await authConcept.register({
      username: "charlie",
      password: "another_pass",
    });
    assertObjectMatch(registerResult, {
      error: "Username 'charlie' already exists.",
    });
  });

  await t.step("Action: login - success", async () => {
    const { user: davidId } = (await authConcept.register({
      username: "david",
      password: "david_pass",
    })) as { user: ID };

    const loginResult = await authConcept.login({
      username: "david",
      password: "david_pass",
    });
    assertObjectMatch(loginResult, { user: davidId });
  });

  await t.step("Action: login - invalid username (requires)", async () => {
    await authConcept.register({ username: "eve", password: "eve_pass" });
    const loginResult = await authConcept.login({
      username: "nonexistent",
      password: "eve_pass",
    });
    assertObjectMatch(loginResult, { error: "Invalid username or password." });
  });

  await t.step("Action: login - invalid password (requires)", async () => {
    await authConcept.register({ username: "frank", password: "frank_pass" });
    const loginResult = await authConcept.login({
      username: "frank",
      password: "wrong_pass",
    });
    assertObjectMatch(loginResult, { error: "Invalid username or password." });
  });

  await t.step("Action: deleteUser - success", async () => {
    const { user: graceId } = (await authConcept.register({
      username: "grace",
      password: "grace_pass",
    })) as { user: ID };

    const deleteResult = await authConcept.deleteUser({
      username: "grace",
      password: "grace_pass",
    });
    assertEquals(deleteResult, {}); // Empty object for success

    // Verify deletion by trying to log in
    const loginAfterDelete = await authConcept.login({
      username: "grace",
      password: "grace_pass",
    });
    assertObjectMatch(loginAfterDelete, {
      error: "Invalid username or password.",
    });
  });

  await t.step("Action: deleteUser - invalid credentials (requires)", async () => {
    await authConcept.register({ username: "helen", password: "helen_pass" });
    const deleteResult = await authConcept.deleteUser({
      username: "helen",
      password: "wrong_pass",
    });
    assertObjectMatch(deleteResult, { error: "Invalid username or password." });

    // Ensure user still exists
    const loginResult = await authConcept.login({
      username: "helen",
      password: "helen_pass",
    });
    assertObjectMatch(loginResult, { user: "user:" });
  });

  await t.step("Action: changePassword - success", async () => {
    const { user: ivanId } = (await authConcept.register({
      username: "ivan",
      password: "ivan_old_pass",
    })) as { user: ID };

    const changePassResult = await authConcept.changePassword({
      username: "ivan",
      oldPassword: "ivan_old_pass",
      newPassword: "ivan_new_pass",
    });
    assertEquals(changePassResult, {});

    // Verify login with new password
    const loginNewPass = await authConcept.login({
      username: "ivan",
      password: "ivan_new_pass",
    });
    assertObjectMatch(loginNewPass, { user: ivanId });

    // Verify login with old password fails
    const loginOldPass = await authConcept.login({
      username: "ivan",
      password: "ivan_old_pass",
    });
    assertObjectMatch(loginOldPass, { error: "Invalid username or password." });
  });

  await t.step("Action: changePassword - invalid old password (requires)", async () => {
    await authConcept.register({ username: "june", password: "june_pass" });
    const changePassResult = await authConcept.changePassword({
      username: "june",
      oldPassword: "wrong_old_pass",
      newPassword: "june_new_pass",
    });
    assertObjectMatch(changePassResult, {
      error: "Invalid username or old password.",
    });

    // Ensure password was not changed
    const loginResult = await authConcept.login({
      username: "june",
      password: "june_pass",
    });
    assertObjectMatch(loginResult, { user: "user:" });
  });
});
```
