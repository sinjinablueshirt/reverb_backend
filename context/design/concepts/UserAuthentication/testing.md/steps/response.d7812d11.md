---
timestamp: 'Sat Oct 11 2025 13:32:55 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_133255.a045c6a8.md]]'
content_id: d7812d116f63d51444f637bc57b021b8989f6bbecbf1ebcc96935bc8a0882c3e
---

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
