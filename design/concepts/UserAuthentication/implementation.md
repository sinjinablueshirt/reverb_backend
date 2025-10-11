[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@userauthentication-specification](specification.md)

[@current-implementation](../../../src/concepts/UserAuthentication/UserAuthenticationConcept.ts)

# prompt: Given the current implementation of User Authentication, create an action for changePassword. Only return this method. Do not return anything from the current implementation

# response:

```typescript
/**
 * @action changePassword
 * @requires a user exists that has a username and password that matches the passed in username and oldPassword
 * @effects changes the user's password to newPassword
 */
async changePassword(
  { username, oldPassword, newPassword }: {
    username: string;
    oldPassword: string;
    newPassword: string;
  },
): Promise<Empty | { error: string }> {
  // Check precondition: a user exists that has a username and password that matches
  // the passed in username and oldPassword
  const result = await this.users.updateOne(
    { username, password: oldPassword },
    { $set: { password: newPassword } },
  );

  if (result.matchedCount === 0) {
    // If no user was found with the old credentials, the precondition was not met
    return { error: "Invalid username or old password." };
  }

  // Effect: changes the user's password to newPassword. Return empty object on success.
  return {};
}
```