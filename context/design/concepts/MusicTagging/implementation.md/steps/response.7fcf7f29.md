---
timestamp: 'Sat Oct 11 2025 21:32:08 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_213208.fd52cc44.md]]'
content_id: 7fcf7f29c34cd81836db6551aecc7fbb1c5bed09fa7e97b25d404ea19874ba55
---

# response:

```typescript
  /**
   * deleteRegistry (registry: Registry)
   *
   * @requires `registry` exists in the state.
   * @effects The specified `registry` entry and all its associated data are removed from the state.
   */
  async deleteRegistry(
    { registry }: { registry: RegistryID },
  ): Promise<Empty | { error: string }> {
    // Check precondition: registry exists
    const existingRegistry = await this.registries.findOne({ _id: registry });
    if (!existingRegistry) {
      return { error: `Registry ${registry} not found.` };
    }

    // Effect: Remove the specified registry entry
    await this.registries.deleteOne({ _id: registry });

    return {};
  }
```
