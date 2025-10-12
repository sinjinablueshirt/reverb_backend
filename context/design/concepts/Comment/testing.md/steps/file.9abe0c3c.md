---
timestamp: 'Sun Oct 12 2025 12:56:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_125653.a36dffe2.md]]'
content_id: 9abe0c3c2eb827c3e4248753f5027959dcbcbc6aeff3d1dd259aea6355b20a1a
---

# file: src/concepts/Comment/CommentConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "Comment" + ".";

// Generic types of this concept
type User = ID;
type Resource = ID;
type Comment = ID; // Comments are also identified by an ID

/**
 * a set of Resources with
 *   a comments set of Comment
 */
interface ResourceState {
  _id: Resource;
  comments: Comment[];
}

/**
 * a set of Comments with
 *   a text of type string
 *   a commenter of type User
 *   a dateTime of type string (using ISO string for dates)
 */
interface CommentState {
  _id: Comment;
  text: string;
  commenter: User;
  dateTime: string; // ISO 8601 string representation of date/time
  resourceId: Resource; // Link back to the resource this comment belongs to
}

/**
 * @concept Comment [User, Resource, DateTime]
 * @purpose to allow users to associate messages with Resources so that discussions and feedback can be preserved.
 * @principle once a resource is registered, users may add comments to the object and delete comments.
 */
export default class CommentConcept {
  resources: Collection<ResourceState>;
  comments: Collection<CommentState>;

  constructor(private readonly db: Db) {
    this.resources = this.db.collection(PREFIX + "resources");
    this.comments = this.db.collection(PREFIX + "comments");
  }

  /**
   * @action register
   * @requires the resource isn't already registered
   * @effects saves the resource with an empty set comments
   */
  async register(
    { resource, owner }: { resource: Resource; owner: User }, // 'owner' is part of the action signature but not stored in this concept's state.
  ): Promise<Empty | { error: string }> {
    // Check precondition: the resource isn't already registered
    const existingResource = await this.resources.findOne({ _id: resource });
    if (existingResource) {
      return { error: `Resource '${resource}' is already registered.` };
    }

    // Effect: saves the resource with an empty set comments
    // Note: The 'owner' parameter is not explicitly part of the state definition for Resource
    // within this concept, so it's not stored here. It might be used by a sync or another concept.
    await this.resources.insertOne({
      _id: resource,
      comments: [],
    });

    return {};
  }
}

```
