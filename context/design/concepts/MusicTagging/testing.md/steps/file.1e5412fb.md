---
timestamp: 'Sat Oct 11 2025 15:18:54 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_151854.7d298446.md]]'
content_id: 1e5412fb9c7e10652496aa20e5b0d1202848d5abbb1383c22d54ed7d2908ed75
---

# file: src/concepts/MusicTagging/MusicTaggingConcept.test.ts

```typescript
import {
  assert,
  assertEquals,
  assertNotEquals,
  assertObjectMatch,
} from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import MusicTaggingConcept from "./MusicTaggingConcept.ts";
import { ID } from "@utils/types.ts";

```
