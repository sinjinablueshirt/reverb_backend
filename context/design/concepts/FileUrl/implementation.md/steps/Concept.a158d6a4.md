---
timestamp: 'Sat Oct 18 2025 14:00:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_140046.baf34c30.md]]'
content_id: a158d6a4216263330b532dabbd2b44be584aba4c87ea8d2bff5df1afe2cfb2db
---

# Concept: FileUrl\[User, fileData]

* **purpose**: to let file information be uploaded and displayed

* **principle**: the user can upload files to a storage service to be retrived later through a URL

* **state**
  * a set of `File` with
    * a `fileData`
    * an `owner` of type `User`
    * a `url` of type `string`
    * a `gcsObjectName` of type `string`

* **actions**
  * `uploadFile(fileData: fileData, owner: User): (file: File)`
    * **requires**: `fileData` is a valid file
    * **effects**: saves a new `file` with `fileData` and `owner` and unique `gcsObjectName`. Uploads the contents to an external storage service and obtains a unique `url` to access this file. Saves `url` to the `file` and returns `file`

  * `deleteFile(file: File, user: User)`
    * **requires**: `file` exists and `user` is its `owner`
    * **effects**: removes `file` from the state and makes it so that its `url` isn't able to access it through the `url`
