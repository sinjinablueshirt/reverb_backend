---
timestamp: 'Thu Oct 16 2025 17:34:19 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_173419.7547b220.md]]'
content_id: 0b959e0aedece83e43a0f5487252ae1231d4c2652f8fc9a8dc5f3799383bea5b
---

# response:

```typescript
import { assertEquals } from "jsr:@std/assert";
import { Db, MongoClient } from "npm:mongodb";
import { testDb } from "@utils/database.ts";
import CommentConcept from "./CommentConcept.ts";
import { freshID } from "@utils/database.ts";

// ANSI escape codes for coloring console output
const GREEN_CHECK = "\x1b[32m✔\x1b[0m";
const RED_X = "\x1b[31m✖\x1b[0m";

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
    console.log(`\n--- ${test.name} ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);
    console.log(`  Database connection established for test step "${test.name}".`);

    // Action: register(resourceA)
    console.log(`\n  Calling register({ resource: '${resourceA}' })`);
    const registerResult = await concept.register({ resource: resourceA });
    console.log(`  register result: ${JSON.stringify(registerResult)}`);
    try {
      assertEquals(registerResult, {}, "Should successfully register resourceA");
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' successfully registered.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify initial state: resourceA registered, comments empty
    console.log(`  Verifying state: Finding resource '${resourceA}'...`);
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        0,
        "Resource A should have 0 comments after registration",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' initially has 0 comments.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }


    // Action: addComment(resourceA, user1, "First comment!", date1)
    const date1 = new Date("2023-01-01T10:00:00Z");
    console.log(
      `\n  Calling addComment({ resource: '${resourceA}', commenter: '${user1}', text: 'First comment!', date: '${date1.toISOString()}' })`,
    );
    const addCommentResult1 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "First comment!",
      date: date1,
    });
    console.log(`  addComment result 1: ${JSON.stringify(addCommentResult1)}`);
    if ("error" in addCommentResult1) {
      console.error(`  ${RED_X} Error: Failed to add first comment: ${addCommentResult1.error}`);
      throw new Error(
        `Failed to add first comment: ${addCommentResult1.error}`,
      );
    }
    const commentId1 = addCommentResult1.comment;
    try {
      assertEquals(
        typeof commentId1,
        "string",
        "Should return a valid ID for the first comment",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: First comment ID '${commentId1}' is a string.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Action: addComment(resourceA, user2, "Second comment.", date2)
    const date2 = new Date("2023-01-01T10:05:00Z");
    console.log(
      `\n  Calling addComment({ resource: '${resourceA}', commenter: '${user2}', text: 'Second comment by another user.', date: '${date2.toISOString()}' })`,
    );
    const addCommentResult2 = await concept.addComment({
      resource: resourceA,
      commenter: user2,
      text: "Second comment by another user.",
      date: date2,
    });
    console.log(`  addComment result 2: ${JSON.stringify(addCommentResult2)}`);
    if ("error" in addCommentResult2) {
      console.error(`  ${RED_X} Error: Failed to add second comment: ${addCommentResult2.error}`);
      throw new Error(
        `Failed to add second comment: ${addCommentResult2.error}`,
      );
    }
    const commentId2 = addCommentResult2.comment;
    try {
      assertEquals(
        typeof commentId2,
        "string",
        "Should return a valid ID for the second comment",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Second comment ID '${commentId2}' is a string.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        commentId1 !== commentId2,
        true,
        "Comment IDs should be unique for different comments",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment IDs '${commentId1}' and '${commentId2}' are unique.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify resourceA now has both comments associated
    console.log(`\n  Verifying state: Finding resource '${resourceA}' after adding two comments...`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        2,
        "Resource A should have 2 comments after adding two",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' now has 2 comments.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentId1),
        true,
        "Resource A should contain commentId1",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' contains comment ID '${commentId1}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentId2),
        true,
        "Resource A should contain commentId2",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' contains comment ID '${commentId2}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify comments data
    console.log(`\n  Verifying state: Finding comment '${commentId1}'...`);
    const storedComment1 = await concept.comments.findOne({ _id: commentId1 });
    console.log(`  Comment '${commentId1}' found: ${JSON.stringify(storedComment1)}`);
    try {
      assertEquals(
        storedComment1?.text,
        "First comment!",
        "Comment 1 text should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId1}' text matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment1?.commenter,
        user1,
        "Comment 1 commenter should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId1}' commenter matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment1?.date.getTime(),
        date1.getTime(),
        "Comment 1 date should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId1}' date matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    console.log(`\n  Verifying state: Finding comment '${commentId2}'...`);
    const storedComment2 = await concept.comments.findOne({ _id: commentId2 });
    console.log(`  Comment '${commentId2}' found: ${JSON.stringify(storedComment2)}`);
    try {
      assertEquals(
        storedComment2?.text,
        "Second comment by another user.",
        "Comment 2 text should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId2}' text matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment2?.commenter,
        user2,
        "Comment 2 commenter should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId2}' commenter matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment2?.date.getTime(),
        date2.getTime(),
        "Comment 2 date should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId2}' date matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Action: removeComment(commentId1, user1)
    console.log(`\n  Calling removeComment({ comment: '${commentId1}', user: '${user1}' })`);
    const removeCommentResult1 = await concept.removeComment({
      comment: commentId1,
      user: user1,
    });
    console.log(`  removeComment result: ${JSON.stringify(removeCommentResult1)}`);
    try {
      assertEquals(
        removeCommentResult1,
        {},
        "Should successfully remove commentId1 by its commenter",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId1}' successfully removed by its commenter '${user1}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify state after deletion:
    // 1. commentId1 should no longer be in resourceA's comments array
    console.log(`\n  Verifying state: Finding resource '${resourceA}' after deleting comment '${commentId1}'...`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        1,
        "Resource A should have 1 comment after deleting one",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' now has 1 comment.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentId1),
        false,
        "Resource A should NOT contain commentId1 after deletion",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' no longer contains comment ID '${commentId1}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentId2),
        true,
        "Resource A should still contain commentId2 after commentId1 deletion",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' still contains comment ID '${commentId2}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // 2. commentId1 should be deleted from the comments collection
    console.log(`\n  Verifying state: Finding comment '${commentId1}' in comments collection...`);
    const deletedComment1 = await concept.comments.findOne({ _id: commentId1 });
    console.log(`  Comment '${commentId1}' found: ${JSON.stringify(deletedComment1)}`);
    try {
      assertEquals(deletedComment1, null, "Comment 1 should be deleted");
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId1}' document is deleted.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // 3. commentId2 (the other comment) should still exist
    console.log(`\n  Verifying state: Finding comment '${commentId2}' in comments collection (should still exist)...`);
    const stillExistingComment2 = await concept.comments.findOne({
      _id: commentId2,
    });
    console.log(`  Comment '${commentId2}' found: ${JSON.stringify(stillExistingComment2)}`);
    try {
      assertEquals(
        stillExistingComment2?.text,
        "Second comment by another user.",
        "Comment 2 should still exist and its text should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId2}' still exists with correct text.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    await client.close();
    console.log(`  Database client closed for test step "${test.name}".`);
    console.log(`--- End of Step: ${test.name} ---\n`);
  });

  // Scenario: Attempt to register an already registered resource
  await test.step("2. Scenario: Attempting to register an already registered resource", async () => {
    console.log(`\n--- ${test.name} ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);
    console.log(`  Database connection established for test step "${test.name}".`);

    // Action: register(resourceA) - First time
    console.log(`\n  Setup: Calling register({ resource: '${resourceA}' }) (first time)`);
    await concept.register({ resource: resourceA });
    console.log(`  Setup: Resource '${resourceA}' initially registered.`);


    // Action: register(resourceA) - Second time
    // Requires: resourceA isn't already registered (not satisfied)
    // Expected: error
    console.log(`\n  Calling register({ resource: '${resourceA}' }) (second time - expecting error)`);
    const registerResult = await concept.register({ resource: resourceA });
    console.log(`  register result: ${JSON.stringify(registerResult)}`);
    try {
      assertEquals(
        registerResult,
        { error: `Resource '${resourceA}' is already registered.` },
        "Should return an error when registering an already registered resource",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Correctly received error for re-registering '${resourceA}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify state remains unchanged (still 0 comments as none were added)
    console.log(`\n  Verifying state: Finding resource '${resourceA}' after failed re-registration...`);
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        0,
        "Resource A comments should still be 0 after failed re-registration",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comments for '${resourceA}' remain 0.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    await client.close();
    console.log(`  Database client closed for test step "${test.name}".`);
    console.log(`--- End of Step: ${test.name} ---\n`);
  });

  // Scenario: Attempt to add a comment to an unregistered resource
  await test.step("3. Scenario: Adding a comment to an unregistered resource", async () => {
    console.log(`\n--- ${test.name} ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);
    console.log(`  Database connection established for test step "${test.name}".`);

    // Action: addComment(resourceB, user1, "Comment on unregistered.", date)
    // Requires: resourceB is registered (not satisfied)
    // Expected: error
    const date = new Date();
    console.log(
      `\n  Calling addComment({ resource: '${resourceB}' (UNREGISTERED), commenter: '${user1}', text: 'This comment should not be added.', date: '${date.toISOString()}' })`,
    );
    const addCommentResult = await concept.addComment({
      resource: resourceB, // resourceB is NOT registered
      commenter: user1,
      text: "This comment should not be added.",
      date: date,
    });
    console.log(`  addComment result: ${JSON.stringify(addCommentResult)}`);

    try {
      assertEquals(
        addCommentResult,
        { error: `Resource '${resourceB}' is not registered.` },
        "Should return an error when attempting to add a comment to an unregistered resource",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Correctly received error for adding comment to unregistered resource '${resourceB}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify no comment was created
    console.log(`\n  Verifying state: Counting comments in the collection...`);
    const commentsCount = await concept.comments.countDocuments();
    console.log(`  Total comments in collection: ${commentsCount}`);
    try {
      assertEquals(
        commentsCount,
        0,
        "No comment should have been created in the comments collection",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: No comments created.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    console.log(`\n  Verifying state: Finding resource '${resourceB}'...`);
    const storedResourceB = await concept.resources.findOne({ _id: resourceB });
    console.log(`  Resource '${resourceB}' found: ${JSON.stringify(storedResourceB)}`);
    try {
      assertEquals(
        storedResourceB,
        null,
        "Resource B should not be present in the resources collection",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceB}' is not present in resources collection.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    await client.close();
    console.log(`  Database client closed for test step "${test.name}".`);
    console.log(`--- End of Step: ${test.name} ---\n`);
  });

  // Scenario: Add multiple comments from the same user to the same resource.
  // This demonstrates that multiple comments are distinct even if from the same user.
  await test.step("4. Scenario: Multiple comments from the same user on the same resource", async () => {
    console.log(`\n--- ${test.name} ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);
    console.log(`  Database connection established for test step "${test.name}".`);

    // Action: register(resourceA)
    console.log(`\n  Setup: Calling register({ resource: '${resourceA}' })`);
    await concept.register({ resource: resourceA });
    console.log(`  Setup: Resource '${resourceA}' registered.`);

    const date3 = new Date("2023-02-01T12:00:00Z");
    // Action: addComment(resourceA, user1, "First thought.", date3)
    console.log(
      `\n  Calling addComment({ resource: '${resourceA}', commenter: '${user1}', text: 'First thought.', date: '${date3.toISOString()}' })`,
    );
    const commentResult3 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "First thought.",
      date: date3,
    });
    console.log(`  addComment result 3: ${JSON.stringify(commentResult3)}`);
    if ("error" in commentResult3) {
      console.error(`  ${RED_X} Error: Failed to add comment 3: ${commentResult3.error}`);
      throw new Error(commentResult3.error);
    }
    const commentId3 = commentResult3.comment;
    console.log(`  Comment ID 3 created: '${commentId3}'`);

    const date4 = new Date("2023-02-01T12:15:00Z");
    // Action: addComment(resourceA, user1, "Second thought.", date4)
    console.log(
      `\n  Calling addComment({ resource: '${resourceA}', commenter: '${user1}', text: 'Second thought.', date: '${date4.toISOString()}' })`,
    );
    const commentResult4 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "Second thought.",
      date: date4,
    });
    console.log(`  addComment result 4: ${JSON.stringify(commentResult4)}`);
    if ("error" in commentResult4) {
      console.error(`  ${RED_X} Error: Failed to add comment 4: ${commentResult4.error}`);
      throw new Error(commentResult4.error);
    }
    const commentId4 = commentResult4.comment;
    console.log(`  Comment ID 4 created: '${commentId4}'`);

    try {
      assertEquals(
        commentId3 !== commentId4,
        true,
        "Two comments by the same user should have distinct IDs",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment IDs '${commentId3}' and '${commentId4}' are distinct even from same user.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify resource A has both comments
    console.log(`\n  Verifying state: Finding resource '${resourceA}' after adding two comments from same user...`);
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        2,
        "Resource A should have two comments from the same user",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' has 2 comments.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentId3),
        true,
        "Resource A should include commentId3",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' includes comment ID '${commentId3}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentId4),
        true,
        "Resource A should include commentId4",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' includes comment ID '${commentId4}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    console.log(`\n  Verifying state: Finding comment '${commentId3}'...`);
    const storedComment3 = await concept.comments.findOne({ _id: commentId3 });
    console.log(`  Comment '${commentId3}' found: ${JSON.stringify(storedComment3)}`);
    try {
      assertEquals(
        storedComment3?.commenter,
        user1,
        "Comment 3 commenter should be User 1",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId3}' commenter is '${user1}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment3?.text,
        "First thought.",
        "Comment 3 text should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId3}' text matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    console.log(`\n  Verifying state: Finding comment '${commentId4}'...`);
    const storedComment4 = await concept.comments.findOne({ _id: commentId4 });
    console.log(`  Comment '${commentId4}' found: ${JSON.stringify(storedComment4)}`);
    try {
      assertEquals(
        storedComment4?.commenter,
        user1,
        "Comment 4 commenter should be User 1",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId4}' commenter is '${user1}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment4?.text,
        "Second thought.",
        "Comment 4 text should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId4}' text matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    await client.close();
    console.log(`  Database client closed for test step "${test.name}".`);
    console.log(`--- End of Step: ${test.name} ---\n`);
  });

  // Scenario: Adding comments with identical content (text, commenter, date) but expecting unique comments.
  await test.step("5. Scenario: Adding comments with identical content creates distinct entries", async () => {
    console.log(`\n--- ${test.name} ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);
    console.log(`  Database connection established for test step "${test.name}".`);

    // Action: register(resourceA)
    console.log(`\n  Setup: Calling register({ resource: '${resourceA}' })`);
    await concept.register({ resource: resourceA });
    console.log(`  Setup: Resource '${resourceA}' registered.`);

    const commonDate = new Date("2023-03-01T09:00:00Z");
    const commonText = "Duplicate message test";

    // Action: addComment(resourceA, user1, commonText, commonDate) - First time
    console.log(
      `\n  Calling addComment({ resource: '${resourceA}', commenter: '${user1}', text: '${commonText}', date: '${commonDate.toISOString()}' }) (first identical)`,
    );
    const commentResult5a = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: commonText,
      date: commonDate,
    });
    console.log(`  addComment result 5a: ${JSON.stringify(commentResult5a)}`);
    if ("error" in commentResult5a) {
      console.error(`  ${RED_X} Error: Failed to add first identical comment: ${commentResult5a.error}`);
      throw new Error(commentResult5a.error);
    }
    const commentId5a = commentResult5a.comment;
    console.log(`  First identical comment ID created: '${commentId5a}'`);

    // Action: addComment(resourceA, user1, commonText, commonDate) - Second time with identical data
    console.log(
      `\n  Calling addComment({ resource: '${resourceA}', commenter: '${user1}', text: '${commonText}', date: '${commonDate.toISOString()}' }) (second identical)`,
    );
    const commentResult5b = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: commonText,
      date: commonDate,
    });
    console.log(`  addComment result 5b: ${JSON.stringify(commentResult5b)}`);
    if ("error" in commentResult5b) {
      console.error(`  ${RED_X} Error: Failed to add second identical comment: ${commentResult5b.error}`);
      throw new Error(commentResult5b.error);
    }
    const commentId5b = commentResult5b.comment;
    console.log(`  Second identical comment ID created: '${commentId5b}'`);

    // Verify that even with identical content, two distinct comment IDs are generated
    try {
      assertEquals(
        commentId5a !== commentId5b,
        true,
        "Identical comment content should still produce unique comment IDs",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Identical content comments '${commentId5a}' and '${commentId5b}' have unique IDs.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify resourceA has both comments
    console.log(`\n  Verifying state: Finding resource '${resourceA}' after adding two identical comments...`);
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        2,
        "Resource A should contain two comments",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' has 2 comments.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentId5a),
        true,
        "Resource A should include commentId5a",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' includes comment ID '${commentId5a}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentId5b),
        true,
        "Resource A should include commentId5b",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' includes comment ID '${commentId5b}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify content of both comments is as expected
    console.log(`\n  Verifying state: Finding comment '${commentId5a}'...`);
    const storedComment5a = await concept.comments.findOne({
      _id: commentId5a,
    });
    console.log(`  Comment '${commentId5a}' found: ${JSON.stringify(storedComment5a)}`);
    try {
      assertEquals(
        storedComment5a?.text,
        commonText,
        "First identical comment text should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId5a}' text matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment5a?.commenter,
        user1,
        "First identical comment commenter should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId5a}' commenter matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment5a?.date.getTime(),
        commonDate.getTime(),
        "First identical comment date should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId5a}' date matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    console.log(`\n  Verifying state: Finding comment '${commentId5b}'...`);
    const storedComment5b = await concept.comments.findOne({
      _id: commentId5b,
    });
    console.log(`  Comment '${commentId5b}' found: ${JSON.stringify(storedComment5b)}`);
    try {
      assertEquals(
        storedComment5b?.text,
        commonText,
        "Second identical comment text should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId5b}' text matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment5b?.commenter,
        user1,
        "Second identical comment commenter should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId5b}' commenter matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedComment5b?.date.getTime(),
        commonDate.getTime(),
        "Second identical comment date should match",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentId5b}' date matches.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    await client.close();
    console.log(`  Database client closed for test step "${test.name}".`);
    console.log(`--- End of Step: ${test.name} ---\n`);
  });

  // Scenario: `removeComment` precondition failures and successful removal
  await test.step("6. Scenario: removeComment precondition failures and successful removal", async () => {
    console.log(`\n--- ${test.name} ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);
    console.log(`  Database connection established for test step "${test.name}".`);

    // Setup: Register resource and add a comment that will be used for testing
    console.log(`\n  Setup: Registering resource '${resourceA}'`);
    await concept.register({ resource: resourceA });
    const date = new Date("2023-04-01T11:00:00Z");
    console.log(
      `  Setup: Adding comment to resource '${resourceA}' by user '${user1}' with text 'Comment for removal tests' at '${date.toISOString()}'`,
    );
    const addResult = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "Comment for removal tests",
      date: date,
    });
    console.log(`  Setup: addComment result: ${JSON.stringify(addResult)}`);
    if ("error" in addResult) {
      console.error(`  ${RED_X} Error: Failed to add setup comment: ${addResult.error}`);
      throw new Error(addResult.error);
    }
    const commentIdToDelete = addResult.comment;
    console.log(`  Setup: Comment ID created for removal tests: '${commentIdToDelete}'`);

    // Precondition 1 failure: `comment` does not exist
    const nonExistentCommentId = freshID();
    console.log(
      `\n  Calling removeComment({ comment: '${nonExistentCommentId}' (NON-EXISTENT), user: '${user1}' }) (expecting error)`,
    );
    const removeNonExistentResult = await concept.removeComment({
      comment: nonExistentCommentId,
      user: user1,
    });
    console.log(`  removeComment result (non-existent): ${JSON.stringify(removeNonExistentResult)}`);
    try {
      assertEquals(
        removeNonExistentResult,
        { error: `Comment '${nonExistentCommentId}' not found.` },
        "Should return an error when attempting to remove a non-existent comment",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Correctly received error for non-existent comment '${nonExistentCommentId}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify existing comment is still there and linked
    console.log(`\n  Verifying state: Resource '${resourceA}' after failed removal attempt...`);
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        1,
        "Resource A should still have 1 comment after failed removal of non-existent",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' still has 1 comment.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentIdToDelete),
        true,
        "Resource A should still contain the original comment",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' still contains comment '${commentIdToDelete}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    console.log(`\n  Verifying state: Finding comment '${commentIdToDelete}' after failed removal attempt...`);
    let storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    console.log(`  Comment '${commentIdToDelete}' found: ${JSON.stringify(storedComment)}`);
    try {
      assertEquals(
        storedComment !== null,
        true,
        "Original comment should still exist",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentIdToDelete}' document still exists.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Precondition 2 failure: `user` is not its `commenter`
    console.log(
      `\n  Calling removeComment({ comment: '${commentIdToDelete}', user: '${user3}' (WRONG USER) }) (expecting error)`,
    );
    const removeWrongUserResult = await concept.removeComment({
      comment: commentIdToDelete,
      user: user3, // user3 is not user1
    });
    console.log(`  removeComment result (wrong user): ${JSON.stringify(removeWrongUserResult)}`);
    try {
      assertEquals(
        removeWrongUserResult,
        {
          error:
            `User '${user3}' is not the commenter of comment '${commentIdToDelete}'.`,
        },
        "Should return an error when a different user attempts to remove a comment",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Correctly received error for wrong user '${user3}' attempting to delete comment.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify existing comment is still there and linked after wrong-user attempt
    console.log(`\n  Verifying state: Resource '${resourceA}' after failed removal attempt by wrong user...`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        1,
        "Resource A should still have 1 comment after failed removal by wrong user",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' still has 1 comment.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentIdToDelete),
        true,
        "Resource A should still contain the original comment",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' still contains comment '${commentIdToDelete}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    console.log(`\n  Verifying state: Finding comment '${commentIdToDelete}' after failed removal attempt by wrong user...`);
    storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    console.log(`  Comment '${commentIdToDelete}' found: ${JSON.stringify(storedComment)}`);
    try {
      assertEquals(
        storedComment !== null,
        true,
        "Original comment should still exist",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentIdToDelete}' document still exists.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Successful removal (using the correct user)
    console.log(
      `\n  Calling removeComment({ comment: '${commentIdToDelete}', user: '${user1}' }) (SUCCESSFUL REMOVAL)`,
    );
    const removeSuccessResult = await concept.removeComment({
      comment: commentIdToDelete,
      user: user1,
    });
    console.log(`  removeComment result (success): ${JSON.stringify(removeSuccessResult)}`);
    try {
      assertEquals(
        removeSuccessResult,
        {},
        "Should successfully remove the comment by its rightful commenter",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentIdToDelete}' successfully removed by correct user '${user1}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    // Verify comment is truly gone from resource and comments collection
    console.log(`\n  Verifying state: Resource '${resourceA}' after successful removal...`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    console.log(`  Resource '${resourceA}' found: ${JSON.stringify(storedResourceA)}`);
    try {
      assertEquals(
        storedResourceA?.comments.length,
        0,
        "Resource A should have 0 comments after successful removal",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' now has 0 comments.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    try {
      assertEquals(
        storedResourceA?.comments.includes(commentIdToDelete),
        false,
        "Resource A should no longer contain the removed comment",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Resource '${resourceA}' no longer contains comment '${commentIdToDelete}'.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }
    console.log(`\n  Verifying state: Finding comment '${commentIdToDelete}' after successful removal...`);
    storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    console.log(`  Comment '${commentIdToDelete}' found: ${JSON.stringify(storedComment)}`);
    try {
      assertEquals(
        storedComment,
        null,
        "The comment document should be deleted from the comments collection",
      );
      console.log(`  ${GREEN_CHECK} Assertion passed: Comment '${commentIdToDelete}' document is deleted.`);
    } catch (e) {
      console.error(`  ${RED_X} Assertion failed: ${e.message}`);
      throw e;
    }

    await client.close();
    console.log(`  Database client closed for test step "${test.name}".`);
    console.log(`--- End of Step: ${test.name} ---\n`);
  });
});

```
