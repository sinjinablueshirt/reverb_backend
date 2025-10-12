---
timestamp: 'Sat Oct 11 2025 17:05:42 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_170542.9eb341d6.md]]'
content_id: 16d83a97dcbec3ac11a98f3fa860437bb6eb59489b0716bcb65ab1e897963b12
---

# response:

```typescript
import { assertEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import MusicTaggingConcept from "./MusicTaggingConcept.ts";

Deno.test("MusicTaggingConcept - registerResource", async (t) => {
  const [db, client] = await testDb();
  const concept = new MusicTaggingConcept(db);

  await t.step("should successfully register a new resource", async () => {
    const resourceA = "song:StairwayToHeaven" as ID;
    const descriptionA =
      "A classic rock song by Led Zeppelin, known for its acoustic intro and powerful guitar solo.";

    // Action: registerResource
    const result = await concept.registerResource({
      resource: resourceA,
      description: descriptionA,
    });

    // Assert effects: new Registry ID returned, no error
    assertEquals(typeof (result as { registry: ID }).registry, "string");
    assertEquals("error" in result, false);

    const registryId = (result as { registry: ID }).registry;

    // Verify state change: entry exists in database with correct details
    const storedRegistry = await concept.registries.findOne({
      _id: registryId,
    });
    assertEquals(storedRegistry?.resource, resourceA);
    assertEquals(storedRegistry?.description, descriptionA);
    assertEquals(storedRegistry?.tags, []); // Tags should be empty initially
  });

  await t.step(
    "should return an error if the resource is already registered",
    async () => {
      const resourceB = "album:TheDarkSideOfTheMoon" as ID;
      const descriptionB = "A landmark progressive rock album by Pink Floyd.";

      // First registration (should succeed)
      const firstResult = await concept.registerResource({
        resource: resourceB,
        description: descriptionB,
      });
      assertEquals("error" in firstResult, false);

      // Second registration of the same resource (should fail)
      const secondResult = await concept.registerResource({
        resource: resourceB,
        description: "Attempting to register again.",
      });

      // Assert effects: error message returned
      assertEquals("error" in secondResult, true);
      assertEquals(
        (secondResult as { error: string }).error,
        `Resource ${resourceB} is already registered.`,
      );

      // Verify state: only one entry for the resource exists
      const count = await concept.registries.countDocuments({
        resource: resourceB,
      });
      assertEquals(count, 1);
    },
  );

  await client.close();
});

Deno.test("MusicTaggingConcept - addTag", async (t) => {
  const [db, client] = await testDb();
  const concept = new MusicTaggingConcept(db);

  // Setup: Register a resource to use for tagging
  const resourceC = "artist:TaylorSwift" as ID;
  const descriptionC = "Pop superstar and songwriter.";
  const registerResult = await concept.registerResource({
    resource: resourceC,
    description: descriptionC,
  });
  const registryCId = (registerResult as { registry: ID }).registry;

  await t.step("should successfully add a new tag to an existing registry", async () => {
    const tag1 = "Pop";

    // Action: addTag
    const result = await concept.addTag({ registry: registryCId, tag: tag1 });

    // Assert effects: no error
    assertEquals("error" in result, false);

    // Verify state change: registry now contains the new tag
    const updatedRegistry = await concept.registries.findOne({ _id: registryCId });
    assertEquals(updatedRegistry?.tags, [tag1]);
  });

  await t.step("should return an error if the registry does not exist", async () => {
    const nonExistentRegistry = "nonexistent:id" as ID;
    const tag = "Rock";

    // Action: addTag on a non-existent registry
    const result = await concept.addTag({ registry: nonExistentRegistry, tag: tag });

    // Assert effects: error message returned
    assertEquals("error" in result, true);
    assertEquals(
      (result as { error: string }).error,
      `Registry ${nonExistentRegistry} not found.`,
    );
  });

  await t.step("should return an error if the tag is already present in the registry", async () => {
    const tag2 = "Songwriter";

    // First, add the tag successfully
    const firstAddResult = await concept.addTag({ registry: registryCId, tag: tag2 });
    assertEquals("error" in firstAddResult, false);

    // Attempt to add the same tag again
    const secondAddResult = await concept.addTag({ registry: registryCId, tag: tag2 });

    // Assert effects: error message returned
    assertEquals("error" in secondAddResult, true);
    assertEquals(
      (secondAddResult as { error: string }).error,
      `Tag "${tag2}" already exists for registry ${registryCId}.`,
    );

    // Verify state: the tag is still present only once
    const finalRegistry = await concept.registries.findOne({ _id: registryCId });
    assertEquals(finalRegistry?.tags.filter(t => t === tag2).length, 1);
  });

  await t.step("should allow adding multiple distinct tags to the same registry", async () => {
    const tag3 = "Country";
    const tag4 = "FemaleVocalist";

    // Add first distinct tag
    const addResult3 = await concept.addTag({ registry: registryCId, tag: tag3 });
    assertEquals("error" in addResult3, false);

    // Add second distinct tag
    const addResult4 = await concept.addTag({ registry: registryCId, tag: tag4 });
    assertEquals("error" in addResult4, false);

    // Verify state: both new tags are present along with previous ones
    const finalRegistry = await concept.registries.findOne({ _id: registryCId });
    assertEquals(finalRegistry?.tags.includes("Pop"), true); // From first test
    assertEquals(finalRegistry?.tags.includes("Songwriter"), true); // From previous test
    assertEquals(finalRegistry?.tags.includes(tag3), true);
    assertEquals(finalRegistry?.tags.includes(tag4), true);
    assertEquals(finalRegistry?.tags.length, 4); // Check total count
  });

  await client.close();
});
```
