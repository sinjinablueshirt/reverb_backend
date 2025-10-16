---
timestamp: 'Thu Oct 16 2025 17:20:15 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_172015.ad707049.md]]'
content_id: 02a01be7119b346973dcfccde917e5ab6944e0e83ffdc1739a7657f022458bc4
---

# file: src/utils/gemini-llm.ts

```typescript
/**
 * LLM Integration for DayPlanner
 *
 * Handles the requestAssignmentsFromLLM functionality using Google's Gemini API.
 * The LLM prompt is hardwired with user preferences and doesn't take external hints.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiLLM {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async executeLLM(prompt: string): Promise<string> {
    const llmPromise = (async () => {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Execute the LLM
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    })();

    try {
      return await llmPromise;
    } catch (error) {
      console.error("❌ Error calling Gemini API:", (error as Error).message);
      throw error;
    }
  }
}

```

<!-- # prompt: You are given an existing test suite for the MusicTagging concept. You should augment the tests so that some of them test the behavior of the suggestTags method. Be sure to make tests that follow the operational principle of the concept specification. Tests should use a sequence of action executions that corresponds to the operational principle, representing the common expected usage of the concept. These sequence is not required to use all the actions; operational principles often do not include a deletion action, for example. Test sequences of action executions that correspond to less common cases: probing interesting corners of the functionality, undoing actions with deletions and cancellations, repeating actions with the same arguments, etc. In some of these scenarios actions may be expected to throw errors. You should have one test sequence for the operational principle, and 3-5 additional interesting scenarios. Every action should be executed successfully in at least one of the scenarios. DO NOT create any more tests than the ones that already exist. Only add a few suggestTags calls in the tests. Use the gemini LLM util that is imported. DO NOT try to make your own LLM. -->
