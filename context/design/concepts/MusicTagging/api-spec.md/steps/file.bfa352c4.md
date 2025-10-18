---
timestamp: 'Sat Oct 18 2025 11:15:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_111552.6464d069.md]]'
content_id: bfa352c4065f6e5354a1041b3f56ee18eb904ce5fd4a9f4ce7ce327643bd8ef3
---

# file: deno.json

```json
{
    "imports": {
        "@concepts/": "./src/concepts/",
        "@google/generative-ai": "npm:@google/generative-ai@^0.24.1",
        "@google-cloud/storage": "npm:@google-cloud/storage@^7.0.0",
        "@utils/": "./src/utils/"
    },
    "tasks": {
        "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
    }
}

```
