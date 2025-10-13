---
timestamp: 'Sun Oct 12 2025 19:17:18 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_191718.69fd06e4.md]]'
content_id: 07abf223fe8d7d86aca6478cb1f817bd8fe3ee27b7818c60242a8e791a8bc137
---

# file: src/concepts/Comment/CommentConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts"; // Assuming freshID is for creating new IDs for documents

// Declare collection prefix, use concept name
const PREFIX = "Comment" + ".";

// Generic types of this concept
type User = ID;
type Resource = ID;
type CommentID = ID; // Renamed to avoid conflict with 'Comment' interface

/**
 * a set of `Resource`
 *   a `comments` set of `CommentID`
 */
interface ResourcesCollection {
  _id: Resource;
  comments: CommentID[];
}

/**
 * a set of `Comment` with
 *   a `text` of type `string`
 *   a `commenter` of type `User`
 *   a `date`
 */
interface CommentsCollection {
  _id: CommentID;
  text: string;
  commenter: User;
  date: Date; // Using Date for date as per common practice
}

export default class CommentConcept {
  resources: Collection<ResourcesCollection>;
  comments: Collection<CommentsCollection>;

  constructor(private readonly db: Db) {
    this.resources = this.db.collection(PREFIX + "resources");
    this.comments = this.db.collection(PREFIX + "comments");
  }

  /**
   * register(resource: Resource)
   *   requires: the `resource` isn't already registered
   *   effects: saves the `resource` with an empty set `comments`
   */
  async register({
    resource,
  }: {
    resource: Resource;
  }): Promise<Empty | { error: string }> {
    // Check precondition: the resource isn't already registered
    const existingResource = await this.resources.findOne({ _id: resource });
    if (existingResource) {
      return { error: `Resource '${resource}' is already registered.` };
    }

    // Effect: saves the resource with an empty set `comments`
    await this.resources.insertOne({
      _id: resource,
      comments: [],
    });

    return {};
  }

  /**
   * addComment(resource: Resource, commenter: User, text: string, date: Date): (comment: CommentID)
   *   requires: the `resource` is registered
   *   effects: creates and saves a new `comment` made by `commenter` with `text` made at `date` under the `resource`. Returns the newly made `comment`
   */
  async addComment({
    resource,
    commenter,
    text,
    date,
  }: {
    resource: Resource;
    commenter: User;
    text: string;
    date: Date;
  }): Promise<{ comment: CommentID } | { error: string }> {
    // Precondition: the `resource` is registered
    const existingResource = await this.resources.findOne({ _id: resource });
    if (!existingResource) {
      return { error: `Resource '${resource}' is not registered.` };
    }

    // Effect: creates and saves a new `comment`
    const newCommentId = freshID();
    await this.comments.insertOne({
      _id: newCommentId,
      text,
      commenter,
      date,
    });

    // Effect: updates the `resource` to include the new comment ID
    await this.resources.updateOne(
      { _id: resource },
      { $push: { comments: newCommentId } },
    );

    // Returns the newly made `comment` ID
    return { comment: newCommentId };
  }
  /**
   * removeComment(comment: CommentID, user: User)
   *   requires: `comment` exists and `user` is its `commenter`
   *   effects: removes the `comment` from the `resource` it is bound to and deletes it
   */
  async removeComment({
    comment: commentId,
    user,
  }: {
    comment: CommentID;
    user: User;
  }): Promise<Empty | { error: string }> {
    // Precondition 1: `comment` exists
    const existingComment = await this.comments.findOne({ _id: commentId });
    if (!existingComment) {
      return { error: `Comment '${commentId}' not found.` };
    }

    // Precondition 2: `user` is its `commenter`
    if (existingComment.commenter !== user) {
      return {
        error: `User '${user}' is not the commenter of comment '${commentId}'.`,
      };
    }

    // Effect 1: Find the resource containing this comment and remove it from its comments array
    const updateResult = await this.resources.updateOne(
      { comments: commentId }, // Find the resource that has this comment ID
      { $pull: { comments: commentId } }, // Remove the comment ID from its array
    );

    // If no resource was found or updated, it means the comment might be orphaned or an integrity issue
    // For this concept's strictness, we'll return an error if the parent resource isn't found/updated
    if (updateResult.matchedCount === 0) {
      // This implies an inconsistent state, as the comment exists but isn't linked to any resource.
      // Depending on strictness, one might still delete the comment itself.
      // For now, let's assume it *must* be linked and report an error if not found.
      return {
        error:
          `Comment '${commentId}' found, but not linked to any registered resource.`,
      };
    }

    // Effect 2: Delete the `comment` itself
    const deleteResult = await this.comments.deleteOne({ _id: commentId });

    if (deleteResult.deletedCount === 0) {
      // This should ideally not happen if findOne above passed, but good for robustness
      return { error: `Failed to delete comment '${commentId}'.` };
    }

    return {};
  }
}

```
