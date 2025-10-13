---
timestamp: 'Sun Oct 12 2025 19:11:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_191139.87bd012f.md]]'
content_id: 15c1d804976f50d02d6073cb1dfb4de9c1ef2b6f12bee100e78be01a18ed14f4
---

# Concept: Comment\[User, Resource, Date]

* **purpose**: to allow users to associate messages with Resources so that discussions and feedback can be preserved.

* **principle**: once a resource is registered, users may add comments to the object and delete comments.

* **state**
  * a set of `Resource`
    * a `comments` set of `Comment`

  * a set of `Comment` with
    * a `text` of type `string`
    * a `commenter` of type `User`
    * a `Date`

* **actions**
  * `register(resource: Resource)`
    * **requires**: the `resource` isn't already registered\\
    * **effects**: saves the `resource` with an empty set `comments`

  * `addComment(resource: Resource, commenter: User, text: string, date: Date): (comment: Comment)`
    * **requires**: the `resource` is registered\\
    * **effects**: creates and saves a new `comment` made by `commenter` with `text` made at `date` under the `resource`. Returns the newly made `comment`

  * `removeComment(comment: Comment, user: User)`
    * **requires**: `comment` exists and `user` is its `owner`
    * **effects**: removes the `comment` from the `resource` it is bound to and deletes it
