
# Concept: FileUrl[File, User]

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
        * **effects**: saves a new `file` with `filePath` and `owner`. Uploads the contents to an external storage service and obtains a unique `url` to access this file. Saves `url` to the `file` and returns `file`

    * `deleteFile(file: File, user: User)`
        * **requires**: `file` exists and `user` is its `owner`
        * **effects**: removes `file` from the state and makes it so that its `url` isn't able to access it through the `url`
