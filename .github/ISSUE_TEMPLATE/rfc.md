---
name: 📋 RFC (Request for Comments)
about: Propose a significant change or new feature that needs design discussion
title: '[RFC] '
labels: rfc, discussion
assignees: ''
---

## Summary

<!-- One paragraph explanation of the proposal -->

## Motivation

<!-- Why are we doing this? What problem does it solve? What use cases does it support? -->

## Detailed Design

<!-- Explain the design in detail. Include:
- API changes (if any)
- Database schema changes (if any)
- New dependencies (if any)
- Architecture diagrams (if helpful)
-->

## Alternatives Considered

<!-- What other designs were considered? Why were they rejected? -->

## Impact

### Services Affected

- [ ] darwin-compute
- [ ] darwin-cluster-manager
- [ ] feature-store
- [ ] mlflow
- [ ] ml-serve-app
- [ ] artifact-builder
- [ ] chronos
- [ ] darwin-catalog
- [ ] darwin-workflow
- [ ] hermes-cli
- [ ] Helm charts
- [ ] SDK

### Breaking Changes

<!-- Will this break existing functionality? How will users migrate? -->

- [ ] No breaking changes
- [ ] Breaking changes (describe migration path below)

### Migration Path

<!-- If there are breaking changes, how will users migrate? -->

## Implementation Plan

<!-- How will this be implemented? Break into phases if needed -->

1. Phase 1: 
2. Phase 2: 
3. Phase 3: 

## Open Questions

<!-- What questions need to be resolved before implementation? -->

- [ ] Question 1
- [ ] Question 2

## Timeline

<!-- Estimated timeline for implementation -->

| Phase | Duration | Owner |
|-------|----------|-------|
| Design Review | 1 week | @author |
| Implementation | X weeks | TBD |
| Testing | X days | TBD |

---

## RFC Process

1. **Draft**: Author creates RFC issue, labels it `rfc`
2. **Discussion**: Team comments, asks questions (1 week minimum)
3. **Revision**: Author addresses feedback, updates RFC
4. **Decision**: Team lead approves/rejects (add `approved` or `rejected` label)
5. **Implementation**: Create feature branch, link to RFC issue

**To approve**: Add 👍 reaction and comment "LGTM" with any conditions  
**To request changes**: Comment with specific feedback  
**To block**: Add 👎 reaction with blocking reason
