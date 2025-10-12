---
timestamp: 'Sun Oct 12 2025 17:09:47 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_170947.79188595.md]]'
content_id: 3df62d6c31457fc1e9656d24fedc39f943c08e9eb1dbb6a9c8691205900dc0fb
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

  * `removeComment(comment: Comment)`
    * **requires**: `comment` exists
    * **effects**: removes the `comment` from the `resource` it is bound to and deletes it
