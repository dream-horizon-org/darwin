# Design — _example

<!-- Optional. Write this when the change involves non-obvious technical decisions.
     See docs/sdlc/DESIGN-STANDARD.md for the full standard.
     Delete this file if there are no meaningful technical decisions to record. -->

## Approach

(Example) Describe in one paragraph how this change will be built — the technical approach, not the behavior. The spec covers what; this covers how.

## Decisions

- **Storage choice:** Use in-memory store for this example. For production, replace with the appropriate persistence layer and document the rationale here.
- **Pattern:** (Example) Chose factory over direct instantiation to support testability.

## Alternatives considered

- **Alternative approach:** Rejected because it would require changes to unrelated modules, increasing risk.

## Constraints

- Must remain backward-compatible with the existing API contract (no breaking changes).

## Open questions

- (Example) Cache invalidation strategy — to be resolved before Phase 4 begins.
