import { assertEquals } from "jsr:@std/assert";
import { Db, MongoClient } from "npm:mongodb";
import { testDb } from "@utils/database.ts";
import CommentConcept from "./CommentConcept.ts";
import { freshID } from "@utils/database.ts";

Deno.test("CommentConcept: Full functionality and scenarios", async (test) => {
  let db: Db;
  let client: MongoClient;
  let concept: CommentConcept;

  // Define consistent IDs for resources and users to be used across tests for clarity
  const resourceA = freshID();
  const resourceB = freshID(); // For unregistered resource scenarios
  const user1 = freshID();
  const user2 = freshID();

  // # trace: Operational Principle: Register a resource, add multiple comments, and remove comments.
  await test.step("1. Operational Principle: Register, add, and remove comments", async () => {
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

    // Verify principle: resourceA now has both comments associated
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

    // Action: removeComment(commentId1)
    // Requires: commentId1 exists (satisfied)
    // Effects: removes commentId1 from resourceA and deletes commentId1 document
    const removeResult1 = await concept.removeComment({ comment: commentId1 });
    assertEquals(removeResult1, {}, "Should successfully remove commentId1");

    // Verify state after removing comment1
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      1,
      "Resource A should have 1 comment after removing one",
    );
    assertEquals(
      !storedResourceA?.comments.includes(commentId1),
      true,
      "Resource A should NOT contain commentId1",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId2),
      true,
      "Resource A should still contain commentId2",
    );

    const checkComment1Deleted = await concept.comments.findOne({
      _id: commentId1,
    });
    assertEquals(
      checkComment1Deleted,
      null,
      "Comment 1 document should be deleted from the comments collection",
    );

    // Action: removeComment(commentId2)
    // Requires: commentId2 exists (satisfied)
    // Effects: removes commentId2 from resourceA and deletes commentId2 document
    const removeResult2 = await concept.removeComment({ comment: commentId2 });
    assertEquals(removeResult2, {}, "Should successfully remove commentId2");

    // Verify final state after removing all comments
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      0,
      "Resource A should have 0 comments after removing all",
    );
    const checkComment2Deleted = await concept.comments.findOne({
      _id: commentId2,
    });
    assertEquals(
      checkComment2Deleted,
      null,
      "Comment 2 document should be deleted from the comments collection",
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

  // Scenario: Add multiple comments from the same user to the same resource, then remove one.
  await test.step("4. Scenario: Multiple comments from same user, then partial removal and invalid removal attempt", async () => {
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
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
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

    // Action: removeComment(commentId3)
    const removeResult3 = await concept.removeComment({ comment: commentId3 });
    assertEquals(removeResult3, {}, "Should successfully remove commentId3");

    // Verify state after removing comment3
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      1,
      "Resource A should have 1 comment after removing one",
    );
    assertEquals(
      !storedResourceA?.comments.includes(commentId3),
      true,
      "Resource A should NOT contain commentId3",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId4),
      true,
      "Resource A should still contain commentId4",
    );
    const checkComment3Deleted = await concept.comments.findOne({
      _id: commentId3,
    });
    assertEquals(
      checkComment3Deleted,
      null,
      "Comment 3 document should be deleted from the comments collection",
    );

    // Action: removeComment(nonExistentComment)
    // Requires: comment exists (not satisfied)
    // Expected: error
    const nonExistentCommentId = freshID();
    const removeNonExistentResult = await concept.removeComment({
      comment: nonExistentCommentId,
    });
    assertEquals(
      removeNonExistentResult,
      { error: `Comment '${nonExistentCommentId}' does not exist.` },
      "Should return an error when attempting to remove a non-existent comment",
    );

    // Verify state is unchanged after failed removal
    const commentsCountAfterFailedRemove = await concept.comments
      .countDocuments();
    assertEquals(
      commentsCountAfterFailedRemove,
      1, // Only commentId4 remains
      "Comments count should remain 1 after attempting to remove non-existent comment",
    );
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      1,
      "Resource A comments count should remain 1 after attempting to remove non-existent comment",
    );

    await client.close();
  });

  // Scenario: Adding comments with identical content (text, commenter, date) but expecting unique comments, then removing them.
  await test.step("5. Scenario: Adding identical content comments and removing them one by one", async () => {
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
    let storedResourceA = await concept.resources.findOne({ _id: resourceA });
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

    // Action: removeComment(commentId5a)
    const removeResult5a = await concept.removeComment({
      comment: commentId5a,
    });
    assertEquals(removeResult5a, {}, "Should successfully remove commentId5a");

    // Verify state after removing comment5a
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      1,
      "Resource A should have 1 comment after removing one identical comment",
    );
    assertEquals(
      !storedResourceA?.comments.includes(commentId5a),
      true,
      "Resource A should NOT contain commentId5a",
    );
    assertEquals(
      storedResourceA?.comments.includes(commentId5b),
      true,
      "Resource A should still contain commentId5b",
    );
    const checkComment5aDeleted = await concept.comments.findOne({
      _id: commentId5a,
    });
    assertEquals(
      checkComment5aDeleted,
      null,
      "Comment 5a document should be deleted from the comments collection",
    );

    // Action: removeComment(commentId5b)
    const removeResult5b = await concept.removeComment({
      comment: commentId5b,
    });
    assertEquals(removeResult5b, {}, "Should successfully remove commentId5b");

    // Verify final state after removing all identical comments
    storedResourceA = await concept.resources.findOne({ _id: resourceA });
    assertEquals(
      storedResourceA?.comments.length,
      0,
      "Resource A should have 0 comments after removing all identical comments",
    );
    const checkComment5bDeleted = await concept.comments.findOne({
      _id: commentId5b,
    });
    assertEquals(
      checkComment5bDeleted,
      null,
      "Comment 5b document should be deleted from the comments collection",
    );

    await client.close();
  });
});
