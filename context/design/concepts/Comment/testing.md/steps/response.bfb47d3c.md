---
timestamp: 'Thu Oct 16 2025 17:36:04 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_173604.76dd232a.md]]'
content_id: bfb47d3cf07219a553eb661523c6fb1627ecf8a8312a0b0bb1fac9f2848b096f
---

# response:

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

  console.log(`\n--- Test Suite Start: CommentConcept ---`);
  console.log(`  Resource A ID: ${resourceA}`);
  console.log(`  Resource B ID: ${resourceB} (unregistered)`);
  console.log(`  User 1 ID: ${user1}`);
  console.log(`  User 2 ID: ${user2}`);
  console.log(`  User 3 ID: ${user3}\n`);

  // # trace: Operational Principle: Register a resource and add multiple comments, then delete one.
  await test.step("1. Operational Principle: Register a resource, add multiple comments, and delete one", async () => {
    console.log(`\n--- Step 1: Operational Principle Test ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    console.log(`  Action: register(resource: ${resourceA})`);
    // Action: register(resourceA)
    // Requires: resourceA isn't already registered (satisfied - first registration)
    // Effects: saves resourceA with an empty comments set
    const registerResult = await concept.register({ resource: resourceA });
    assertEquals(registerResult, {}, "Should successfully register resourceA");
    console.log(`  Output: Registration result for ${resourceA}: ${
      JSON.stringify(registerResult)
    }`);

    // Verify initial state: resourceA registered, comments empty
    console.log(`  Verification: Checking initial state of resource ${resourceA}`);
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      0,
      "Resource A should have 0 comments after registration",
    );
    console.log(
      `  State: Resource ${resourceA} has ${storedResourceA?.comments.length} comments (expected 0).`,
    );

    console.log(`  Action: addComment(resource: ${resourceA}, commenter: ${user1}, text: "First comment!", date: 2023-01-01)`);
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
    console.log(
      `  Output: First comment added. Comment ID: ${commentId1}. Result: ${
        JSON.stringify(addCommentResult1)
      }`,
    );

    console.log(`  Action: addComment(resource: ${resourceA}, commenter: ${user2}, text: "Second comment.", date: 2023-01-01)`);
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
    console.log(
      `  Output: Second comment added. Comment ID: ${commentId2}. Result: ${
        JSON.stringify(addCommentResult2)
      }`,
    );
    console.log(`  Verification: Comment IDs ${commentId1} and ${commentId2} are unique.`);

    // Verify resourceA now has both comments associated
    console.log(`  Verification: Checking resource ${resourceA} for added comments.`);
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
    console.log(
      `  State: Resource ${resourceA} now has ${storedResourceA?.comments.length} comments (expected 2): [${
        storedResourceA?.comments.join(", ")
      }]`,
    );

    // Verify comments data
    console.log(`  Verification: Checking details for comment ${commentId1}.`);
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
    console.log(
      `  State: Comment ${commentId1} details: Text: "${storedComment1?.text}", Commenter: ${storedComment1?.commenter}, Date: ${storedComment1?.date}`,
    );

    console.log(`  Verification: Checking details for comment ${commentId2}.`);
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
    console.log(
      `  State: Comment ${commentId2} details: Text: "${storedComment2?.text}", Commenter: ${storedComment2?.commenter}, Date: ${storedComment2?.date}`,
    );

    console.log(`  Action: removeComment(comment: ${commentId1}, user: ${user1})`);
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
    console.log(
      `  Output: Remove comment ${commentId1} result: ${
        JSON.stringify(removeCommentResult1)
      }`,
    );

    // Verify state after deletion:
    // 1. commentId1 should no longer be in resourceA's comments array
    console.log(`  Verification: Checking state after removing comment ${commentId1}.`);
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
    console.log(
      `  State: Resource ${resourceA} now has ${storedResourceA?.comments.length} comments (expected 1): [${
        storedResourceA?.comments.join(", ")
      }]`,
    );

    // 2. commentId1 should be deleted from the comments collection
    const deletedComment1 = await concept.comments.findOne({ _id: commentId1 });
    assertEquals(deletedComment1, null, "Comment 1 should be deleted");
    console.log(
      `  State: Comment ${commentId1} is ${
        deletedComment1 === null ? "deleted" : "still exists"
      } (expected deleted).`,
    );

    // 3. commentId2 (the other comment) should still exist
    const stillExistingComment2 = await concept.comments.findOne({
      _id: commentId2,
    });
    assertEquals(
      stillExistingComment2?.text,
      "Second comment by another user.",
      "Comment 2 should still exist and its text should match",
    );
    console.log(
      `  State: Comment ${commentId2} still exists. Text: "${stillExistingComment2?.text}" (expected to exist).`,
    );

    await client.close();
    console.log(`✅ Step 1: Operational Principle Test Completed Successfully.`);
  });

  // Scenario: Attempt to register an already registered resource
  await test.step("2. Scenario: Attempting to register an already registered resource", async () => {
    console.log(`\n--- Step 2: Registering an already registered resource ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: register(resourceA) - First time
    console.log(`  Setup: Registering resource ${resourceA} for the first time.`);
    await concept.register({ resource: resourceA });
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(
      `  Setup State: Resource ${resourceA} registered, comments: ${storedResourceA?.comments.length}`,
    );

    console.log(`  Action: Attempting to re-register resource ${resourceA}.`);
    // Action: register(resourceA) - Second time
    // Requires: resourceA isn't already registered (not satisfied)
    // Expected: error
    const registerResult = await concept.register({ resource: resourceA });
    assertEquals(
      registerResult,
      { error: `Resource '${resourceA}' is already registered.` },
      "Should return an error when registering an already registered resource",
    );
    console.log(
      `  Output: Re-registration result for ${resourceA}: ${
        JSON.stringify(registerResult)
      } (Expected error).`,
    );

    // Verify state remains unchanged (still 0 comments as none were added)
    console.log(`  Verification: Checking state of resource ${resourceA} after failed re-registration.`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      0,
      "Resource A comments should still be 0 after failed re-registration",
    );
    console.log(
      `  State: Resource ${resourceA} has ${storedResourceA?.comments.length} comments (expected 0).`,
    );

    await client.close();
    console.log(`✅ Step 2: Scenario Test Completed Successfully.`);
  });

  // Scenario: Attempt to add a comment to an unregistered resource
  await test.step("3. Scenario: Adding a comment to an unregistered resource", async () => {
    console.log(`\n--- Step 3: Adding comment to unregistered resource ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    console.log(`  Action: addComment(resource: ${resourceB} (unregistered), commenter: ${user1}, text: "Comment on unregistered.", date: now)`);
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
    console.log(
      `  Output: Add comment result for unregistered resource ${resourceB}: ${
        JSON.stringify(addCommentResult)
      } (Expected error).`,
    );

    // Verify no comment was created
    console.log(`  Verification: Checking comments collection and resource ${resourceB}.`);
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
    console.log(`  State: Comments collection has ${commentsCount} documents (expected 0).`);
    console.log(
      `  State: Resource ${resourceB} is ${
        storedResourceB === null ? "not found" : "found"
      } (expected not found).`,
    );

    await client.close();
    console.log(`✅ Step 3: Scenario Test Completed Successfully.`);
  });

  // Scenario: Add multiple comments from the same user to the same resource.
  // This demonstrates that multiple comments are distinct even if from the same user.
  await test.step("4. Scenario: Multiple comments from the same user on the same resource", async () => {
    console.log(`\n--- Step 4: Multiple comments by same user on same resource ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: register(resourceA)
    console.log(`  Setup: Registering resource ${resourceA}.`);
    await concept.register({ resource: resourceA });
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(
      `  Setup State: Resource ${resourceA} registered, comments: ${storedResourceA?.comments.length}`,
    );

    const date3 = new Date("2023-02-01T12:00:00Z");
    console.log(`  Action: addComment(resource: ${resourceA}, commenter: ${user1}, text: "First thought.", date: ${date3})`);
    // Action: addComment(resourceA, user1, "First thought.", date3)
    const commentResult3 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "First thought.",
      date: date3,
    });
    if ("error" in commentResult3) throw new Error(commentResult3.error);
    const commentId3 = commentResult3.comment;
    console.log(
      `  Output: First comment by ${user1} added. Comment ID: ${commentId3}. Result: ${
        JSON.stringify(commentResult3)
      }`,
    );

    const date4 = new Date("2023-02-01T12:15:00Z");
    console.log(`  Action: addComment(resource: ${resourceA}, commenter: ${user1}, text: "Second thought.", date: ${date4})`);
    // Action: addComment(resourceA, user1, "Second thought.", date4)
    const commentResult4 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "Second thought.",
      date: date4,
    });
    if ("error" in commentResult4) throw new Error(commentResult4.error);
    const commentId4 = commentResult4.comment;
    console.log(
      `  Output: Second comment by ${user1} added. Comment ID: ${commentId4}. Result: ${
        JSON.stringify(commentResult4)
      }`,
    );

    assertEquals(
      commentId3 !== commentId4,
      true,
      "Two comments by the same user should have distinct IDs",
    );
    console.log(`  Verification: Comment IDs ${commentId3} and ${commentId4} are distinct.`);

    // Verify resource A has both comments
    console.log(`  Verification: Checking resource ${resourceA} for comments.`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
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
    console.log(
      `  State: Resource ${resourceA} has ${storedResourceA?.comments.length} comments (expected 2): [${
        storedResourceA?.comments.join(", ")
      }]`,
    );

    console.log(`  Verification: Checking details for comment ${commentId3}.`);
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
    console.log(
      `  State: Comment ${commentId3} details: Commenter: ${storedComment3?.commenter}, Text: "${storedComment3?.text}"`,
    );

    console.log(`  Verification: Checking details for comment ${commentId4}.`);
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
    console.log(
      `  State: Comment ${commentId4} details: Commenter: ${storedComment4?.commenter}, Text: "${storedComment4?.text}"`,
    );

    await client.close();
    console.log(`✅ Step 4: Scenario Test Completed Successfully.`);
  });

  // Scenario: Adding comments with identical content (text, commenter, date) but expecting unique comments.
  await test.step("5. Scenario: Adding comments with identical content creates distinct entries", async () => {
    console.log(`\n--- Step 5: Identical content, distinct comments ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: register(resourceA)
    console.log(`  Setup: Registering resource ${resourceA}.`);
    await concept.register({ resource: resourceA });
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(
      `  Setup State: Resource ${resourceA} registered, comments: ${storedResourceA?.comments.length}`,
    );

    const commonDate = new Date("2023-03-01T09:00:00Z");
    const commonText = "Duplicate message test";

    console.log(`  Action: addComment(resource: ${resourceA}, commenter: ${user1}, text: "${commonText}", date: ${commonDate}) (first instance)`);
    // Action: addComment(resourceA, user1, commonText, commonDate) - First time
    const commentResult5a = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: commonText,
      date: commonDate,
    });
    if ("error" in commentResult5a) throw new Error(commentResult5a.error);
    const commentId5a = commentResult5a.comment;
    console.log(
      `  Output: First identical comment added. Comment ID: ${commentId5a}. Result: ${
        JSON.stringify(commentResult5a)
      }`,
    );

    console.log(`  Action: addComment(resource: ${resourceA}, commenter: ${user1}, text: "${commonText}", date: ${commonDate}) (second instance)`);
    // Action: addComment(resourceA, user1, commonText, commonDate) - Second time with identical data
    const commentResult5b = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: commonText,
      date: commonDate,
    });
    if ("error" in commentResult5b) throw new Error(commentResult5b.error);
    const commentId5b = commentResult5b.comment;
    console.log(
      `  Output: Second identical comment added. Comment ID: ${commentId5b}. Result: ${
        JSON.stringify(commentResult5b)
      }`,
    );

    // Verify that even with identical content, two distinct comment IDs are generated
    assertEquals(
      commentId5a !== commentId5b,
      true,
      "Identical comment content should still produce unique comment IDs",
    );
    console.log(
      `  Verification: Comment IDs ${commentId5a} and ${commentId5b} are distinct despite identical content.`,
    );

    // Verify resourceA has both comments
    console.log(`  Verification: Checking resource ${resourceA} for comments.`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
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
    console.log(
      `  State: Resource ${resourceA} has ${storedResourceA?.comments.length} comments (expected 2): [${
        storedResourceA?.comments.join(", ")
      }]`,
    );

    // Verify content of both comments is as expected
    console.log(`  Verification: Checking details for comment ${commentId5a}.`);
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
    console.log(
      `  State: Comment ${commentId5a} details: Text: "${storedComment5a?.text}", Commenter: ${storedComment5a?.commenter}, Date: ${storedComment5a?.date}`,
    );

    console.log(`  Verification: Checking details for comment ${commentId5b}.`);
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
    console.log(
      `  State: Comment ${commentId5b} details: Text: "${storedComment5b?.text}", Commenter: ${storedComment5b?.commenter}, Date: ${storedComment5b?.date}`,
    );

    await client.close();
    console.log(`✅ Step 5: Scenario Test Completed Successfully.`);
  });

  // Scenario: `removeComment` precondition failures and successful removal
  await test.step("6. Scenario: removeComment precondition failures and successful removal", async () => {
    console.log(`\n--- Step 6: removeComment precondition failures and success ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Setup: Register resource and add a comment that will be used for testing
    console.log(`  Setup: Registering resource ${resourceA}.`);
    await concept.register({ resource: resourceA });
    const date = new Date("2023-04-01T11:00:00Z");
    console.log(`  Setup: Adding a comment to ${resourceA} by ${user1}.`);
    const addResult = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "Comment for removal tests",
      date: date,
    });
    if ("error" in addResult) throw new Error(addResult.error);
    const commentIdToDelete = addResult.comment;
    console.log(`  Setup State: Comment ID ${commentIdToDelete} added for removal tests.`);

    // Precondition 1 failure: `comment` does not exist
    const nonExistentCommentId = freshID();
    console.log(`  Action: Attempting to remove non-existent comment ${nonExistentCommentId} by user ${user1}.`);
    const removeNonExistentResult = await concept.removeComment({
      comment: nonExistentCommentId,
      user: user1,
    });
    assertEquals(
      removeNonExistentResult,
      { error: `Comment '${nonExistentCommentId}' not found.` },
      "Should return an error when attempting to remove a non-existent comment",
    );
    console.log(
      `  Output: Remove non-existent comment result: ${
        JSON.stringify(removeNonExistentResult)
      } (Expected error).`,
    );

    // Verify existing comment is still there and linked
    console.log(`  Verification: Checking state after failed removal of non-existent comment.`);
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
    console.log(
      `  State: Resource ${resourceA} has ${storedResourceA?.comments.length} comments. Comment ${commentIdToDelete} still exists.`,
    );

    // Precondition 2 failure: `user` is not its `commenter`
    console.log(`  Action: Attempting to remove comment ${commentIdToDelete} by wrong user ${user3}.`);
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
    console.log(
      `  Output: Remove by wrong user result: ${
        JSON.stringify(removeWrongUserResult)
      } (Expected error).`,
    );

    // Verify existing comment is still there and linked after wrong-user attempt
    console.log(`  Verification: Checking state after failed removal by wrong user.`);
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
    console.log(
      `  State: Resource ${resourceA} has ${storedResourceA?.comments.length} comments. Comment ${commentIdToDelete} still exists.`,
    );

    // Successful removal (using the correct user)
    console.log(`  Action: Attempting successful removal of comment ${commentIdToDelete} by correct user ${user1}.`);
    const removeSuccessResult = await concept.removeComment({
      comment: commentIdToDelete,
      user: user1,
    });
    assertEquals(
      removeSuccessResult,
      {},
      "Should successfully remove the comment by its rightful commenter",
    );
    console.log(
      `  Output: Successful removal result: ${
        JSON.stringify(removeSuccessResult)
      } (Expected success).`,
    );

    // Verify comment is truly gone from resource and comments collection
    console.log(`  Verification: Checking state after successful removal.`);
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
    console.log(
      `  State: Resource ${resourceA} has ${storedResourceA?.comments.length} comments. Comment ${commentIdToDelete} is ${
        storedComment === null ? "deleted" : "still exists"
      }.`,
    );

    await client.close();
    console.log(`✅ Step 6: Scenario Test Completed Successfully.`);
  });
  console.log(`\n--- Test Suite End: CommentConcept ---`);
});

```
