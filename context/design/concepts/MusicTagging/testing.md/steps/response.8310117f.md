---
timestamp: 'Sat Oct 11 2025 17:06:34 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_170634.ae88a6f7.md]]'
content_id: 8310117f22c6d865a19bd8dd7ae2d1cf9956e4ed0c11c6b3ca670af572ff8024
---

# response:

```typescript
Deno.test("MusicTaggingConcept - addTag", async (t) => {
  const [db, client] = await testDb();
  const concept = new MusicTaggingConcept(db);

  let registeredRegistryId: ID;
  const resourceC = "artist:Queen" as ID;
  const descriptionC = "A British rock band formed in London in 1970.";

  // Setup: Register a resource once for all addTag tests
  Deno.test.beforeAll(async () => {
    const result = await concept.registerResource({
      resource: resourceC,
      description: descriptionC,
    });
    if ("error" in result) {
      throw new Error(`Failed to register resource for addTag tests: ${result.error}`);
    }
    registeredRegistryId = result.registry;
  });

  await t.step("should successfully add a new tag to an existing registry", async () => {
    const tag = "rock";

    // Action: addTag
    const result = await concept.addTag({ registry: registeredRegistryId, tag });

    // Assert effects: no error returned
    assertEquals("error" in result, false);
    assertEquals(result, {});

    // Verify state change: tag is present in the registry's tags set
    const storedRegistry = await concept.registries.findOne({ _id: registeredRegistryId });
    assertEquals(storedRegistry?.tags.includes(tag), true);
    assertEquals(storedRegistry?.tags.length, 1);
  });

  await t.step(
    "should return an error if the registry does not exist",
    async () => {
      const nonExistentRegistryId = "nonExistent:123" as ID;
      const tag = "nonexistent_tag";

      // Action: addTag to a non-existent registry
      const result = await concept.addTag({ registry: nonExistentRegistryId, tag });

      // Assert effects: error message returned
      assertEquals("error" in result, true);
      assertEquals(
        (result as { error: string }).error,
        `Registry ${nonExistentRegistryId} not found.`,
      );
    },
  );

  await t.step(
    "should return an error if the tag is already present in the registry",
    async () => {
      const tagAlreadyPresent = "legendary"; // This tag should be added successfully first
      const tagDuplicate = "legendary"; // Then try to add it again

      // First, add the tag successfully
      const firstAddResult = await concept.addTag({
        registry: registeredRegistryId,
        tag: tagAlreadyPresent,
      });
      assertEquals("error" in firstAddResult, false);

      // Verify state: tag is present
      const registryAfterFirstAdd = await concept.registries.findOne({ _id: registeredRegistryId });
      assertEquals(registryAfterFirstAdd?.tags.includes(tagAlreadyPresent), true);

      // Action: Attempt to add the same tag again
      const secondAddResult = await concept.addTag({
        registry: registeredRegistryId,
        tag: tagDuplicate,
      });

      // Assert effects: error message returned
      assertEquals("error" in secondAddResult, true);
      assertEquals(
        (secondAddResult as { error: string }).error,
        `Tag "${tagDuplicate}" already exists for registry ${registeredRegistryId}.`,
      );

      // Verify state: tag is still present, but not duplicated (set behavior)
      const registryAfterSecondAdd = await concept.registries.findOne({ _id: registeredRegistryId });
      const countOfTag = registryAfterSecondAdd?.tags.filter((t) => t === tagDuplicate).length;
      assertEquals(countOfTag, 1); // Should only appear once
    },
  );

  await client.close();
});
```
