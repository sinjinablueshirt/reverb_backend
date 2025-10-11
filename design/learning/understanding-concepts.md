[@concept-design-overview](../background/concept-design-overview.md)

# question: how can concepts be modular?

# response:

Concepts achieve modularity through several key design principles and features, as described in the text:

1.  **Concept Independence:** This is perhaps the most significant aspect. Each concept is:
    *   **Defined in isolation:** "without reference to any other concepts."
    *   **Understood in isolation:** "understanding one doesn’t require understanding another."
    *   This independence means they can be worked on by different teams, developed, and tested separately, facilitating scalable design and development.
    *   **Polymorphism** is key to this, making concepts generic and free of assumptions about the specific content of objects they interact with.

2.  **Self-Contained State:** "Each concept maintains its own state." All the data necessary for a concept's behavior is encapsulated within itself. For example, the *Upvote* concept holds information about items and users to prevent double voting. This ensures that a concept doesn't rely on external data structures or the internal state of other concepts to fulfill its purpose.

3.  **Well-Defined Interface (Atomic Actions):** Concepts interact with users and other concepts through "atomic actions." These actions form a clear, explicit API (similar to backend services), defining the only way to engage with the concept. This hides internal complexity and provides a controlled point of interaction.

4.  **Strong Separation of Concerns:** Concepts address "only a single, coherent aspect of the functionality of the application." This avoids conflating different functional aspects that are often combined in traditional designs (e.g., a single *User* class handling authentication, profiles, and notifications). Instead, these would be separate, focused concepts.

5.  **Completeness of Functionality:** Concepts are "complete with respect to their functionality and don't rely on functionality from other concepts." For instance, a *Notification* concept that has an action to notify a user would include the logic to deliver that notification (e.g., via email or text) within itself, rather than calling out to a separate emailing concept. This ensures a concept can fully execute its purpose independently.

6.  **Reusability:** Due to their independence, focused purpose, and generalized design, "Most concepts are reusable across applications." An *Upvote* concept can be used in different contexts (e.g., comments on NYT or answers on Stack Overflow) and even multiple times within the same application. This reusability reduces design and development effort and provides familiar interactions for users.

7.  **Composition by Synchronization:** Instead of direct coupling or internal calls, concepts are composed using *synchronizations* (syncs). Syncs are external rules that define how actions in one concept trigger actions in another, based on specific state conditions. This external orchestration mechanism further reinforces the independence of concepts, as they don't directly "know about" or "use the services" of other concepts.

In summary, concepts achieve modularity by being independent, self-contained units with clearly defined interfaces, focused responsibilities, and complete functionality, which are then externally orchestrated through synchronizations rather than internal coupling.