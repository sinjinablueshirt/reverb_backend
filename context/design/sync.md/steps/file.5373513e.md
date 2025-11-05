---
timestamp: 'Sun Nov 02 2025 12:47:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_124749.f3dae070.md]]'
content_id: 5373513e0bda16629f8446550fd4517310a200185b78459ac1aa0fc0033bc7f8
---

# file: src/syncs/musicTagging.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { MusicTagging, Requesting, Sessioning } from "@concepts";

/**
 * Handles the request to add a tag to a music registry.
 * Note: The API does not specify authorization, but in a real system,
 * we would add a 'where' clause here to verify ownership of the registry.
 */
export const AddTagRequest: Sync = ({ request, registry, tag }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", registry, tag },
    { request },
  ]),
  then: actions([MusicTagging.addTag, { registry, tag }]),
});

/**
 * Responds to the client after a tag is successfully added.
 */
export const AddTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to the client with an error if adding a tag fails.
 */
export const AddTagError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the request to remove a tag from a music registry.
 */
export const RemoveTagRequest: Sync = ({ request, registry, tag }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", registry, tag },
    { request },
  ]),
  then: actions([MusicTagging.removeTag, { registry, tag }]),
});

/**
 * Responds to the client after a tag is successfully removed.
 */
export const RemoveTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to the client with an error if removing a tag fails.
 */
export const RemoveTagError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the request to delete a music registry.
 */
export const DeleteRegistryRequest: Sync = ({ request, registry }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", registry },
    { request },
  ]),
  then: actions([MusicTagging.deleteRegistry, { registry }]),
});

/**
 * Responds to the client after a registry is successfully deleted.
 */
export const DeleteRegistryResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, { request }],
    [MusicTagging.deleteRegistry, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds to the client with an error if deleting a registry fails.
 */
export const DeleteRegistryError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, { request }],
    [MusicTagging.deleteRegistry, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
