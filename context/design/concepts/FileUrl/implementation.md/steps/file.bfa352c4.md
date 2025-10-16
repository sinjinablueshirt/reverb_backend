---
timestamp: 'Wed Oct 15 2025 22:15:14 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_221514.b5b63c46.md]]'
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
