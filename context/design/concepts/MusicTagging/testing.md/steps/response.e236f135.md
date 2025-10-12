---
timestamp: 'Sat Oct 11 2025 21:06:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_210601.7c295ac5.md]]'
content_id: e236f135b76ae5546947f8a72bcf1eafb5b7b4adad2ff7e518d700f4067b4dfd
---

# response:

```typescript
Deno.test("MusicTaggingConcept - removeTag", async (t) => {
  const [db, client] = await testDb();
  const concept = new MusicTaggingConcept(db);

  let registeredRegistryId: ID;
  const resourceD = "song:BohemianRhapsody" as ID;
  const descriptionD =
    "An epic operatic rock ballad by Queen, known for its complex structure and vocal harmonies.";

  // Setup: Register a resource and add some tags for removeTag tests
  const registerResult = await concept.registerResource({
    resource: resourceD,
    description: descriptionD,
  });
  if ("error" in registerResult) {
    throw new Error(
      `Failed to register resource for removeTag tests: ${registerResult.error}`,
    );
  }
  registeredRegistryId = registerResult.registry;

  // Add initial tags to the registry for testing removal
  await concept.addTag({ registry: registeredRegistryId, tag: "rock" });
  await concept.addTag({ registry: registeredRegistryId, tag: "classic" });
  await concept.addTag({ registry: registeredRegistryId, tag: "ballad" });

  await t.step(
    "should successfully remove an existing tag from a registry",
    async () => {
      const tagToRemove = "classic";

      // Action: removeTag
      const result = await concept.removeTag({
        registry: registeredRegistryId,
        tag: tagToRemove,
      });

      // Assert effects: no error returned
      assertEquals("error" in result, false);
      assertEquals(result, {});

      // Verify state change: tag is no longer present in the registry's tags set
      const storedRegistry = await concept.registries.findOne({
        _id: registeredRegistryId,
      });
      assertEquals(storedRegistry?.tags.includes(tagToRemove), false);
      assertEquals(storedRegistry?.tags.length, 2); // 'rock', 'ballad' should remain
      assertEquals(storedRegistry?.tags.includes("rock"), true);
      assertEquals(storedRegistry?.tags.includes("ballad"), true);
    },
  );

  await t.step(
    "should return an error if the registry does not exist",
    async () => {
      const nonExistentRegistryId = "nonExistent:456" as ID;
      const tag = "any_tag";

      // Action: removeTag from a non-existent registry
      const result = await concept.removeTag({
        registry: nonExistentRegistryId,
        tag,
      });

      // Assert effects: error message returned
      assertEquals("error" in result, true);
      assertEquals(
        (result as { error: string }).error,
        `Registry ${nonExistentRegistryId} not found.`,
      );
    },
  );

  await t.step(
    "should return an error if the tag is not present in the registry",
    async () => {
      const tagNotPresent = "jazz"; // This tag was never added

      // Action: Attempt to remove a tag that is not present
      const result = await concept.removeTag({
        registry: registeredRegistryId,
        tag: tagNotPresent,
      });

      // Assert effects: error message returned
      assertEquals("error" in result, true);
      assertEquals(
        (result as { error: string }).error,
        `Tag "${tagNotPresent}" not found for registry ${registeredRegistryId}.`,
      );

      // Verify state: existing tags should remain untouched
      const storedRegistry = await concept.registries.findOne({
        _id: registeredRegistryId,
      });
      // The previous test removed 'classic', so we expect 'rock' and 'ballad'
      assertEquals(storedRegistry?.tags.length, 2);
      assertEquals(storedRegistry?.tags.includes("rock"), true);
      assertEquals(storedRegistry?.tags.includes("ballad"), true);
    },
  );

  await client.close();
});
```
