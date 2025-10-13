---
timestamp: 'Sun Oct 12 2025 19:17:56 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_191756.3466ec81.md]]'
content_id: 6126f4cccc31b18a33b9707ced6b4791c73c8b4c3e06c50978e842041659df35
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
    * **requires**: `comment` exists and `user` is its `commenter`
    * **effects**: removes the `comment` from the `resource` it is bound to and deletes it
