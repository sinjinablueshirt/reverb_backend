---
timestamp: 'Sun Oct 12 2025 17:04:59 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_170459.bd19db6b.md]]'
content_id: 4fb0a2347ce568860830d092726500979de9fa8892be0e82941413e0efcf35b5
---

# response:

```typescript
  /**
   * addComment(resource: Resource, commenter: User, text: string, dateTime: Date): (comment: CommentID)
   *   requires: the `resource` is registered
   *   effects: creates and saves a new `comment` made by `commenter` with `text` made at `dateTime` under the `resource`. Returns the newly made `comment`
   */
  async addComment({
    resource,
    commenter,
    text,
    dateTime,
  }: {
    resource: Resource;
    commenter: User;
    text: string;
    dateTime: Date;
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
      dateTime,
    });

    // Effect: updates the `resource` to include the new comment ID
    await this.resources.updateOne(
      { _id: resource },
      { $push: { comments: newCommentId } }
    );

    // Returns the newly made `comment` ID
    return { comment: newCommentId };
  }
```
