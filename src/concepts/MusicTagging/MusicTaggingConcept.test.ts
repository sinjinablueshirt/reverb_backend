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
