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
   * removeComment(comment: CommentID)
   *   requires: `comment` exists
   *   effects: removes the `comment` from the `resource` it is bound to and deletes it
   */
  async removeComment({
    comment,
  }: {
    comment: CommentID;
  }): Promise<Empty | { error: string }> {
    // Precondition: `comment` exists
    const existingComment = await this.comments.findOne({ _id: comment });
    if (!existingComment) {
      return { error: `Comment '${comment}' does not exist.` };
    }

    // Effect: removes the `comment` from the `resource` it is bound to
    // Find the resource that contains this comment
    const updateResult = await this.resources.updateOne(
      { comments: comment }, // Find a resource where `comments` array contains this `comment` ID
      { $pull: { comments: comment } }, // Remove the `comment` ID from that resource's array
    );

    // It's possible the comment exists but isn't associated with any resource (e.g., if resource was deleted separately)
    // We proceed to delete the comment itself regardless.

    // Effect: deletes the `comment` itself
    await this.comments.deleteOne({ _id: comment });

    return {};
  }
}
