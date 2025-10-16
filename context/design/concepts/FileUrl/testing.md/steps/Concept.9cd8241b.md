---
timestamp: 'Wed Oct 15 2025 16:55:54 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_165554.b7cdab73.md]]'
content_id: 9cd8241b4717096a9c6d9bf46be0884579daff2ff6683d738b90fbca424f12eb
---

# Concept: FileUrl\[File, User]

* **purpose**: to let file information be uploaded and displayed

* **principle**: the user can upload files to a storage service to be retrived later through a URL

* **state**
  * a set of `File` with
    * a `filePath` of type `string`
    * an `owner` of type `User`
    * a `url` of type `string`

* **actions**
  * `uploadFile(filePath: string, owner: User): (file: File)`
    * **requires**: `filePath` points to a valid file and isn't already uploaded
    * **effects**: saves a new `file` with `filePath` and `owner`. Creates a unique `url` to access this file. Saves `url` to the `file` and returns `file`

  * `deleteFile(file: File, user: User)`
    * **requires**: `file` exists and `user` is its `owner`
    * **effects**: removes `file` from the state and makes it so that its `url` isn't able to access it

take a file and use an API to make and give it a URL
store the URL. access through URL
