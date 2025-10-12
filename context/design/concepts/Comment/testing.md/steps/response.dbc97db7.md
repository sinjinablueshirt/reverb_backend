---
timestamp: 'Sun Oct 12 2025 17:10:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_171039.289765c4.md]]'
content_id: dbc97db7bbd703d341acfdc8e5c587eae0739b625e27f8cc45ea15edf5ceaf4f
---

# response:

```typescript
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import CommentConcept from "./CommentConcept.ts";
import { ID } from "@utils/types.ts";

// Mock IDs for testing
const RESOURCE_ALPHA = "resource-alpha" as ID;
const RESOURCE_BETA = "resource-beta" as ID;
const RESOURCE_GAMMA = "resource-gamma" as ID;
const USER_ALICE = "user-alice" as ID;
const USER_BOB = "user-bob" as ID;

// Renamed the main test block to reflect testing both methods
Deno.test("CommentConcept - Register and AddComment methods", async (t) => {
  const [db, client] = await testDb();
  const commentConcept = new CommentConcept(db);

  await t.step(
    "Scenario 1: Operational Principle - Successfully register a new resource and add multiple comments",
    async () => {
      // Action: register RESOURCE_ALPHA
      const registerResult = await commentConcept.register({
        resource: RESOURCE_ALPHA,
      });

      // Verification of initial registration effects:
      assertEquals(registerResult, {}, "Expected successful registration result.");
      const savedResourceAfterRegister = await commentConcept.resources.findOne({
        _id: RESOURCE_ALPHA,
      });
      assertEquals(savedResourceAfterRegister?.comments, [], "Comments array should be initialized as empty.");

      // Action: add first comment by Alice
      const date1 = new Date("2023-01-01T10:00:00Z");
      const addCommentResult1 = await commentConcept.addComment({
        resource: RESOURCE_ALPHA,
        commenter: USER_ALICE,
        text: "This is the first comment by Alice.",
        dateTime: date1,
      });
      if ("error" in addCommentResult1) {
        throw new Error(`Unexpected error: ${addCommentResult1.error}`);
      }
      const commentId1 = addCommentResult1.comment;

      // Verification of addComment effect 1:
      const savedComment1 = await commentConcept.comments.findOne({
        _id: commentId1,
      });
      assertEquals(savedComment1?.text, "This is the first comment by Alice.");
      assertEquals(savedComment1?.commenter, USER_ALICE);
      assertEquals(savedComment1?.dateTime, date1);

      const savedResourceAfterComment1 = await commentConcept.resources.findOne({
        _id: RESOURCE_ALPHA,
      });
      assertEquals(savedResourceAfterComment1?.comments, [commentId1], "Resource should contain first comment ID.");

      // Action: add second comment by Bob
      const date2 = new Date("2023-01-01T11:00:00Z");
      const addCommentResult2 = await commentConcept.addComment({
        resource: RESOURCE_ALPHA,
        commenter: USER_BOB,
        text: "Second thoughts on this resource by Bob.",
        dateTime: date2,
      });
      if ("error" in addCommentResult2) {
        throw new Error(`Unexpected error: ${addCommentResult2.error}`);
      }
      const commentId2 = addCommentResult2.comment;

      // Verification of addComment effect 2:
      const savedComment2 = await commentConcept.comments.findOne({
        _id: commentId2,
      });
      assertEquals(savedComment2?.text, "Second thoughts on this resource by Bob.");
      assertEquals(savedComment2?.commenter, USER_BOB);
      assertEquals(savedComment2?.dateTime, date2);

      const savedResourceAfterComment2 = await commentConcept.resources.findOne({
        _id: RESOURCE_ALPHA,
      });
      assertEquals(savedResourceAfterComment2?.comments, [commentId1, commentId2], "Resource should contain both comment IDs in order.");

      // Action: add third comment by Alice again
      const date3 = new Date("2023-01-01T12:00:00Z");
      const addCommentResult3 = await commentConcept.addComment({
        resource: RESOURCE_ALPHA,
        commenter: USER_ALICE,
        text: "Alice's follow-up comment.",
        dateTime: date3,
      });
      if ("error" in addCommentResult3) {
        throw new Error(`Unexpected error: ${addCommentResult3.error}`);
      }
      const commentId3 = addCommentResult3.comment;

      // Verification of addComment effect 3:
      const savedComment3 = await commentConcept.comments.findOne({
        _id: commentId3,
      });
      assertEquals(savedComment3?.text, "Alice's follow-up comment.");
      assertEquals(savedComment3?.commenter, USER_ALICE);
      assertEquals(savedComment3?.dateTime, date3);

      const savedResourceAfterComment3 = await commentConcept.resources.findOne({
        _id: RESOURCE_ALPHA,
      });
      assertEquals(savedResourceAfterComment3?.comments, [commentId1, commentId2, commentId3], "Resource should contain all three comment IDs in order.");
    },
  );

  await t.step(
    "Scenario 2: Attempt to register an already registered resource (violates 'requires' for register)",
    async () => {
      // Action 1: Register RESOURCE_BETA (to make it registered for this test context)
      await commentConcept.register({ resource: RESOURCE_BETA });
      const initialResource = await commentConcept.resources.findOne({
        _id: RESOURCE_BETA,
      });
      assertEquals(initialResource?._id, RESOURCE_BETA, "Resource should be initially registered.");
      assertEquals(initialResource?.comments, [], "Comments array should be empty after initial registration.");

      // Action 2: Attempt to register RESOURCE_BETA again
      const result = await commentConcept.register({ resource: RESOURCE_BETA });

      // Verification of effects:
      assertEquals(
        result,
        { error: `Resource '${RESOURCE_BETA}' is already registered.` },
        "Expected an error for re-registering the same resource.",
      );

      // State should not have changed: still one entry, comments array still empty.
      const allResources = await commentConcept.resources
        .find({ _id: RESOURCE_BETA })
        .toArray();
      assertEquals(allResources.length, 1, "Should only have one entry for the resource.");
      assertEquals(allResources[0]?.comments, [], "Comments array should still be empty.");
    },
  );

  await t.step(
    "Scenario 3: Register multiple distinct resources, add comments to them, and test addComment for an unregistered resource (failure case)",
    async () => {
      const RESOURCE_DELTA = "resource-delta" as ID; // Define local for this test
      const UNREGISTERED_RESOURCE = "unregistered-resource" as ID;

      // Actions: Register RESOURCE_GAMMA and RESOURCE_DELTA
      await commentConcept.register({ resource: RESOURCE_GAMMA });
      await commentConcept.register({ resource: RESOURCE_DELTA });

      // Verification of initial registration effects:
      const savedGammaInitial = await commentConcept.resources.findOne({ _id: RESOURCE_GAMMA });
      assertEquals(savedGammaInitial?.comments, [], "GAMMA comments should be empty initially.");
      const savedDeltaInitial = await commentConcept.resources.findOne({ _id: RESOURCE_DELTA });
      assertEquals(savedDeltaInitial?.comments, [], "DELTA comments should be empty initially.");

      // Action: Add comment to RESOURCE_GAMMA
      const dateGamma = new Date("2023-02-01T12:00:00Z");
      const addCommentResultGamma = await commentConcept.addComment({
        resource: RESOURCE_GAMMA,
        commenter: USER_ALICE,
        text: "Comment for Gamma.",
        dateTime: dateGamma,
      });
      if ("error" in addCommentResultGamma) {
        throw new Error(`Unexpected error: ${addCommentResultGamma.error}`);
      }
      const commentIdGamma = addCommentResultGamma.comment;

      // Action: Add comment to RESOURCE_DELTA
      const dateDelta = new Date("2023-02-02T13:00:00Z");
      const addCommentResultDelta = await commentConcept.addComment({
        resource: RESOURCE_DELTA,
        commenter: USER_BOB,
        text: "Feedback for Delta.",
        dateTime: dateDelta,
      });
      if ("error" in addCommentResultDelta) {
        throw new Error(`Unexpected error: ${addCommentResultDelta.error}`);
      }
      const commentIdDelta = addCommentResultDelta.comment;

      // Verification of effects (successful addComment to multiple resources):
      const savedGamma = await commentConcept.resources.findOne({
        _id: RESOURCE_GAMMA,
      });
      assertEquals(savedGamma?.comments, [commentIdGamma], "Resource GAMMA should have its comment.");

      const savedDelta = await commentConcept.resources.findOne({
        _id: RESOURCE_DELTA,
      });
      assertEquals(savedDelta?.comments, [commentIdDelta], "Resource DELTA should have its comment.");

      const commentGamma = await commentConcept.comments.findOne({ _id: commentIdGamma });
      assertEquals(commentGamma?.text, "Comment for Gamma.");
      assertEquals(commentGamma?.commenter, USER_ALICE);
      assertEquals(commentGamma?.dateTime, dateGamma);

      const commentDelta = await commentConcept.comments.findOne({ _id: commentIdDelta });
      assertEquals(commentDelta?.text, "Feedback for Delta.");
      assertEquals(commentDelta?.commenter, USER_BOB);
      assertEquals(commentDelta?.dateTime, dateDelta);

      // Test: Attempt to add a comment to an unregistered resource (violates 'requires' for addComment)
      await t.step(
        "Nested test: addComment to an unregistered resource should fail gracefully",
        async () => {
          const date = new Date("2023-03-01T14:00:00Z");

          // Precondition: UNREGISTERED_RESOURCE is not registered.
          const preCheck = await commentConcept.resources.findOne({ _id: UNREGISTERED_RESOURCE });
          assertEquals(preCheck, null, "Unregistered resource should not exist initially.");

          // Action: Attempt to add comment to UNREGISTERED_RESOURCE
          const result = await commentConcept.addComment({
            resource: UNREGISTERED_RESOURCE,
            commenter: USER_ALICE,
            text: "This comment should fail.",
            dateTime: date,
          });

          // Verification of effects:
          assertEquals(
            result,
            { error: `Resource '${UNREGISTERED_RESOURCE}' is not registered.` },
            "Expected an error for adding comment to an unregistered resource.",
          );

          // No new comment should have been created in the comments collection.
          const noComments = await commentConcept.comments.find({ text: "This comment should fail." }).toArray();
          assertEquals(noComments.length, 0, "No comment document should have been created.");

          // The resource should still not exist in the resources collection.
          const postCheck = await commentConcept.resources.findOne({ _id: UNREGISTERED_RESOURCE });
          assertEquals(postCheck, null, "Unregistered resource should still not exist.");
        },
      );
    },
  );

  await client.close();
});
```
