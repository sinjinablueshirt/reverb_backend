---
timestamp: 'Sun Oct 12 2025 12:54:38 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_125438.75f41fe5.md]]'
content_id: 16c61f8892e598003ca1a06ec6f1f6070de278101c89a43a71359a03b97c0cf7
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
  * `register(resource: Resource, owner: User)`
    * **requires**: the `resource` isn't already registered\\
    * **effects**: saves the `resource` with an empty set `comments`

  * `addComment(resource: Resource, commenter: User, text: string, dateTime: dateTime): (comment: Comment)`
    * **requires**: the `resource` is registered\\
    * **effects**: creates and saves a new `comment` made by `commenter` with `text` made at `dateTime` under the `resource`. Returns the newly made `comment`

  * `removeComment(comment: Comment)`
    * **requires**: `comment` exists
    * **effects**: removes the `comment` from the `resource` it is bound to and deletes it
