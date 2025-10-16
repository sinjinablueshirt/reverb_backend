---
timestamp: 'Thu Oct 16 2025 17:37:49 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_173749.fe434a70.md]]'
content_id: 916f1397869be4ab567e75eeef239ba854085afd828d75be73c3a56e1c7d57b4
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
  console.log(`  IDs for test run:`);
  console.log(`    Resource A: ${resourceA}`);
  console.log(`    Resource B (unregistered): ${resourceB}`);
  console.log(`    User 1: ${user1}`);
  console.log(`    User 2: ${user2}`);
  console.log(`    User 3: ${user3}\n`);

  // # trace: Operational Principle: Register a resource and add multiple comments, then delete one.
  await test.step("1. Operational Principle: Register, Add Multiple, Delete One", async () => {
    console.log(`\n--- Step 1: Operational Principle Test ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: register(resourceA)
    console.log(`  Action: Registering resource '${resourceA}'.`);
    const registerResult = await concept.register({ resource: resourceA });
    assertEquals(registerResult, {}, `Resource '${resourceA}' should be registered successfully.`);
    console.log(`  Output: ${JSON.stringify(registerResult)} ✅ Resource '${resourceA}' registered.`);

    // Verify initial state: resourceA registered, comments empty
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 0, "Resource A should have 0 comments after registration.");
    console.log(`  Verification: Resource '${resourceA}' has 0 comments. ✅`);

    // Action: addComment(resourceA, user1, "First comment!", date1)
    console.log(`  Action: User '${user1}' adding first comment to '${resourceA}'.`);
    const date1 = new Date("2023-01-01T10:00:00Z");
    const addCommentResult1 = await concept.addComment({ resource: resourceA, commenter: user1, text: "First comment!", date: date1 });
    if ("error" in addCommentResult1) throw new Error(`Failed to add first comment: ${addCommentResult1.error}`);
    const commentId1 = addCommentResult1.comment;
    assertEquals(typeof commentId1, "string", "Should return a valid ID for the first comment.");
    console.log(`  Output: Comment ID ${commentId1} created. ✅`);

    // Action: addComment(resourceA, user2, "Second comment.", date2)
    console.log(`  Action: User '${user2}' adding second comment to '${resourceA}'.`);
    const date2 = new Date("2023-01-01T10:05:00Z");
    const addCommentResult2 = await concept.addComment({ resource: resourceA, commenter: user2, text: "Second comment by another user.", date: date2 });
    if ("error" in addCommentResult2) throw new Error(`Failed to add second comment: ${addCommentResult2.error}`);
    const commentId2 = addCommentResult2.comment;
    assertEquals(typeof commentId2, "string", "Should return a valid ID for the second comment.");
    assertEquals(commentId1 !== commentId2, true, "Comment IDs should be unique for different comments.");
    console.log(`  Output: Comment ID ${commentId2} created. ✅ Both comments have unique IDs.`);

    // Verify resourceA now has both comments associated
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 2, "Resource A should have 2 comments after adding two.");
    assertEquals(storedResourceA?.comments.includes(commentId1), true, `Resource A should contain commentId1 (${commentId1}).`);
    assertEquals(storedResourceA?.comments.includes(commentId2), true, `Resource A should contain commentId2 (${commentId2}).`);
    console.log(`  Verification: Resource '${resourceA}' now lists both comments. ✅`);

    // Verify comments data
    const storedComment1 = await concept.comments.findOne({ _id: commentId1 });
    assertEquals(storedComment1?.text, "First comment!", "Comment 1 text should match.");
    assertEquals(storedComment1?.commenter, user1, "Comment 1 commenter should match.");
    assertEquals(storedComment1?.date.getTime(), date1.getTime(), "Comment 1 date should match.");
    console.log(`  Verification: Details for comment '${commentId1}' are correct. ✅`);

    const storedComment2 = await concept.comments.findOne({ _id: commentId2 });
    assertEquals(storedComment2?.text, "Second comment by another user.", "Comment 2 text should match.");
    assertEquals(storedComment2?.commenter, user2, "Comment 2 commenter should match.");
    assertEquals(storedComment2?.date.getTime(), date2.getTime(), "Comment 2 date should match.");
    console.log(`  Verification: Details for comment '${commentId2}' are correct. ✅`);

    // Action: removeComment(commentId1, user1)
    console.log(`  Action: User '${user1}' removing comment '${commentId1}'.`);
    const removeCommentResult1 = await concept.removeComment({ comment: commentId1, user: user1 });
    assertEquals(removeCommentResult1, {}, `Comment '${commentId1}' should be successfully removed by its commenter.`);
    console.log(`  Output: Comment '${commentId1}' removed. ✅`);

    // Verify state after deletion:
    // 1. commentId1 should no longer be in resourceA's comments array
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 1, "Resource A should have 1 comment after deleting one.");
    assertEquals(storedResourceA?.comments.includes(commentId1), false, "Resource A should NOT contain commentId1 after deletion.");
    assertEquals(storedResourceA?.comments.includes(commentId2), true, "Resource A should still contain commentId2 after commentId1 deletion.");
    console.log(`  Verification: Resource '${resourceA}' now lists 1 comment (${commentId2}). ✅`);

    // 2. commentId1 should be deleted from the comments collection
    const deletedComment1 = await concept.comments.findOne({ _id: commentId1 });
    assertEquals(deletedComment1, null, `Comment '${commentId1}' should be deleted from the collection.`);
    console.log(`  Verification: Comment '${commentId1}' document is deleted. ✅`);

    // 3. commentId2 (the other comment) should still exist
    const stillExistingComment2 = await concept.comments.findOne({ _id: commentId2 });
    assertEquals(stillExistingComment2?.text, "Second comment by another user.", "Comment 2 should still exist and its text should match.");
    console.log(`  Verification: Comment '${commentId2}' still exists and is intact. ✅`);

    await client.close();
    console.log(`✅ Step 1: Operational Principle Test Completed Successfully.`);
  });

  // Scenario: Attempt to register an already registered resource
  await test.step("2. Scenario: Registering an already registered resource", async () => {
    console.log(`\n--- Step 2: Registering an already registered resource ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Setup: Register resourceA
    console.log(`  Setup: Registering resource '${resourceA}'.`);
    await concept.register({ resource: resourceA });
    console.log(`  Setup: Resource '${resourceA}' is now registered.`);

    // Action: register(resourceA) - Second time
    console.log(`  Action: Attempting to re-register resource '${resourceA}'.`);
    const registerResult = await concept.register({ resource: resourceA });
    assertEquals(
      registerResult,
      { error: `Resource '${resourceA}' is already registered.` },
      "Should return an error when registering an already registered resource.",
    );
    console.log(`  Output: ${JSON.stringify(registerResult)} ❌ (Expected error for re-registration).`);

    // Verify state remains unchanged (still 0 comments as none were added)
    const storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 0, "Resource A comments should still be 0 after failed re-registration.");
    console.log(`  Verification: Resource '${resourceA}' state unchanged (0 comments). ✅`);

    await client.close();
    console.log(`✅ Step 2: Scenario Test Completed Successfully.`);
  });

  // Scenario: Attempt to add a comment to an unregistered resource
  await test.step("3. Scenario: Adding a comment to an unregistered resource", async () => {
    console.log(`\n--- Step 3: Adding comment to unregistered resource ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Action: addComment(resourceB, user1, "Comment on unregistered.", date)
    console.log(`  Action: Attempting to add comment by '${user1}' to unregistered resource '${resourceB}'.`);
    const date = new Date();
    const addCommentResult = await concept.addComment({ resource: resourceB, commenter: user1, text: "This comment should not be added.", date: date });

    assertEquals(
      addCommentResult,
      { error: `Resource '${resourceB}' is not registered.` },
      "Should return an error when attempting to add a comment to an unregistered resource.",
    );
    console.log(`  Output: ${JSON.stringify(addCommentResult)} ❌ (Expected error as resource is not registered).`);

    // Verify no comment was created and resourceB is not registered
    const commentsCount = await concept.comments.countDocuments();
    assertEquals(commentsCount, 0, "No comment should have been created in the comments collection.");
    const storedResourceB = await concept.resources.findOne({ _id: resourceB });
    assertEquals(storedResourceB, null, "Resource B should not be present in the resources collection.");
    console.log(`  Verification: No comment created, and resource '${resourceB}' remains unregistered. ✅`);

    await client.close();
    console.log(`✅ Step 3: Scenario Test Completed Successfully.`);
  });

  // Scenario: Add multiple comments from the same user to the same resource.
  await test.step("4. Scenario: Multiple comments from the same user on the same resource", async () => {
    console.log(`\n--- Step 4: Multiple comments by same user on same resource ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Setup: Register resourceA
    console.log(`  Setup: Registering resource '${resourceA}'.`);
    await concept.register({ resource: resourceA });
    console.log(`  Setup: Resource '${resourceA}' is now registered.`);

    // Action: addComment(resourceA, user1, "First thought.", date3)
    console.log(`  Action: User '${user1}' adding first comment to '${resourceA}'.`);
    const date3 = new Date("2023-02-01T12:00:00Z");
    const commentResult3 = await concept.addComment({ resource: resourceA, commenter: user1, text: "First thought.", date: date3 });
    if ("error" in commentResult3) throw new Error(commentResult3.error);
    const commentId3 = commentResult3.comment;
    console.log(`  Output: Comment ID ${commentId3} created. ✅`);

    // Action: addComment(resourceA, user1, "Second thought.", date4)
    console.log(`  Action: User '${user1}' adding second comment to '${resourceA}'.`);
    const date4 = new Date("2023-02-01T12:15:00Z");
    const commentResult4 = await concept.addComment({ resource: resourceA, commenter: user1, text: "Second thought.", date: date4 });
    if ("error" in commentResult4) throw new Error(commentResult4.error);
    const commentId4 = commentResult4.comment;
    console.log(`  Output: Comment ID ${commentId4} created. ✅`);

    assertEquals(commentId3 !== commentId4, true, "Two comments by the same user should have distinct IDs.");
    console.log(`  Verification: Comment IDs ${commentId3} and ${commentId4} are distinct. ✅`);

    // Verify resource A has both comments
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 2, "Resource A should have two comments from the same user.");
    assertEquals(storedResourceA?.comments.includes(commentId3), true, `Resource A should include commentId3 (${commentId3}).`);
    assertEquals(storedResourceA?.comments.includes(commentId4), true, `Resource A should include commentId4 (${commentId4}).`);
    console.log(`  Verification: Resource '${resourceA}' now lists both comments by '${user1}'. ✅`);

    await client.close();
    console.log(`✅ Step 4: Scenario Test Completed Successfully.`);
  });

  // Scenario: Adding comments with identical content (text, commenter, date) but expecting unique comments.
  await test.step("5. Scenario: Identical content creates distinct entries", async () => {
    console.log(`\n--- Step 5: Identical content, distinct comments ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Setup: Register resourceA
    console.log(`  Setup: Registering resource '${resourceA}'.`);
    await concept.register({ resource: resourceA });
    console.log(`  Setup: Resource '${resourceA}' is now registered.`);

    const commonDate = new Date("2023-03-01T09:00:00Z");
    const commonText = "Duplicate message test";

    // Action: addComment with identical content - First instance
    console.log(`  Action: User '${user1}' adding first comment with text: "${commonText}".`);
    const commentResult5a = await concept.addComment({ resource: resourceA, commenter: user1, text: commonText, date: commonDate });
    if ("error" in commentResult5a) throw new Error(commentResult5a.error);
    const commentId5a = commentResult5a.comment;
    console.log(`  Output: Comment ID ${commentId5a} created. ✅`);

    // Action: addComment with identical content - Second instance
    console.log(`  Action: User '${user1}' adding second comment with identical text: "${commonText}".`);
    const commentResult5b = await concept.addComment({ resource: resourceA, commenter: user1, text: commonText, date: commonDate });
    if ("error" in commentResult5b) throw new Error(commentResult5b.error);
    const commentId5b = commentResult5b.comment;
    console.log(`  Output: Comment ID ${commentId5b} created. ✅`);

    // Verify that even with identical content, two distinct comment IDs are generated
    assertEquals(commentId5a !== commentId5b, true, "Identical comment content should still produce unique comment IDs.");
    console.log(`  Verification: Comment IDs ${commentId5a} and ${commentId5b} are distinct despite identical content. ✅`);

    // Verify resourceA has both comments
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 2, "Resource A should contain two comments.");
    assertEquals(storedResourceA?.comments.includes(commentId5a), true, `Resource A should include commentId5a (${commentId5a}).`);
    assertEquals(storedResourceA?.comments.includes(commentId5b), true, `Resource A should include commentId5b (${commentId5b}).`);
    console.log(`  Verification: Resource '${resourceA}' lists both distinct comments. ✅`);

    await client.close();
    console.log(`✅ Step 5: Scenario Test Completed Successfully.`);
  });

  // Scenario: `removeComment` precondition failures and successful removal
  await test.step("6. Scenario: removeComment precondition failures and successful removal", async () => {
    console.log(`\n--- Step 6: removeComment precondition failures and success ---`);
    [db, client] = await testDb();
    concept = new CommentConcept(db);

    // Setup: Register resource and add a comment
    console.log(`  Setup: Registering resource '${resourceA}' and adding a comment for removal tests.`);
    await concept.register({ resource: resourceA });
    const date = new Date("2023-04-01T11:00:00Z");
    const addResult = await concept.addComment({ resource: resourceA, commenter: user1, text: "Comment for removal tests", date: date });
    if ("error" in addResult) throw new Error(addResult.error);
    const commentIdToDelete = addResult.comment;
    console.log(`  Setup: Comment ID ${commentIdToDelete} added by '${user1}'.`);

    // Precondition 1 failure: `comment` does not exist
    const nonExistentCommentId = freshID();
    console.log(`  Action: Attempting to remove non-existent comment '${nonExistentCommentId}' by '${user1}'.`);
    const removeNonExistentResult = await concept.removeComment({ comment: nonExistentCommentId, user: user1 });
    assertEquals(
      removeNonExistentResult,
      { error: `Comment '${nonExistentCommentId}' not found.` },
      "Should return an error when attempting to remove a non-existent comment.",
    );
    console.log(`  Output: ${JSON.stringify(removeNonExistentResult)} ❌ (Expected error: comment not found).`);

    // Verify existing comment is still there and linked
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 1, "Resource A should still have 1 comment after failed removal of non-existent.");
    assertEquals(storedResourceA?.comments.includes(commentIdToDelete), true, "Resource A should still contain the original comment.");
    console.log(`  Verification: Original comment '${commentIdToDelete}' is still present. ✅`);

    // Precondition 2 failure: `user` is not its `commenter`
    console.log(`  Action: Attempting to remove comment '${commentIdToDelete}' by wrong user '${user3}'.`);
    const removeWrongUserResult = await concept.removeComment({ comment: commentIdToDelete, user: user3 }); // user3 is not user1
    assertEquals(
      removeWrongUserResult,
      { error: `User '${user3}' is not the commenter of comment '${commentIdToDelete}'.` },
      "Should return an error when a different user attempts to remove a comment.",
    );
    console.log(`  Output: ${JSON.stringify(removeWrongUserResult)} ❌ (Expected error: wrong commenter).`);

    // Verify existing comment is still there and linked after wrong-user attempt
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 1, "Resource A should still have 1 comment after failed removal by wrong user.");
    assertEquals(storedResourceA?.comments.includes(commentIdToDelete), true, "Resource A should still contain the original comment.");
    console.log(`  Verification: Original comment '${commentIdToDelete}' is still present. ✅`);

    // Successful removal (using the correct user)
    console.log(`  Action: Successfully removing comment '${commentIdToDelete}' by correct user '${user1}'.`);
    const removeSuccessResult = await concept.removeComment({ comment: commentIdToDelete, user: user1 });
    assertEquals(removeSuccessResult, {}, "Should successfully remove the comment by its rightful commenter.");
    console.log(`  Output: ${JSON.stringify(removeSuccessResult)} ✅ (Comment successfully removed).`);

    // Verify comment is truly gone from resource and comments collection
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(storedResourceA?.comments.length, 0, "Resource A should have 0 comments after successful removal.");
    assertEquals(storedResourceA?.comments.includes(commentIdToDelete), false, "Resource A should no longer contain the removed comment.");
    const storedComment = await concept.comments.findOne({ _id: commentIdToDelete });
    assertEquals(storedComment, null, "The comment document should be deleted from the comments collection.");
    console.log(`  Verification: Comment '${commentIdToDelete}' is fully removed from resource and collection. ✅`);

    await client.close();
    console.log(`✅ Step 6: Scenario Test Completed Successfully.`);
  });
  console.log(`\n--- Test Suite End: CommentConcept ---`);
});
```
