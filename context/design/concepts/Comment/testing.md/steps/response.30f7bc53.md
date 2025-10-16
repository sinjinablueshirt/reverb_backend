---
timestamp: 'Thu Oct 16 2025 17:31:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_173122.8c101e7d.md]]'
content_id: 30f7bc53f16da275bba7057a10596c5a9fe8ed4d60621a1d73b1bd2e7a436aa3
---

# response:

```typescript
import { assertEquals } from "jsr:@std/assert";
import { Db, MongoClient } from "npm:mongodb";
import { testDb } from "@utils/database.ts";
import CommentConcept from "./CommentConcept.ts";
import { freshID } from "@utils/database.ts";

// ANSI escape codes for colors
const GREEN_CHECK = "\x1b[32m✔\x1b[0m";
const RED_X = "\x1b[31m✖\x1b[0m";
const BLUE_ACTION = "\x1b[34m";
const YELLOW_OUTPUT = "\x1b[33m";
const RESET = "\x1b[0m";

// Helper function to print assertions with colors
function assertAndLog<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  try {
    assertEquals(actual, expected, message);
    console.log(`${GREEN_CHECK} ${message}`);
  } catch (e) {
    console.error(`${RED_X} ${message}`);
    throw e;
  }
}

// Helper function to print true assertions with colors
function assertTrueAndLog(
  condition: boolean,
  message: string,
): void {
  try {
    assertEquals(condition, true, message);
    console.log(`${GREEN_CHECK} ${message}`);
  } catch (e) {
    console.error(`${RED_X} ${message}`);
    throw e;
  }
}

// Helper function to print null assertions with colors
function assertNullAndLog<T>(
  actual: T | null,
  message: string,
): void {
  try {
    assertEquals(actual, null, message);
    console.log(`${GREEN_CHECK} ${message}`);
  } catch (e) {
    console.error(`${RED_X} ${message}`);
    throw e;
  }
}

// Helper function to print not-null assertions with colors
function assertNotNullAndLog<T>(
  actual: T | null,
  message: string,
): void {
  try {
    assertEquals(actual !== null, true, message);
    console.log(`${GREEN_CHECK} ${message}`);
  } catch (e) {
    console.error(`${RED_X} ${message}`);
    throw e;
  }
}


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
    console.log(`\n${BLUE_ACTION}--- Starting Test Step 1: Operational Principle ---${RESET}`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    console.log(`${BLUE_ACTION}Action: concept.register({ resource: '${resourceA}' })${RESET}`);
    const registerResult = await concept.register({ resource: resourceA });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(registerResult)}${RESET}`);
    assertAndLog(registerResult, {}, "Should successfully register resourceA");

    console.log(`${BLUE_ACTION}Verifying initial state of resource '${resourceA}'${RESET}`);
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertAndLog(
      storedResourceA?.comments.length,
      0,
      "Resource A should have 0 comments after registration",
    );

    const date1 = new Date("2023-01-01T10:00:00Z");
    console.log(
      `${BLUE_ACTION}Action: concept.addComment({ resource: '${resourceA}', commenter: '${user1}', text: 'First comment!', date: '${date1.toISOString()}' })${RESET}`,
    );
    const addCommentResult1 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "First comment!",
      date: date1,
    });
    if ("error" in addCommentResult1) {
      console.error(`${RED_X} Failed to add first comment: ${addCommentResult1.error}`);
      throw new Error(
        `Failed to add first comment: ${addCommentResult1.error}`,
      );
    }
    const commentId1 = addCommentResult1.comment;
    console.log(`${YELLOW_OUTPUT}Output: { comment: '${commentId1}' }${RESET}`);
    assertAndLog(
      typeof commentId1,
      "string",
      "Should return a valid ID for the first comment",
    );

    const date2 = new Date("2023-01-01T10:05:00Z");
    console.log(
      `${BLUE_ACTION}Action: concept.addComment({ resource: '${resourceA}', commenter: '${user2}', text: 'Second comment by another user.', date: '${date2.toISOString()}' })${RESET}`,
    );
    const addCommentResult2 = await concept.addComment({
      resource: resourceA,
      commenter: user2,
      text: "Second comment by another user.",
      date: date2,
    });
    if ("error" in addCommentResult2) {
      console.error(`${RED_X} Failed to add second comment: ${addCommentResult2.error}`);
      throw new Error(
        `Failed to add second comment: ${addCommentResult2.error}`,
      );
    }
    const commentId2 = addCommentResult2.comment;
    console.log(`${YELLOW_OUTPUT}Output: { comment: '${commentId2}' }${RESET}`);
    assertAndLog(
      typeof commentId2,
      "string",
      "Should return a valid ID for the second comment",
    );
    assertTrueAndLog(
      commentId1 !== commentId2,
      "Comment IDs should be unique for different comments",
    );

    console.log(`${BLUE_ACTION}Verifying resource '${resourceA}' now has both comments associated${RESET}`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertNotNullAndLog(storedResourceA, `Resource '${resourceA}' should exist.`);
    assertAndLog(
      storedResourceA?.comments.length,
      2,
      "Resource A should have 2 comments after adding two",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentId1),
      "Resource A should contain commentId1",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentId2),
      "Resource A should contain commentId2",
    );

    console.log(`${BLUE_ACTION}Verifying content of comment '${commentId1}'${RESET}`);
    const storedComment1 = await concept.comments.findOne({ _id: commentId1 });
    assertNotNullAndLog(storedComment1, `Comment '${commentId1}' should exist.`);
    assertAndLog(
      storedComment1?.text,
      "First comment!",
      "Comment 1 text should match",
    );
    assertAndLog(
      storedComment1?.commenter,
      user1,
      "Comment 1 commenter should match",
    );
    assertAndLog(
      storedComment1?.date.getTime(),
      date1.getTime(),
      "Comment 1 date should match",
    );

    console.log(`${BLUE_ACTION}Verifying content of comment '${commentId2}'${RESET}`);
    const storedComment2 = await concept.comments.findOne({ _id: commentId2 });
    assertNotNullAndLog(storedComment2, `Comment '${commentId2}' should exist.`);
    assertAndLog(
      storedComment2?.text,
      "Second comment by another user.",
      "Comment 2 text should match",
    );
    assertAndLog(
      storedComment2?.commenter,
      user2,
      "Comment 2 commenter should match",
    );
    assertAndLog(
      storedComment2?.date.getTime(),
      date2.getTime(),
      "Comment 2 date should match",
    );

    console.log(
      `${BLUE_ACTION}Action: concept.removeComment({ comment: '${commentId1}', user: '${user1}' })${RESET}`,
    );
    const removeCommentResult1 = await concept.removeComment({
      comment: commentId1,
      user: user1,
    });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(removeCommentResult1)}${RESET}`);
    assertAndLog(
      removeCommentResult1,
      {},
      "Should successfully remove commentId1 by its commenter",
    );

    console.log(
      `${BLUE_ACTION}Verifying state after deletion of comment '${commentId1}'${RESET}`,
    );
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertNotNullAndLog(storedResourceA, `Resource '${resourceA}' should still exist.`);
    assertAndLog(
      storedResourceA?.comments.length,
      1,
      "Resource A should have 1 comment after deleting one",
    );
    assertAndLog(
      storedResourceA?.comments.includes(commentId1),
      false,
      "Resource A should NOT contain commentId1 after deletion",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentId2),
      "Resource A should still contain commentId2 after commentId1 deletion",
    );

    const deletedComment1 = await concept.comments.findOne({ _id: commentId1 });
    assertNullAndLog(deletedComment1, "Comment 1 should be deleted");

    const stillExistingComment2 = await concept.comments.findOne({
      _id: commentId2,
    });
    assertNotNullAndLog(
      stillExistingComment2,
      "Comment 2 (the other comment) should still exist",
    );
    assertAndLog(
      stillExistingComment2?.text,
      "Second comment by another user.",
      "Comment 2 still existing text should match",
    );

    await client.close();
    console.log(`\n${GREEN_CHECK}--- Finished Test Step 1 ---${RESET}`);
  });

  // Scenario: Attempt to register an already registered resource
  await test.step("2. Scenario: Attempting to register an already registered resource", async () => {
    console.log(`\n${BLUE_ACTION}--- Starting Test Step 2: Register already registered resource ---${RESET}`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    console.log(`${BLUE_ACTION}Action: concept.register({ resource: '${resourceA}' }) - First time${RESET}`);
    const firstRegisterResult = await concept.register({ resource: resourceA });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(firstRegisterResult)}${RESET}`);
    assertAndLog(firstRegisterResult, {}, "Initial registration of resourceA should succeed");

    console.log(`${BLUE_ACTION}Action: concept.register({ resource: '${resourceA}' }) - Second time (expected error)${RESET}`);
    const registerResult = await concept.register({ resource: resourceA });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(registerResult)}${RESET}`);
    assertAndLog(
      registerResult,
      { error: `Resource '${resourceA}' is already registered.` },
      "Should return an error when registering an already registered resource",
    );

    console.log(
      `${BLUE_ACTION}Verifying state of resource '${resourceA}' remains unchanged${RESET}`,
    );
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertNotNullAndLog(storedResourceA, `Resource '${resourceA}' should still exist.`);
    assertAndLog(
      storedResourceA?.comments.length,
      0,
      "Resource A comments should still be 0 after failed re-registration",
    );

    await client.close();
    console.log(`\n${GREEN_CHECK}--- Finished Test Step 2 ---${RESET}`);
  });

  // Scenario: Attempt to add a comment to an unregistered resource
  await test.step("3. Scenario: Adding a comment to an unregistered resource", async () => {
    console.log(`\n${BLUE_ACTION}--- Starting Test Step 3: Add comment to unregistered resource ---${RESET}`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    const date = new Date();
    console.log(
      `${BLUE_ACTION}Action: concept.addComment({ resource: '${resourceB}' (unregistered), commenter: '${user1}', text: 'This comment should not be added.', date: '${date.toISOString()}' })${RESET}`,
    );
    const addCommentResult = await concept.addComment({
      resource: resourceB, // resourceB is NOT registered
      commenter: user1,
      text: "This comment should not be added.",
      date: date,
    });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(addCommentResult)}${RESET}`);
    assertAndLog(
      addCommentResult,
      { error: `Resource '${resourceB}' is not registered.` },
      "Should return an error when attempting to add a comment to an unregistered resource",
    );

    console.log(`${BLUE_ACTION}Verifying no comment was created and resource '${resourceB}' is not present${RESET}`);
    const commentsCount = await concept.comments.countDocuments();
    assertAndLog(
      commentsCount,
      0,
      "No comment should have been created in the comments collection",
    );
    const storedResourceB = await concept.resources.findOne({ _id: resourceB });
    assertNullAndLog(
      storedResourceB,
      "Resource B should not be present in the resources collection",
    );

    await client.close();
    console.log(`\n${GREEN_CHECK}--- Finished Test Step 3 ---${RESET}`);
  });

  // Scenario: Add multiple comments from the same user to the same resource.
  // This demonstrates that multiple comments are distinct even if from the same user.
  await test.step("4. Scenario: Multiple comments from the same user on the same resource", async () => {
    console.log(`\n${BLUE_ACTION}--- Starting Test Step 4: Multiple comments from same user ---${RESET}`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    console.log(`${BLUE_ACTION}Action: concept.register({ resource: '${resourceA}' })${RESET}`);
    const registerResult = await concept.register({ resource: resourceA });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(registerResult)}${RESET}`);
    assertAndLog(registerResult, {}, "Registration of resourceA should succeed");

    const date3 = new Date("2023-02-01T12:00:00Z");
    console.log(
      `${BLUE_ACTION}Action: concept.addComment({ resource: '${resourceA}', commenter: '${user1}', text: 'First thought.', date: '${date3.toISOString()}' })${RESET}`,
    );
    const commentResult3 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "First thought.",
      date: date3,
    });
    if ("error" in commentResult3) {
      console.error(`${RED_X} Failed to add first comment: ${commentResult3.error}`);
      throw new Error(commentResult3.error);
    }
    const commentId3 = commentResult3.comment;
    console.log(`${YELLOW_OUTPUT}Output: { comment: '${commentId3}' }${RESET}`);

    const date4 = new Date("2023-02-01T12:15:00Z");
    console.log(
      `${BLUE_ACTION}Action: concept.addComment({ resource: '${resourceA}', commenter: '${user1}', text: 'Second thought.', date: '${date4.toISOString()}' })${RESET}`,
    );
    const commentResult4 = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "Second thought.",
      date: date4,
    });
    if ("error" in commentResult4) {
      console.error(`${RED_X} Failed to add second comment: ${commentResult4.error}`);
      throw new Error(commentResult4.error);
    }
    const commentId4 = commentResult4.comment;
    console.log(`${YELLOW_OUTPUT}Output: { comment: '${commentId4}' }${RESET}`);

    assertTrueAndLog(
      commentId3 !== commentId4,
      "Two comments by the same user should have distinct IDs",
    );

    console.log(`${BLUE_ACTION}Verifying resource '${resourceA}' has both comments${RESET}`);
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertNotNullAndLog(storedResourceA, `Resource '${resourceA}' should exist.`);
    assertAndLog(
      storedResourceA?.comments.length,
      2,
      "Resource A should have two comments from the same user",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentId3),
      "Resource A should include commentId3",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentId4),
      "Resource A should include commentId4",
    );

    console.log(`${BLUE_ACTION}Verifying content of comment '${commentId3}'${RESET}`);
    const storedComment3 = await concept.comments.findOne({ _id: commentId3 });
    assertNotNullAndLog(storedComment3, `Comment '${commentId3}' should exist.`);
    assertAndLog(
      storedComment3?.commenter,
      user1,
      "Comment 3 commenter should be User 1",
    );
    assertAndLog(
      storedComment3?.text,
      "First thought.",
      "Comment 3 text should match",
    );

    console.log(`${BLUE_ACTION}Verifying content of comment '${commentId4}'${RESET}`);
    const storedComment4 = await concept.comments.findOne({ _id: commentId4 });
    assertNotNullAndLog(storedComment4, `Comment '${commentId4}' should exist.`);
    assertAndLog(
      storedComment4?.commenter,
      user1,
      "Comment 4 commenter should be User 1",
    );
    assertAndLog(
      storedComment4?.text,
      "Second thought.",
      "Comment 4 text should match",
    );

    await client.close();
    console.log(`\n${GREEN_CHECK}--- Finished Test Step 4 ---${RESET}`);
  });

  // Scenario: Adding comments with identical content (text, commenter, date) but expecting unique comments.
  await test.step("5. Scenario: Adding comments with identical content creates distinct entries", async () => {
    console.log(`\n${BLUE_ACTION}--- Starting Test Step 5: Identical content creates distinct comments ---${RESET}`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    console.log(`${BLUE_ACTION}Action: concept.register({ resource: '${resourceA}' })${RESET}`);
    const registerResult = await concept.register({ resource: resourceA });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(registerResult)}${RESET}`);
    assertAndLog(registerResult, {}, "Registration of resourceA should succeed");

    const commonDate = new Date("2023-03-01T09:00:00Z");
    const commonText = "Duplicate message test";

    console.log(
      `${BLUE_ACTION}Action: concept.addComment({ resource: '${resourceA}', commenter: '${user1}', text: '${commonText}', date: '${commonDate.toISOString()}' }) - First identical comment${RESET}`,
    );
    const commentResult5a = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: commonText,
      date: commonDate,
    });
    if ("error" in commentResult5a) {
      console.error(`${RED_X} Failed to add comment 5a: ${commentResult5a.error}`);
      throw new Error(commentResult5a.error);
    }
    const commentId5a = commentResult5a.comment;
    console.log(`${YELLOW_OUTPUT}Output: { comment: '${commentId5a}' }${RESET}`);

    console.log(
      `${BLUE_ACTION}Action: concept.addComment({ resource: '${resourceA}', commenter: '${user1}', text: '${commonText}', date: '${commonDate.toISOString()}' }) - Second identical comment${RESET}`,
    );
    const commentResult5b = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: commonText,
      date: commonDate,
    });
    if ("error" in commentResult5b) {
      console.error(`${RED_X} Failed to add comment 5b: ${commentResult5b.error}`);
      throw new Error(commentResult5b.error);
    }
    const commentId5b = commentResult5b.comment;
    console.log(`${YELLOW_OUTPUT}Output: { comment: '${commentId5b}' }${RESET}`);

    assertTrueAndLog(
      commentId5a !== commentId5b,
      "Identical comment content should still produce unique comment IDs",
    );

    console.log(`${BLUE_ACTION}Verifying resource '${resourceA}' has both distinct comments${RESET}`);
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertNotNullAndLog(storedResourceA, `Resource '${resourceA}' should exist.`);
    assertAndLog(
      storedResourceA?.comments.length,
      2,
      "Resource A should contain two comments",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentId5a),
      "Resource A should include commentId5a",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentId5b),
      "Resource A should include commentId5b",
    );

    console.log(`${BLUE_ACTION}Verifying content of comment '${commentId5a}'${RESET}`);
    const storedComment5a = await concept.comments.findOne({
      _id: commentId5a,
    });
    assertNotNullAndLog(storedComment5a, `Comment '${commentId5a}' should exist.`);
    assertAndLog(
      storedComment5a?.text,
      commonText,
      "First identical comment text should match",
    );
    assertAndLog(
      storedComment5a?.commenter,
      user1,
      "First identical comment commenter should match",
    );
    assertAndLog(
      storedComment5a?.date.getTime(),
      commonDate.getTime(),
      "First identical comment date should match",
    );

    console.log(`${BLUE_ACTION}Verifying content of comment '${commentId5b}'${RESET}`);
    const storedComment5b = await concept.comments.findOne({
      _id: commentId5b,
    });
    assertNotNullAndLog(storedComment5b, `Comment '${commentId5b}' should exist.`);
    assertAndLog(
      storedComment5b?.text,
      commonText,
      "Second identical comment text should match",
    );
    assertAndLog(
      storedComment5b?.commenter,
      user1,
      "Second identical comment commenter should match",
    );
    assertAndLog(
      storedComment5b?.date.getTime(),
      commonDate.getTime(),
      "Second identical comment date should match",
    );

    await client.close();
    console.log(`\n${GREEN_CHECK}--- Finished Test Step 5 ---${RESET}`);
  });

  // Scenario: `removeComment` precondition failures and successful removal
  await test.step("6. Scenario: removeComment precondition failures and successful removal", async () => {
    console.log(`\n${BLUE_ACTION}--- Starting Test Step 6: removeComment precondition failures and successful removal ---${RESET}`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    console.log(`${BLUE_ACTION}Setup: Register resource '${resourceA}' and add a comment for testing${RESET}`);
    const registerResult = await concept.register({ resource: resourceA });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(registerResult)}${RESET}`);
    assertAndLog(registerResult, {}, "Setup: Registration of resourceA should succeed");

    const date = new Date("2023-04-01T11:00:00Z");
    const addResult = await concept.addComment({
      resource: resourceA,
      commenter: user1,
      text: "Comment for removal tests",
      date: date,
    });
    if ("error" in addResult) {
      console.error(`${RED_X} Setup: Failed to add comment: ${addResult.error}`);
      throw new Error(addResult.error);
    }
    const commentIdToDelete = addResult.comment;
    console.log(`${YELLOW_OUTPUT}Output: { comment: '${commentIdToDelete}' }${RESET}`);
    console.log(`${GREEN_CHECK}Setup: Comment '${commentIdToDelete}' added by '${user1}'.${RESET}`);

    // Precondition 1 failure: `comment` does not exist
    const nonExistentCommentId = freshID();
    console.log(
      `${BLUE_ACTION}Action: concept.removeComment({ comment: '${nonExistentCommentId}' (non-existent), user: '${user1}' }) - Expected error${RESET}`,
    );
    const removeNonExistentResult = await concept.removeComment({
      comment: nonExistentCommentId,
      user: user1,
    });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(removeNonExistentResult)}${RESET}`);
    assertAndLog(
      removeNonExistentResult,
      { error: `Comment '${nonExistentCommentId}' not found.` },
      "Should return an error when attempting to remove a non-existent comment",
    );

    console.log(`${BLUE_ACTION}Verifying existing comment is still there and linked after failed non-existent removal${RESET}`);
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertNotNullAndLog(storedResourceA, `Resource '${resourceA}' should still exist.`);
    assertAndLog(
      storedResourceA?.comments.length,
      1,
      "Resource A should still have 1 comment after failed removal of non-existent",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentIdToDelete),
      "Resource A should still contain the original comment",
    );
    let storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    assertNotNullAndLog(storedComment, "Original comment should still exist");

    // Precondition 2 failure: `user` is not its `commenter`
    console.log(
      `${BLUE_ACTION}Action: concept.removeComment({ comment: '${commentIdToDelete}', user: '${user3}' (wrong user) }) - Expected error${RESET}`,
    );
    const removeWrongUserResult = await concept.removeComment({
      comment: commentIdToDelete,
      user: user3, // user3 is not user1
    });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(removeWrongUserResult)}${RESET}`);
    assertAndLog(
      removeWrongUserResult,
      {
        error:
          `User '${user3}' is not the commenter of comment '${commentIdToDelete}'.`,
      },
      "Should return an error when a different user attempts to remove a comment",
    );

    console.log(`${BLUE_ACTION}Verifying existing comment is still there and linked after failed wrong-user removal${RESET}`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertNotNullAndLog(storedResourceA, `Resource '${resourceA}' should still exist.`);
    assertAndLog(
      storedResourceA?.comments.length,
      1,
      "Resource A should still have 1 comment after failed removal by wrong user",
    );
    assertTrueAndLog(
      storedResourceA?.comments.includes(commentIdToDelete),
      "Resource A should still contain the original comment",
    );
    storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    assertNotNullAndLog(storedComment, "Original comment should still exist");

    // Successful removal (using the correct user)
    console.log(
      `${BLUE_ACTION}Action: concept.removeComment({ comment: '${commentIdToDelete}', user: '${user1}' }) - Successful removal${RESET}`,
    );
    const removeSuccessResult = await concept.removeComment({
      comment: commentIdToDelete,
      user: user1,
    });
    console.log(`${YELLOW_OUTPUT}Output: ${JSON.stringify(removeSuccessResult)}${RESET}`);
    assertAndLog(
      removeSuccessResult,
      {},
      "Should successfully remove the comment by its rightful commenter",
    );

    console.log(`${BLUE_ACTION}Verifying comment '${commentIdToDelete}' is truly gone after successful removal${RESET}`);
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertNotNullAndLog(storedResourceA, `Resource '${resourceA}' should still exist.`);
    assertAndLog(
      storedResourceA?.comments.length,
      0,
      "Resource A should have 0 comments after successful removal",
    );
    assertAndLog(
      storedResourceA?.comments.includes(commentIdToDelete),
      false,
      "Resource A should no longer contain the removed comment",
    );
    storedComment = await concept.comments.findOne({
      _id: commentIdToDelete,
    });
    assertNullAndLog(
      storedComment,
      "The comment document should be deleted from the comments collection",
    );

    await client.close();
    console.log(`\n${GREEN_CHECK}--- Finished Test Step 6 ---${RESET}`);
  });
});

```
