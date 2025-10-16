---
timestamp: 'Thu Oct 16 2025 17:33:23 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_173323.6f1e5167.md]]'
content_id: ad1d3a2619b8f80d7ec1950feed8544c2b1ea8170c7647193269e43c9aa154df
---

# file: src/concepts/Comment/CommentConcept.test.ts

```typescript
import { assertEquals } from "jsr:@std/assert";
import { Db, MongoClient } from "npm:mongodb";
import { testDb } from "@utils/database.ts";
import CommentConcept from "./CommentConcept.ts";
import { freshID } from "@utils/database.ts";

Deno.test("CommentConcept: Register, AddComment, and RemoveComment functionality", async (test) => {
  let db: Db;
  let client: MongoClient;
  let concept: CommentConcept;

  // Define consistent IDs for resources and users to be used across tests for clarity
  const resourceA = freshID();
  const resourceB = freshID(); // For unregistered resource scenarios
  const user1 = freshID();
  const user2 = freshID();
  const user3 = freshID(); // For testing comment deletion by wrong user

  // # trace: Operational Principle: Register a resource and add multiple comments, then delete one.
  await test.step("1. Operational Principle: Register a resource, add multiple comments, and delete one", async () => {
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: register(resourceA)
    // Requires: resourceA isn't already registered (satisfied - first registration)
    // Effects: saves resourceA with an empty comments set
    const registerResult = await concept.register({ resource: resourceA });
    assertEquals(registerResult, {}, "Should successfully register resourceA");

    // Verify initial state: resourceA registered, comments empty
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      0,
      "Resource A should have 0 comments after registration",
    );

    // Action: addComment(resourceA, user1, "First comment!", date1)
    // Requires: resourceA is registered (satisfied)
    // Effects: creates comment1, adds comment1.id to resourceA.comments
    const date1 = new Date("2023-01-01T10:00:00Z");
    const addCommentResult1 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "First comment!",
      date: date1,
    });
    if ("error" in addCommentResult1) {
      throw new Error(
        `Failed to add first comment: ${addCommentResult1.error}`,
      );
    }
    const commentId1 = addCommentResult1.comment;
    assertEquals(
      typeof commentId1,
      "string",
      "Should return a valid ID for the first comment",
    );

    // Action: addComment(resourceA, user2, "Second comment.", date2)
    // Requires: resourceA is registered (satisfied)
    // Effects: creates comment2, adds comment2.id to resourceA.comments
    const date2 = new Date("2023-01-01T10:05:00Z");
    const addCommentResult2 = await concept.addComment({
      resource: resourceA,
      commenter: user2,
      text: "Second comment by another user.",
      date: date2,
    });
    if ("error" in addCommentResult2) {
      throw new Error(
        `Failed to add second comment: ${addCommentResult2.error}`,
      );
    }
    const commentId2 = addCommentResult2.comment;
    assertEquals(
      typeof commentId2,
      "string",
      "Should return a valid ID for the second comment",
    );
    assertEquals(
      commentId1 !== commentId2,
      true,
      "Comment IDs should be unique for different comments",
    );

    // Verify resourceA now has both comments associated
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      2,
      "Resource A should have 2 comments after adding two",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId1),
      true,
      "Resource A should contain commentId1",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId2),
      true,
      "Resource A should contain commentId2",
    );

    // Verify comments data
    const storedComment1 = await concept.comments.findOne({ _id: commentId1 });
    assertEquals(
      storedComment1?.text,
      "First comment!",
      "Comment 1 text should match",
    );
    assertEquals(
      storedComment1?.commenter,
      user1,
      "Comment 1 commenter should match",
    );
    assertEquals(
      storedComment1?.date.getTime(),
      date1.getTime(),
      "Comment 1 date should match",
    );

    const storedComment2 = await concept.comments.findOne({ _id: commentId2 });
    assertEquals(
      storedComment2?.text,
      "Second comment by another user.",
      "Comment 2 text should match",
    );
    assertEquals(
      storedComment2?.commenter,
      user2,
      "Comment 2 commenter should match",
    );
    assertEquals(
      storedComment2?.date.getTime(),
      date2.getTime(),
      "Comment 2 date should match",
    );

    // Action: removeComment(commentId1, user1)
    // Requires: commentId1 exists and user1 is its commenter (satisfied)
    // Effects: removes commentId1 from resourceA and deletes commentId1
    const removeCommentResult1 = await concept.removeComment({
      comment: commentId1,
      user: user1,
    });
    assertEquals(
      removeCommentResult1,
      {},
      "Should successfully remove commentId1 by its commenter",
    );

    // Verify state after deletion:
    // 1. commentId1 should no longer be in resourceA's comments array
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      1,
      "Resource A should have 1 comment after deleting one",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId1),
      false,
      "Resource A should NOT contain commentId1 after deletion",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId2),
      true,
      "Resource A should still contain commentId2 after commentId1 deletion",
    );

    // 2. commentId1 should be deleted from the comments collection
    const deletedComment1 = await concept.comments.findOne({ _id: commentId1 });
    assertEquals(deletedComment1, null, "Comment 1 should be deleted");

    // 3. commentId2 (the other comment) should still exist
    const stillExistingComment2 = await concept.comments.findOne({
      _id: commentId2,
    });
    assertEquals(
      stillExistingComment2?.text,
      "Second comment by another user.",
      "Comment 2 should still exist and its text should match",
    );

    await client.close();
  });

  // Scenario: Attempt to register an already registered resource
  await test.step("2. Scenario: Attempting to register an already registered resource", async () => {
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: register(resourceA) - First time
    await concept.register({ resource: resourceA });

    // Action: register(resourceA) - Second time
    // Requires: resourceA isn't already registered (not satisfied)
    // Expected: error
    const registerResult = await concept.register({ resource: resourceA });
    assertEquals(
      registerResult,
      { error: `Resource '${resourceA}' is already registered.` },
      "Should return an error when registering an already registered resource",
    );

    // Verify state remains unchanged (still 0 comments as none were added)
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      0,
      "Resource A comments should still be 0 after failed re-registration",
    );

    await client.close();
  });

  // Scenario: Attempt to add a comment to an unregistered resource
  await test.step("3. Scenario: Adding a comment to an unregistered resource", async () => {
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: addComment(resourceB, user1, "Comment on unregistered.", date)
    // Requires: resourceB is registered (not satisfied)
    // Expected: error
    const date = new Date();
    const addCommentResult = await concept.addComment({
      resource: resourceB, // resourceB is NOT registered
      commenter: user1,
      text: "This comment should not be added.",
      date: date,
    });

    assertEquals(
      addCommentResult,
      { error: `Resource '${resourceB}' is not registered.` },
      "Should return an error when attempting to add a comment to an unregistered resource",
    );

    // Verify no comment was created
    const commentsCount = await concept.comments.countDocuments();
    assertEquals(
      commentsCount,
      0,
      "No comment should have been created in the comments collection",
    );
    const storedResourceB = await concept.resources.findOne({ _id: resourceB });
    assertEquals(
      storedResourceB,
      null,
      "Resource B should not be present in the resources collection",
    );

    await client.close();
  });

  // Scenario: Add multiple comments from the same user to the same resource.
  // This demonstrates that multiple comments are distinct even if from the same user.
  await test.step("4. Scenario: Multiple comments from the same user on the same resource", async () => {
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: register(resourceA)
    await concept.register({ resource: resourceA });

    const date3 = new Date("2023-02-01T12:00:00Z");
    // Action: addComment(resourceA, user1, "First thought.", date3)
    const commentResult3 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "First thought.",
      date: date3,
    });
    if ("error" in commentResult3) throw new Error(commentResult3.error);
    const commentId3 = commentResult3.comment;

    const date4 = new Date("2023-02-01T12:15:00Z");
    // Action: addComment(resourceA, user1, "Second thought.", date4)
    const commentResult4 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "Second thought.",
      date: date4,
    });
    if ("error" in commentResult4) throw new Error(commentResult4.error);
    const commentId4 = commentResult4.comment;

    assertEquals(
      commentId3 !== commentId4,
      true,
      "Two comments by the same user should have distinct IDs",
    );

    // Verify resource A has both comments
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      2,
      "Resource A should have two comments from the same user",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId3),
      true,
      "Resource A should include commentId3",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId4),
      true,
      "Resource A should include commentId4",
    );

    const storedComment3 = await concept.comments.findOne({ _id: commentId3 });
    assertEquals(
      storedComment3?.commenter,
      user1,
      "Comment 3 commenter should be User 1",
    );
    assertEquals(
      storedComment3?.text,
      "First thought.",
      "Comment 3 text should match",
    );

    const storedComment4 = await concept.comments.findOne({ _id: commentId4 });
    assertEquals(
      storedComment4?.commenter,
      user1,
      "Comment 4 commenter should be User 1",
    );
    assertEquals(
      storedComment4?.text,
      "Second thought.",
      "Comment 4 text should match",
    );

    await client.close();
  });

  // Scenario: Adding comments with identical content (text, commenter, date) but expecting unique comments.
  await test.step("5. Scenario: Adding comments with identical content creates distinct entries", async () => {
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: register(resourceA)
    await concept.register({ resource: resourceA });

    const commonDate = new Date("2023-03-01T09:00:00Z");
    const commonText = "Duplicate message test";

    // Action: addComment(resourceA, user1, commonText, commonDate) - First time
    const commentResult5a = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: commonText,
      date: commonDate,
    });
    if ("error" in commentResult5a) throw new Error(commentResult5a.error);
    const commentId5a = commentResult5a.comment;

    // Action: addComment(resourceA, user1, commonText, commonDate) - Second time with identical data
    const commentResult5b = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: commonText,
      date: commonDate,
    });
    if ("error" in commentResult5b) throw new Error(commentResult5b.error);
    const commentId5b = commentResult5b.comment;

    // Verify that even with identical content, two distinct comment IDs are generated
    assertEquals(
      commentId5a !== commentId5b,
      true,
      "Identical comment content should still produce unique comment IDs",
    );

    // Verify resourceA has both comments
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      2,
      "Resource A should contain two comments",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId5a),
      true,
      "Resource A should include commentId5a",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId5b),
      true,
      "Resource A should include commentId5b",
    );

    // Verify content of both comments is as expected
    const storedComment5a = await concept.comments.findOne({
      _id: commentId5a,
    });
    assertEquals(
      storedComment5a?.text,
      commonText,
      "First identical comment text should match",
    );
    assertEquals(
      storedComment5a?.commenter,
      user1,
      "First identical comment commenter should match",
    );
    assertEquals(
      storedComment5a?.date.getTime(),
      commonDate.getTime(),
      "First identical comment date should match",
    );

    const storedComment5b = await concept.comments.findOne({
      _id: commentId5b,
    });
    assertEquals(
      storedComment5b?.text,
      commonText,
      "Second identical comment text should match",
    );
    assertEquals(
      storedComment5b?.commenter,
      user1,
      "Second identical comment commenter should match",
    );
    assertEquals(
      storedComment5b?.date.getTime(),
      commonDate.getTime(),
      "Second identical comment date should match",
    );

    await client.close();
  });

  // Scenario: `removeComment` precondition failures and successful removal
  await test.step("6. Scenario: removeComment precondition failures and successful removal", async () => {
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Setup: Register resource and add a comment that will be used for testing
    await concept.register({ resource: resourceA });
    const date = new Date("2023-04-01T11:00:00Z");
    const addResult = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "Comment for removal tests",
      date: date,
    });
    if ("error" in addResult) throw new Error(addResult.error);
    const commentIdToDelete = addResult.comment;

    // Precondition 1 failure: `comment` does not exist
    const nonExistentCommentId = freshID();
    const removeNonExistentResult = await concept.removeComment({
      comment: nonExistentCommentId,
      user: user1,
    });
    assertEquals(
      removeNonExistentResult,
      { error: `Comment '${nonExistentCommentId}' not found.` },
      "Should return an error when attempting to remove a non-existent comment",
    );

    // Verify existing comment is still there and linked
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      1,
      "Resource A should still have 1 comment after failed removal of non-existent",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentIdToDelete),
      true,
      "Resource A should still contain the original comment",
    );
    let storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    assertEquals(
      storedComment !== null,
      true,
      "Original comment should still exist",
    );

    // Precondition 2 failure: `user` is not its `commenter`
    const removeWrongUserResult = await concept.removeComment({
      comment: commentIdToDelete,
      user: user3, // user3 is not user1
    });
    assertEquals(
      removeWrongUserResult,
      {
        error:
          `User '${user3}' is not the commenter of comment '${commentIdToDelete}'.`,
      },
      "Should return an error when a different user attempts to remove a comment",
    );

    // Verify existing comment is still there and linked after wrong-user attempt
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      1,
      "Resource A should still have 1 comment after failed removal by wrong user",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentIdToDelete),
      true,
      "Resource A should still contain the original comment",
    );
    storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    assertEquals(
      storedComment !== null,
      true,
      "Original comment should still exist",
    );

    // Successful removal (using the correct user)
    const removeSuccessResult = await concept.removeComment({
      comment: commentIdToDelete,
      user: user1,
    });
    assertEquals(
      removeSuccessResult,
      {},
      "Should successfully remove the comment by its rightful commenter",
    );

    // Verify comment is truly gone from resource and comments collection
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      0,
      "Resource A should have 0 comments after successful removal",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentIdToDelete),
      false,
      "Resource A should no longer contain the removed comment",
    );
    storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    assertEquals(
      storedComment,
      null,
      "The comment document should be deleted from the comments collection",
    );

    await client.close();
  });
});

```
