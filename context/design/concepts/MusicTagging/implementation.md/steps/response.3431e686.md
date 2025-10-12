---
timestamp: 'Sat Oct 11 2025 21:03:47 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_210347.3d6bb141.md]]'
content_id: 3431e686397de0501aaca029747c4526032544c470ae2c18a9629dc9b9e7e30c
---

# response:

```typescript
  /**
   * removeTag (registry: Registry, tag: String)
   *
   * @requires `registry` exists in the state and `tag` is present in `registry.tags`.
   * @effects `tag` is removed from the `tags` set of the specified `registry`.
   */
  async removeTag(
    { registry, tag }: { registry: RegistryID; tag: string },
  ): Promise<Empty | { error: string }> {
    // Check precondition: registry exists
    const existingRegistry = await this.registries.findOne({ _id: registry });
    if (!existingRegistry) {
      return { error: `Registry ${registry} not found.` };
    }

    // Check precondition: tag is present in registry.tags
    if (!existingRegistry.tags.includes(tag)) {
      return { error: `Tag "${tag}" not found for registry ${registry}.` };
    }

    // Effect: Remove tag from the tags set
    await this.registries.updateOne(
      { _id: registry },
      { $pull: { tags: tag } }, // $pull removes all instances of the specified value from an array
    );

    return {};
  }
```
