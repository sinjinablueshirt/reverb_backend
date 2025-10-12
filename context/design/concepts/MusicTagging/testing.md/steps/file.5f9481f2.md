---
timestamp: 'Sat Oct 11 2025 23:04:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251011_230439.84b5f7eb.md]]'
content_id: 5f9481f24aedbf74bc651b9011e843294e8b721a748155dd207d67a81fb8d0f5
---

# file: src/utils/gemini-llm.ts

```typescript
/**
 * LLM Integration for DayPlanner
 *
 * Handles the requestAssignmentsFromLLM functionality using Google's Gemini API.
 * The LLM prompt is hardwired with user preferences and doesn't take external hints.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Configuration for API access
 */
export interface Config {
    apiKey: string;
}

export class GeminiLLM {
    private apiKey: string;

    constructor(config: Config) {
        this.apiKey = config.apiKey;
    }

    async executeLLM(prompt: string): Promise<string> {
        const timeoutMs = 5000;
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API call timed out after 5 seconds')), timeoutMs)
        );

        const llmPromise = (async () => {
            // Initialize Gemini AI
            const genAI = new GoogleGenerativeAI(this.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash-lite",
                generationConfig: {
                    maxOutputTokens: 1000,
                }
            });

            // Execute the LLM
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text;
        })();

        try {
            return await Promise.race([llmPromise, timeoutPromise]);
        } catch (error) {
            console.error('❌ Error calling Gemini API:', (error as Error).message);
            throw error;
        }
    }
}

```
