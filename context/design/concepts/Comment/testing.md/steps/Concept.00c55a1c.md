---
timestamp: 'Sun Oct 12 2025 17:01:07 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_170107.62b157c4.md]]'
content_id: 00c55a1c34815c5fc4cfbd1ac8974f70ceedbbdb100c92b5919e04fd2f08f378
---

# Concept: Comment\[User, Resource, dateTime]

* **purpose**: to allow users to associate messages with Resources so that discussions and feedback can be preserved.

* **principle**: once a resource is registered, users may add comments to the object and delete comments.

* **state**
  * a set of `Resource`
    * a `comments` set of `Comment`

  * a set of `Comment` with
    * a `text` of type `string`
    * a `commenter` of type `User`
    * a `dateTime`

* **actions**
  * `register(resource: Resource)`
    * **requires**: the `resource` isn't already registered\\
    * **effects**: saves the `resource` with an empty set `comments`

  * `addComment(resource: Resource, commenter: User, text: string, dateTime: dateTime): (comment: Comment)`
    * **requires**: the `resource` is registered\\
    * **effects**: creates and saves a new `comment` made by `commenter` with `text` made at `dateTime` under the `resource`. Returns the newly made `comment`

  * `removeComment(comment: Comment)`
    * **requires**: `comment` exists
    * **effects**: removes the `comment` from the `resource` it is bound to and deletes it
