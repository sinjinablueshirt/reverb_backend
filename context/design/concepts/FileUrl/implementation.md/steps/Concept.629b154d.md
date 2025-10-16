---
timestamp: 'Wed Oct 15 2025 21:43:14 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_214314.3dc48b1d.md]]'
content_id: 629b154da5ee6f0c614568722e380bffaff2f91de6147e16fa8d4678cdccdd2f
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

take a file and use an API to make and give it a URL
store the URL. access through URL
