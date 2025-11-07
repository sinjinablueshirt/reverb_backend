---
timestamp: 'Thu Nov 06 2025 23:43:48 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251106_234348.d0175075.md]]'
content_id: b1a29fa314179e492a016e0d5fc28305d5f9ab665e549878a4bb87ba6d70172f
---

# file: src/syncs/sample.sync.ts

```typescript
/**
 * Sample synchronizations: feel free to delete this entire file!
 */

import {
  LikertSurvey,
  Requesting,
  Sessioning,
  UserAuthentication,
} from "@concepts";
import { actions, Sync } from "@engine";

export const CreateSurveyRequest: Sync = (
  { request, author, title, scaleMin, scaleMax },
) => ({
  when: actions([
    Requesting.request,
    { path: "/LikertSurvey/createSurvey", author, title, scaleMin, scaleMax },
    { request },
  ]),
  then: actions([LikertSurvey.createSurvey, {
    author,
    title,
    scaleMin,
    scaleMax,
  }]),
});

export const CreateSurveyResponse: Sync = ({ request, survey }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/createSurvey" }, { request }],
    [LikertSurvey.createSurvey, {}, { survey }],
  ),
  then: actions([Requesting.respond, { request, survey }]),
});

export const AddQuestionRequest: Sync = ({ request, survey, text }) => ({
  when: actions([
    Requesting.request,
    { path: "/LikertSurvey/addQuestion", survey, text },
    { request },
  ]),
  then: actions([LikertSurvey.addQuestion, { survey, text }]),
});

export const AddQuestionResponse: Sync = ({ request, question }) => ({
  when: actions(
    [Requesting.request, { path: "/LikertSurvey/addQuestion" }, { request }],
    [LikertSurvey.addQuestion, {}, { question }],
  ),
  then: actions([Requesting.respond, { request, question }]),
});

```
