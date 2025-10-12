---
timestamp: 'Sun Oct 12 2025 16:59:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_165945.b86139d6.md]]'
content_id: 3317f6f8c2b9a7ee3138fad96bd056f998a524987fea95e280355d021da30fb7
---

# response:

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
 *   a `dateTime`
 */
interface CommentsCollection {
  _id: CommentID;
  text: string;
  commenter: User;
  dateTime: Date; // Using Date for dateTime as per common practice
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
}
```
