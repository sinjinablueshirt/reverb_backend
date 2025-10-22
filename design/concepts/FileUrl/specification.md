
# Concept: FileUrl[User, fileData]

* **purpose**: to let file information be uploaded and displayed

* **principle**: the user can request presigned urls in order to upload files, which can then be retrieved and displayed later

* **state**
    * a set of `File` with
        * an `owner` of type `User`
        * a `url` of type `string`
        * a `gcsObjectName` of type `string`
        * an `fileName` of type `string`

* **actions**
    * `requestUpload(fileName: string, owner: User): (uploadUrl: string, gcsObjectName: string)`
        * **requires**: `fileName` isn't empty and no other file with `fileName` has been uploaded with `owner`
        * **effects**: generates a unique `gcsObjectName`. creates a pre-signed `uploadUrl` that allows the client to upload directly to GCS. returns both the uploadUrl and gcsObjectName

    * `confirmUpload(fileName: string, gcsObjectName: string, owner: User): (file: File)`
        * **requires**: an object exists in GCS with `gcsObjectName` and the upload was initiated by `owner`
        * **effects**: constructs a permanent `url` for retrieving the file. Saves a new `File` record with `fileName`, `gcsObjectName`, `owner`, and `url`. returns this `File`

    * `deleteFile(file: File, user: User)`
        * **requires**: `file` exists and `user` is its `owner`
        * **effects**: removes `file` from the state and makes it so that its `url` isn't able to access it through the `url`

    * `getViewUrl(gcsObjectName: string): (viewUrl: string)`
        * **requires** `gcsObjectName` exists in GCS.
        * **effects** Generates and returns a pre-signed URL that allows viewing/downloading the file from Google Cloud Storage for a limited time.
