---
timestamp: 'Sun Nov 02 2025 13:05:50 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_130550.ea443835.md]]'
content_id: 151158e080352cd9c9cd9eef7e995f422acb0b7532625549c1bbb806e263e003
---

# file: src/syncs/musicTagging.sync.ts

```typescript
import { MusicTagging, Requesting, Sessioning } from "@concepts";
import { actions, Sync } from "@engine";

/**
 * Handles request to add a tag to a music registry.
 * Requires a valid session, acting as an authorization gate.
 */
export const AddTagRequest: Sync = ({ request, registry, tag, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/addTag", registry, tag, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([MusicTagging.addTag, { registry, tag }]),
});

/**
 * Responds to a successful tag addition.
 */
export const AddTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds with an error if adding a tag fails.
 */
export const AddTagResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/addTag" }, { request }],
    [MusicTagging.addTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles request to remove a tag from a music registry.
 * Requires a valid session.
 */
export const RemoveTagRequest: Sync = (
  { request, registry, tag, session, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/removeTag", registry, tag, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([MusicTagging.removeTag, { registry, tag }]),
});

/**
 * Responds to a successful tag removal.
 */
export const RemoveTagResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds with an error if removing a tag fails.
 */
export const RemoveTagResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/removeTag" }, { request }],
    [MusicTagging.removeTag, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles request to delete a music registry.
 * Requires a valid session.
 */
export const DeleteRegistryRequest: Sync = (
  { request, registry, session, user },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MusicTagging/deleteRegistry", registry, session },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([MusicTagging.deleteRegistry, { registry }]),
});

/**
 * Responds to a successful registry deletion.
 */
export const DeleteRegistryResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, { request }],
    [MusicTagging.deleteRegistry, {}, {}],
  ),
  then: actions([Requesting.respond, { request }]),
});

/**
 * Responds with an error if deleting a registry fails.
 */
export const DeleteRegistryResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MusicTagging/deleteRegistry" }, { request }],
    [MusicTagging.deleteRegistry, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
