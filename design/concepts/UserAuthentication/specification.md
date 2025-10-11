# concept: UserAuthentication

* **purpose**: to identify and authenticate users so that only legitimate users can access their own accounts.

* **principle**: once a user registers with a username and password, they can later log into the same user with the same username and password

* **state**
    * a set of `User` with
        * a `username` of type `String`
        * a `password` of type `String`

* **actions**
    * `register(username: String, password: String): User`
        * **requires**: a user with the same username doesn't already exist
        * **effects**: creates and saves a new user. Returns the user

    * `login(username: String, password: String): User`
        * **requires**: a user exists that has a username and password that matches the passed in username and password
        * **effects**: returns the user that has a username and password that matches the passed in username and password

    * `deleteUser(username: String, password: String)`
        * **requires**: a user exists that has a username and password that matches the passed in username and password
        * **effects**: deletes the user that has a username and password that matches the passed in username and password

    * `changePassword(username: String, oldPassword: String, newPassword: String)`
        * **requires**: a user exists that has a username and password that matches the passed in username and oldPassword
        * **effects**: changes the user's password to newPassword
