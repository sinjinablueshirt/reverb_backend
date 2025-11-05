---
timestamp: 'Sun Nov 02 2025 12:44:01 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_124401.8017e2b6.md]]'
content_id: 8d28178601a2833889be08a245918c5ca186d39cdcd9d2701489079139eb09a6
---

# file: src/concepts/Requesting/passthrough.ts

```typescript
/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // Feel free to delete these example inclusions
  "/api/LikertSurvey/_getSurveyQuestions": "this is a public query",
  "/api/LikertSurvey/_getSurveyResponses": "responses are public",
  "/api/LikertSurvey/_getRespondentAnswers": "answers are visible",
  "/api/LikertSurvey/submitResponse": "allow anyone to submit response",
  "/api/LikertSurvey/updateResponse": "allow anyone to update their response",
  "/api/Comment/register": "anyone can register a resource for comments",
  "/api/Comment/addComment": "anyone can add a comment to a resource",
  "/api/Comment/_getCommentsByResource": "comments are public",
  "/api/Comment/_getCommentById": "comments are public",
  "/api/UserAuthentication/register": "anyone can register an account",
  "/api/UserAuthentication/login": "anyone can login to their account",
  "/api/UserAuthentication/_getUserById": "this is a public query",
  "/api/FileUrl/_getFilesByUser": "this is a public query",
  "/api/FileUrl/_getFileById": "this is a public query",
  "/api/FileUrl/_getFileTitleById": "this is a public query",
  "/api/MusicTagging/registerResource":
    "anyone can register a resource for music tagging",
  "/api/MusicTagging/suggestTags":
    "getting recommended tags only requires a description and current tags",
  "/api/MusicTagging/_getRegistriesByTags": "this is a public query",
  "/api/MusicTagging/_getRegistryById": "this is a public query",
  "/api/MusicTagging/_getRegistryByResource": "this is a public query",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Feel free to delete these example exclusions
  "/api/LikertSurvey/createSurvey",
  "/api/LikertSurvey/addQuestion",
  "/api/Comment/removeComment",
  "/api/UserAuthentication/deleteUser",
  "/api/UserAuthentication/changePassword",
  "/api/FileUrl/requestUpload",
  "/api/FileUrl/confirmUpload",
  "/api/FileUrl/deleteFile",
  "/api/FileUrl/getViewUrl",
  "/api/MusicTagging/addTag",
  "/api/MusicTagging/removeTag",
  "/api/MusicTagging/deleteRegistry",
];

```
