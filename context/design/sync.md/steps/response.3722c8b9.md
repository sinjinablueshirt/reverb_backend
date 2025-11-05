---
timestamp: 'Sun Nov 02 2025 13:05:50 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251102_130550.ea443835.md]]'
content_id: 3722c8b91979480af152a51b67cbd654870ee491e16a5d0477f827b338aa3676
---

# response:

Based on the API specifications and the list of excluded routes in `passthrough.ts`, here are the synchronizations required to handle those routes. The synchronizations are organized into separate files by concept for clarity and maintainability.

The key pattern for these excluded routes is to reify the HTTP request into a `Requesting.request` action. This allows us to insert additional logic—most commonly, authentication and authorization—before triggering the target concept's action. Each logical endpoint is typically implemented with three synchronizations: one for the initial request and two for handling the success and error responses from the concept action.
