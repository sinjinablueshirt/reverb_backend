---
timestamp: 'Sun Oct 12 2025 12:57:04 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_125704.e5209f15.md]]'
content_id: d291d336af81546127c9de45b77736a87a1c593d4e1fd0857231e35770d160be
---

# response:

```typescript
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import CommentConcept from "./CommentConcept.ts";
import { ID } from "@utils/types.ts";

// Utility for creating mock IDs
function mockId(prefix: string): ID {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

Deno.test("CommentConcept - Register Method Tests", async (test) => {
  const [db, client] = await testDb();
  const concept = new CommentConcept(db);

  const mockUser1: ID = mockId("user");
  const mockResource1: ID = mockId("resource");
  const mockResource2: ID = mockId("resource");

  await test.step(
    "1. Operational Principle: Successfully register a new resource",
    async () => {
      // Action: Register a new resource
      const result = await concept.register({
        resource: mockResource1,
        owner: mockUser1,
      });

      // Assertions
      assertEquals(result, {}); // Expect an empty object for success

      // Verify effect: resource is saved with an empty comments set
      const savedResource = await concept.resources.findOne({
        _id: mockResource1,
      });
      assertEquals(savedResource, {
        _id: mockResource1,
        comments: [],
      });
    },
  );

  await test.step(
    "2. Scenario: Attempt to register an already registered resource",
    async () => {
      // Precondition: mockResource1 is already registered from the previous test step
      // (This relies on sequential test execution within the same Deno.test block)
      // If tests were run in isolation, we would register it here again.
      // For clarity, let's ensure it's registered first.
      await concept.resources.deleteMany({}); // Clear for independent test block
      await concept.register({ resource: mockResource1, owner: mockUser1 });

      // Action: Attempt to register the same resource again
      const result = await concept.register({
        resource: mockResource1,
        owner: mockUser1,
      });

      // Assertion: Expect an error
      assertEquals(result, {
        error: `Resource '${mockResource1}' is already registered.`,
      });

      // Verify effect: The resource state remains unchanged, no new entry is created
      const count = await concept.resources.countDocuments({
        _id: mockResource1,
      });
      assertEquals(count, 1); // Should still be only one entry for this resource
      const savedResource = await concept.resources.findOne({
        _id: mockResource1,
      });
      assertEquals(savedResource?.comments, []); // Comments should still be empty
    },
  );

  await test.step(
    "3. Scenario: Register multiple distinct resources successfully",
    async () => {
      // Clear for independent test block
      await concept.resources.deleteMany({});

      // Action 1: Register first resource
      const result1 = await concept.register({
        resource: mockResource1,
        owner: mockUser1,
      });
      assertEquals(result1, {});

      // Action 2: Register second distinct resource
      const result2 = await concept.register({
        resource: mockResource2,
        owner: mockUser1,
      });
      assertEquals(result2, {});

      // Assertions: Verify both resources are saved
      const savedResource1 = await concept.resources.findOne({
        _id: mockResource1,
      });
      assertEquals(savedResource1, { _id: mockResource1, comments: [] });

      const savedResource2 = await concept.resources.findOne({
        _id: mockResource2,
      });
      assertEquals(savedResource2, { _id: mockResource2, comments: [] });

      // Verify total count
      const totalCount = await concept.resources.countDocuments();
      assertEquals(totalCount, 2);
    },
  );

  await client.close();
});
```
