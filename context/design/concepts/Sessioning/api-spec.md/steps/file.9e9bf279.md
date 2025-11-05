---
timestamp: 'Mon Nov 03 2025 21:37:39 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251103_213739.6855a0fc.md]]'
content_id: 9e9bf279aed4b9a3619e168cf6d20284abb01639cbd45e6789e84fcf2ba6673a
---

# file: deno.json

```json
{
    "imports": {
        "@concepts/": "./src/concepts/",
        "@concepts": "./src/concepts/concepts.ts",
        "@test-concepts": "./src/concepts/test_concepts.ts",
        "@google/generative-ai": "npm:@google/generative-ai@^0.24.1",
        "@google-cloud/storage": "npm:@google-cloud/storage@^7.0.0",
        "@hono/hono": "jsr:@hono/hono",
        "@hono/hono/cors": "jsr:@hono/hono/cors",
        "@std/": "jsr:@std/",
        "@utils/": "./src/utils/",
        "@engine": "./src/engine/mod.ts",
        "@syncs": "./src/syncs/syncs.ts"
    },
    "tasks": {
        "start": "deno run --allow-net --allow-write --allow-read --allow-sys --allow-env src/main.ts",
        "concepts": "deno run --allow-net --allow-read --allow-sys --allow-env src/concept_server.ts --port 8000 --baseUrl /api",
        "import": "deno run --allow-read --allow-write --allow-env src/utils/generate_imports.ts",
        "build": "deno run import"
    },
    "lint": {
        "rules": {
            "exclude": [
                "no-import-prefix",
                "no-unversioned-import"
            ]
        }
    }
}

```
