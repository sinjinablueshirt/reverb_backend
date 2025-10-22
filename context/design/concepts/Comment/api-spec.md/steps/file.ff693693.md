---
timestamp: 'Tue Oct 21 2025 19:25:42 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_192542.f9d1c8d9.md]]'
content_id: ff693693e578f1b2b1e488f052adb1cb79821201eda3999456ef607eb70724dd
---

# file: deno.json

```json
{
    "imports": {
        "@concepts/": "./src/concepts/",
        "@google/generative-ai": "npm:@google/generative-ai@^0.24.1",
        "@google-cloud/storage": "npm:@google-cloud/storage@^7.0.0",
        "@hono/hono": "jsr:@hono/hono",
        "@hono/hono/cors": "jsr:@hono/hono/cors",
        "@std/": "jsr:@std/",
        "@utils/": "./src/utils/"
    },
    "tasks": {
        "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api"
    }
}

```
