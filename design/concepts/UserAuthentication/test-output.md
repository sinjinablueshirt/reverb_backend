# UserAuthentication Test Output:
UserAuthenticationConcept ...\
Scenario 1: Operational Principle - Register and Login ...\
\------- output -------\
\
\--- Scenario 1: Operational Principle - Register and Login ---\
Attempting to register user: john.doe with password: securePassword123\
Register action output: { user: "0199eedc-a95e-7d23-993f-8e8b1d8d6ab7" }\
✅ Assertion: User 'john.doe' registered successfully with ID: 0199eedc-a95e-7d23-993f-8e8b1d8d6ab7\
Attempting to log in user: john.doe with password: securePassword123\
Login action output: { user: "0199eedc-a95e-7d23-993f-8e8b1d8d6ab7" }\
✅ Assertion: User 'john.doe' logged in successfully with ID: 0199eedc-a95e-7d23-993f-8e8b1d8d6ab7\
\----- output end -----\
Scenario 1: Operational Principle - Register and Login ... ok (82ms)\
Scenario 2: Failed Registration and Login Attempts ...\
\------- output -------\
\
\--- Scenario 2: Failed Registration and Login Attempts ---\
Pre-registering user: existingUser\
✅ Pre-registration output: {"user":"0199eedc-a9ae-752f-8e98-1a62e5a243de"}\
Attempting to register user with existing username: existingUser (expected to fail)\
Register conflict action output: { error: "A user with this username already exists." }\
✅ Assertion: Registration with existing username correctly returned error: 'A user with this username already exists.'\
Attempting to log in user: existingUser with INCORRECT password (expected to fail)\
Login with wrong password action output: { error: "Invalid username or password." }\
✅ Assertion: Login with wrong password correctly returned error: 'Invalid username or password.'\
Attempting to log in with NON-EXISTENT username: 'non_existent_user' (expected to fail)\
Login with non-existent username action output: { error: "Invalid username or password." }\
✅ Assertion: Login with non-existent username correctly returned error: 'Invalid username or password.'\
\----- output end -----\
Scenario 2: Failed Registration and Login Attempts ... ok (87ms)\
Scenario 3: Password Change Functionality ...\
\------- output -------\
\
\--- Scenario 3: Password Change Functionality ---\
Registering user for password change: chguser\
✅ Registration output: {"user":"0199eedc-aa06-7fc9-a4b3-4aeea136246f"}\
Attempting to log in with initial password for chguser\
Login with initial password output: { user: "0199eedc-aa06-7fc9-a4b3-4aeea136246f" }\
✅ Assertion: User 'chguser' logged in successfully with initial password.\
Attempting to change password for chguser from 'initial123' to 'strongNewPassword456'\
Change password action output: {}\
✅ Assertion: Password for 'chguser' changed successfully.\
Attempting to log in with OLD password for chguser (expected to fail)\
Login with old password after change output: { error: "Invalid username or password." }\
✅ Assertion: Login with old password after change correctly returned error: 'Invalid username or password.'\
Attempting to log in with NEW password for chguser\
Login with new password after change output: { user: "0199eedc-aa06-7fc9-a4b3-4aeea136246f" }\
✅ Assertion: User 'chguser' logged in successfully with new password.\
Attempting to change password for chguser with INCORRECT old password (expected to fail)\
Change password with wrong old password output: { error: "Invalid username or old password." }\
✅ Assertion: Change password with wrong old password correctly returned error: 'Invalid username or old password.'\
\----- output end -----\
Scenario 3: Password Change Functionality ... ok (125ms)\
Scenario 4: User Deletion Functionality ...\
\------- output -------\
\
\--- Scenario 4: User Deletion Functionality ---\
Registering user for deletion: todelete\
✅ Registration output: {"user":"0199eedc-aa83-7f31-8c1f-d7ac99c5e2f4"}\
Attempting to log in user 'todelete' before deletion\
Login before deletion output: { user: "0199eedc-aa83-7f31-8c1f-d7ac99c5e2f4" }\
✅ Assertion: User 'todelete' successfully logged in before deletion.\
Attempting to delete user: todelete with password: delpass\
Delete user action output: {}\
✅ Assertion: User 'todelete' deleted successfully.\
Attempting to log in user 'todelete' AFTER deletion (expected to fail)\
Login after deletion output: { error: "Invalid username or password." }\
✅ Assertion: Login after deletion correctly returned error: 'Invalid username or password.'\
Attempting to delete NON-EXISTENT user: 'nonexistent' (expected to fail)\
Delete non-existent user action output: { error: "Invalid username or password, or user does not exist." }\
✅ Assertion: Deletion of non-existent user correctly returned error: 'Invalid username or password, or user does not exist.'\
Attempting to delete user 'todelete' with INCORRECT password (expected to fail)\
Delete with wrong password action output: { error: "Invalid username or password, or user does not exist." }\
✅ Assertion: Deletion with wrong password correctly returned error: 'Invalid username or password, or user does not exist.'\
\----- output end -----\
Scenario 4: User Deletion Functionality ... ok (124ms)\
Scenario 5: Register, Delete, and Re-register the same user ...\
\------- output -------\
\
\--- Scenario 5: Register, Delete, and Re-register the same user ---\
Registering user 'recycleduser' for the first time.\
First registration output: { user: "0199eedc-ab00-714d-80eb-29b80232e464" }\
✅ Assertion: User 'recycleduser' first registered with ID: 0199eedc-ab00-714d-80eb-29b80232e464\
Attempting to log in 'recycleduser' with first password.\
First login output: { user: "0199eedc-ab00-714d-80eb-29b80232e464" }\
✅ Assertion: User 'recycleduser' successfully logged in with first password.\
Attempting to delete user 'recycleduser'.\
Deletion output: {}\
✅ Assertion: User 'recycleduser' successfully deleted.\
Attempting to log in 'recycleduser' AFTER first deletion (expected to fail).\
Login after first deletion output: { error: "Invalid username or password." }\
✅ Assertion: Login after first deletion correctly returned error.\
Attempting to RE-REGISTER user 'recycleduser' with new password 'secondPass'.\
Re-registration output: { user: "0199eedc-ab59-778d-b71c-0155bed68c84" }\
✅ Assertion: User 'recycleduser' re-registered successfully with new ID: 0199eedc-ab59-778d-b71c-0155bed68c84. New ID is different from old ID.\
Attempting to log in 'recycleduser' with new password AFTER re-registration.\
Login after re-registration output: { user: "0199eedc-ab59-778d-b71c-0155bed68c84" }\
✅ Assertion: User 'recycleduser' successfully logged in with new password after re-registration.\
Attempting to log in 'recycleduser' with the FIRST password AFTER re-registration (expected to fail).\
Login with old password after re-registration output: { error: "Invalid username or password." }\
✅ Assertion: Login with first password after re-registration correctly returned error.\
\----- output end -----\
Scenario 5: Register, Delete, and Re-register the same user ... ok (161ms)\
UserAuthenticationConcept ... ok (1s)\
