---
timestamp: 'Wed Oct 15 2025 21:49:33 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_214933.496dde37.md]]'
content_id: 2fa1534902d99c78b82fdbfc2f48317a333419bb4e1726f670b526d05ea562ae
---

# Concept: FileUrl\[File, User, Storage]

* **purpose**: to let file information be uploaded and displayed

* **principle**: the user can upload files to a storage service to be retrived later through a URL

* **state**
  * a set of `File` with
    * a `filePath` of type `string`
    * an `owner` of type `User`
    * a `url` of type `string`

* **actions**
  * `uploadFile(filePath: string, owner: User, storage: Storage): (file: File)`
    * **requires**: `filePath` points to a valid file and isn't already uploaded
    * **effects**: saves a new `file` with `filePath` and `owner`. Uploads the contents to `storage` and obtains a unique `url` to access this file. Saves `url` to the `file` and returns `file`

  * `deleteFile(file: File, user: User, storage: Storage)`
    * **requires**: `file` exists and `user` is its `owner`
    * **effects**: removes `file` from the state and makes it so that its `url` isn't able to access it through `storage`
