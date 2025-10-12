---
timestamp: 'Sun Oct 12 2025 12:51:27 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251012_125127.16955648.md]]'
content_id: 6ccb4ada2b4483cfc47c5b33f193eefa59b42b99567fd292db9f89470d9d0634
---

# Concept: Comment\[User, Resource, dateTime]

* **purpose**: to allow users to associate messages with Resources so that discussions and feedback can be preserved.

* **principle**: once an object is registered, users may add comments to the object.

* **state**
  * a set of `Object`
    * a `comments` set of `Comment`

  * a set of `Comment` with
    * a `text` of type `string`
    * a `commenter` of type `User`
    * a `dateTime`

* **actions**
  * `register(object: Object, owner: User)`
    * **requires**: the `object` isn't already registered\\
    * **effects**: saves the `object` with an empty set `comments`

  * `addComment(object: Object, commenter: User, text: string, dateTime: dateTime): (comment: Comment)`
    * **requires**: the `object` is registered\\
    * **effects**: creates and saves a new `comment` made by `commenter` with `text` made at `dateTime` under the `object`. Returns the newly made `comment`

  * `removeComment(comment: Comment)`
    * **requires**: `comment` exists
    * **effects**: removes the `comment` from the `object` it is bound to and deletes it
