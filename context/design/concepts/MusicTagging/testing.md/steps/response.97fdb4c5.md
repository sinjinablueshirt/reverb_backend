---
timestamp: 'Sat Oct 11 2025 20:56:19 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_205619.b0daf78a.md]]'
content_id: 97fdb4c5d66afc9ec01b36cea2a3bed48d70d230cb6e8d5aeb1302dc8ad93c48
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
    // After this test, the tags array should contain "rock"
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
    "should return an error if the tag is already present in the registry (after successful add)",
    async () => {
      const tagAlreadyPresent = "legendary";

      // Ensure the tag is present from a previous successful add or add it now
      // (This assumes previous tests in this suite might have added tags.
      // For isolation, one might clear tags or use a new registry, but for sequential steps it's fine)
      const initialAddResult = await concept.addTag({ registry: registeredRegistryId, tag: tagAlreadyPresent });
      // We don't assert here whether initialAddResult had an error or not,
      // as it might be the first time adding "legendary" or it might fail if already present.
      // The important part is that we then test adding it *again*.

      // Action: Attempt to add the same tag again
      const duplicateAddResult = await concept.addTag({
        registry: registeredRegistryId,
        tag: tagAlreadyPresent,
      });

      // Assert effects: error message returned for duplicate
      assertEquals("error" in duplicateAddResult, true);
      assertEquals(
        (duplicateAddResult as { error: string }).error,
        `Tag "${tagAlreadyPresent}" already exists for registry ${registeredRegistryId}.`,
      );

      // Verify state: tag is still present, but not duplicated (set behavior)
      const registryAfterDuplicateAdd = await concept.registries.findOne({ _id: registeredRegistryId });
      const countOfTag = registryAfterDuplicateAdd?.tags.filter((t) => t === tagAlreadyPresent).length;
      assertEquals(countOfTag, 1); // Should only appear once
    },
  );

  await client.close();
});
```
