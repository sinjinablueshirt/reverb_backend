---
timestamp: 'Wed Oct 15 2025 15:47:39 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_154739.a0c9e1b3.md]]'
content_id: 34594a7861bbe3eec4453def927d0ab02bfa366c3cdf2a3ba5f7b8b72b619af6
---

# file: deno.json

```json
{
    "imports": {
        "@concepts/": "./src/concepts/",
        "@google/generative-ai": "npm:@google/generative-ai@^0.24.1",
        "@utils/": "./src/utils/"
    },
    "tasks": {
        "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
    }
}

```
