---
timestamp: 'Sat Oct 18 2025 14:07:15 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_140715.1e7a667c.md]]'
content_id: 578bc4dfe5b4e449d06b68f4b73023a90498851e39ad5704017f7370f6d1f8b9
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
    * an `originalFileName` of type `string`

* **actions**
  * `uploadFile(fileData: fileData, owner: User): (file: File)`
    * **requires**: `fileData` is a valid file
    * **effects**: saves a new `file` with `fileData` and `owner` and unique `gcsObjectName`. Uploads the contents to an external storage service and obtains a unique `url` to access this file. Saves `url` to the `file` and returns `file`

  * `deleteFile(file: File, user: User)`
    * **requires**: `file` exists and `user` is its `owner`
    * **effects**: removes `file` from the state and makes it so that its `url` isn't able to access it through the `url`
