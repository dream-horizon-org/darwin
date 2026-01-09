# Darwin ML Platform - Release Process

This document describes the release process for Darwin ML Platform.

---

## Release Process Overview

```
P0. Initialization       → Release Manager assigned, environment setup
P1. Scope Development    → Feature implementation on main
P2. Release Branch Cut   → Scope freeze, release branch created
P3. Stabilization        → Bug fixes only, code freeze
P4. Release Candidate    → Build RC artifacts, validation
P5. Voting & QA          → Team validation, sign-off
P6. Finalization         → Publish, tag, announce
```

---

## Branching Strategy (Trunk-Based)

We follow **trunk-based development** with release branches. No `develop` branch.

| Branch | Purpose | Lifetime |
|--------|---------|----------|
| **`main`** | Stable trunk. All features merge here. Always deployable. | Permanent |
| **`release/X.Y.Z`** | Stabilization branch for a release. Bug fixes only. | Temporary (1-2 weeks) |
| **`feat/*`, `fix/*`** | Feature and bug fix branches from `main` | Short-lived |
| **`hotfix/X.Y.Z-*`** | Critical production fixes | Emergency only |

### Why No `develop` Branch?

For a team of 8-10 people:
- Reduces merge complexity and conflicts
- Faster integration cycles
- Easier to understand the current state
- Release branches provide isolation when needed

---

## P0. Initialization

**When**: 2 weeks before planned release date  
**Duration**: 1-2 days  
**Owner**: Release Manager (rotating role among maintainers)

### 0.1 Release Manager Assignment

The Release Manager (RM) is responsible for:
- Coordinating the release timeline
- Managing the release branch
- Building and signing artifacts
- Communication with the team

### 0.2 Prerequisites for Release Manager

Ensure you have:

| Requirement | Details |
|-------------|---------|
| Repository access | Write access to darwin repo |
| Docker registry access | Push access to public docker registry |
| GPG key | For signing artifacts (see [GPG Setup](#gpg-key-setup)) |
| Helm access | Ability to package and publish Helm charts |
| CI/CD access | Permissions to trigger release pipelines |

### 0.3 GPG Key Setup (One-Time)

```bash
# Generate a new GPG key (RSA 4096, never expires)
gpg --full-generate-key
# Use your name and email, add comment: "CODE SIGNING KEY"

# List your keys to get the key ID
gpg --list-secret-keys --keyid-format LONG
# Example output: sec rsa4096/612654F7 2024-01-01 [SC]

# Export public key to KEYS file (if maintaining public key registry)
gpg --armor --export 612654F7 >> KEYS

# (Optional) Publish to a public key server
gpg --send-key 612654F7
```

### 0.4 Announce Release Timeline

Send announcement to team with:
- Target release version (e.g., `v1.3.0`)
- Scope freeze date
- Code freeze date
- Expected release date
- Link to milestone/issues targeted for release

---

## P1. Scope Development & Implementation

**When**: Ongoing development  
**Duration**: Until scope freeze  
**Owner**: All contributors

### 1.1 Feature Development Workflow

All work targets `main` directly:

```bash
# Start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/add-gpu-support

# Develop, commit, push
git add .
git commit -m "feat(compute): add GPU node support for Ray clusters"
git push origin feat/add-gpu-support

# Open PR targeting main
# Requires: CI pass + 1 approval
```

### 1.2 Branch Naming Conventions

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feat/` | New features | `feat/auto-scaling-policy` |
| `fix/` | Bug fixes | `fix/memory-leak-tensor` |
| `docs/` | Documentation | `docs/update-api-guide` |
| `chore/` | Maintenance | `chore/upgrade-ray-2.40` |
| `refactor/` | Code refactoring | `refactor/simplify-deploy` |

### 1.3 Scope Discussion

- Track features in GitHub Issues/Milestones
- Tag issues with target release (e.g., `v1.3.0`)
- Discuss scope in team meetings
- Prioritize blockers and must-haves

---

## P2. Release Branch Cut (Scope Freeze)

**When**: Scope freeze date  
**Duration**: 1 day  
**Owner**: Release Manager

### 2.1 Create Release Branch

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create release branch
git checkout -b release/1.3.0
git push origin release/1.3.0
```

### 2.2 Version Bump on Release Branch

Update version in relevant files:

```bash
# Example: Update version in services.yaml, Helm charts, etc.
# Edit helm/darwin/Chart.yaml
version: 1.3.0
appVersion: "1.3.0"

# Commit version bump
git add .
git commit -m "chore: bump version to 1.3.0-RC1"
git push origin release/1.3.0
```

### 2.3 Announce Scope Freeze

Notify team:
- ✅ **Release branch created**: `release/1.3.0`
- 🛑 **No new features** on the release branch
- ✅ **Bug fixes only** via cherry-pick from `main`
- ✅ **Feature work continues** on `main` for next release

### 2.4 Set Up Release Branch CI

Ensure CI/CD pipelines run on the release branch:
- Nightly integration tests
- Build verification
- Security scans

---

## P3. Stabilization (Code Freeze)

**When**: After scope freeze  
**Duration**: 3-7 days  
**Owner**: Release Manager + QA

### 3.1 Allowed Changes

Only **blockers** are accepted during stabilization:

| Allowed | Not Allowed |
|---------|-------------|
| ✅ Bugs that break functionality | ❌ New features |
| ✅ Security vulnerabilities | ❌ Refactoring |
| ✅ Performance regressions | ❌ "Nice to have" fixes |
| ✅ Documentation fixes | ❌ Dependency upgrades (unless security) |

### 3.2 Bug Fix Workflow (Cherry-Pick)

All fixes should be made on `main` first, then cherry-picked:

```bash
# Fix bug on main
git checkout main
git checkout -b fix/scheduler-crash
# ... fix the bug ...
git commit -m "fix(compute): resolve scheduler crash on cluster termination"
git push origin fix/scheduler-crash
# Merge PR to main

# Cherry-pick to release branch
git checkout release/1.3.0
git cherry-pick <commit-sha>
git push origin release/1.3.0
```

### 3.3 Run Integration Tests

Execute full test suite on release branch:

```bash
# Run all nightly tests (clean build recommended for releases)
./setup.sh -y --clean   # Clean install: deletes cluster & data
./start.sh

# Verify all services are healthy
kubectl get pods -n darwin
kubectl get pods -n ray

# Run end-to-end tests
# (Create cluster, deploy model, run inference)
```

### 3.4 Run Load Tests

For major releases, run load tests to ensure no performance regressions:
- Cluster creation throughput
- Feature store latency
- Model serving response times

---

## P4. Release Candidate Build

**When**: After stabilization  
**Duration**: 1-2 days  
**Owner**: Release Manager

### 4.1 Prepare Release Notes

Create `RELEASE_NOTES.md` for this version:

```markdown
# Darwin v1.3.0 Release Notes

## Highlights
- GPU support for Ray clusters
- Auto-scaling policies
- Improved feature store latency

## New Features
- feat(compute): GPU node support (#123)
- feat(serve): canary deployments (#124)

## Bug Fixes
- fix(compute): scheduler crash on termination (#125)
- fix(mlflow): experiment search pagination (#126)

## Breaking Changes
- compute SDK: `create_cluster()` now requires `runtime` parameter

## Upgrade Notes
- Run database migrations: `./pre-deploy.sh`
- Update SDK: `pip install darwin-sdk==1.3.0`

## Known Issues
- [#130] GPU clusters require manual quota configuration
```

### 4.2 Build Release Artifacts

```bash
# Checkout release branch
git checkout release/1.3.0

# Build all Docker images (use --clean for fresh release build)
./setup.sh -y --clean

# Tag images with release version
for service in darwin-compute darwin-mlflow darwin-cluster-manager ml-serve-app; do
  docker tag localhost:5000/$service:latest localhost:5000/$service:1.3.0
  docker tag localhost:5000/$service:latest localhost:5000/$service:1.3.0-RC1
  docker push localhost:5000/$service:1.3.0-RC1
done

# Package Helm charts
helm package helm/darwin --version 1.3.0 --app-version 1.3.0
```

### 4.3 Generate Checksums

```bash
# Generate SHA512 checksums for all artifacts
sha512sum darwin-1.3.0.tgz > darwin-1.3.0.tgz.sha512
sha512sum darwin-*.tar.gz > checksums.sha512
```

### 4.4 Sign Artifacts (GPG)

```bash
# Sign the Helm chart
gpg --armor --detach-sign darwin-1.3.0.tgz

# Verify signature
gpg --verify darwin-1.3.0.tgz.asc darwin-1.3.0.tgz
```

### 4.5 Stage Artifacts

Push RC artifacts to staging:
- Docker images with `-RC1` tag
- Helm chart to staging repository
- Source tarball

---

## P5. Voting & QA

**When**: After RC build  
**Duration**: 2-3 days  
**Owner**: All team members

### 5.1 Announce RC for Validation

Send to team:
```
Subject: [VOTE] Darwin v1.3.0-RC1

Hi team,

Darwin v1.3.0-RC1 is ready for validation.

Release Notes: [link]
Docker Images: localhost:5000/*:1.3.0-RC1
Helm Chart: [staging repo link]

Please validate and vote:
+1 = Approve
-1 = Block (must provide reason)

Voting closes: [date + 48 hours]
```

### 5.2 Release Validation Checklist

Each team member should verify:

**Installation & Startup**
- [ ] `./setup.sh` completes without errors
- [ ] `./start.sh` deploys all services
- [ ] All pods reach `Running` state
- [ ] Health endpoints respond

**Core Workflows**
- [ ] Create Ray cluster via Compute API
- [ ] Run job on Ray cluster
- [ ] Log experiment to MLflow
- [ ] Deploy model via Hermes CLI
- [ ] Inference endpoint responds correctly

**Artifact Verification**
- [ ] Checksum matches: `sha512sum -c checksums.sha512`
- [ ] GPG signature valid: `gpg --verify darwin-1.3.0.tgz.asc`
- [ ] Docker images pull correctly
- [ ] Helm chart installs correctly

**Upgrade Path**
- [ ] Upgrade from previous version works
- [ ] Database migrations run successfully
- [ ] No data loss or corruption

### 5.3 Handle Validation Failures

If blockers are found:
1. Fix on `main`, cherry-pick to release branch
2. Build new RC (`-RC2`, `-RC3`, etc.)
3. Restart voting

---

## P6. Finalization

**When**: After successful vote  
**Duration**: 1 day  
**Owner**: Release Manager

### 6.1 Create Git Tag

```bash
# Checkout release branch
git checkout release/1.3.0

# Create signed tag
git tag -s v1.3.0 -m "Darwin v1.3.0"

# Push tag
git push origin v1.3.0
```

### 6.2 Merge Release Branch to Main

```bash
# Merge release branch back to main
git checkout main
git merge release/1.3.0
git push origin main

# Delete release branch (optional, keep for reference)
git branch -d release/1.3.0
git push origin --delete release/1.3.0
```

### 6.3 Publish Artifacts

**Docker Images**
```bash
# Promote RC to release
for service in darwin-compute darwin-mlflow darwin-cluster-manager ml-serve-app; do
  docker tag localhost:5000/$service:1.3.0-RC1 localhost:5000/$service:1.3.0
  docker tag localhost:5000/$service:1.3.0-RC1 localhost:5000/$service:latest
  docker push localhost:5000/$service:1.3.0
  docker push localhost:5000/$service:latest
done
```

**Helm Charts**
```bash
# Publish to Helm repository
helm push darwin-1.3.0.tgz oci://registry.example.com/charts
```

**SDKs** (if applicable)
```bash
# Python SDK
cd darwin-sdk
pip install build twine
python -m build
twine upload dist/*
```

### 6.4 Create GitHub Release

Create release on GitHub:
- Tag: `v1.3.0`
- Title: `Darwin v1.3.0`
- Body: Copy from `RELEASE_NOTES.md`
- Attach: Source tarball, checksums, signatures

### 6.5 Update Documentation

- Update version references in README
- Update compatibility matrix
- Archive previous version docs (if versioned)

### 6.6 Announce Release

Send announcement:
```
Subject: [ANNOUNCE] Darwin v1.3.0 Released

Hi team,

Darwin v1.3.0 is now available!

Highlights:
- GPU support for Ray clusters
- Auto-scaling policies
- Improved feature store latency

Release Notes: [link]
Documentation: [link]
Docker Images: registry.example.com/*:1.3.0

Upgrade Guide: [link]

Thanks to all contributors!
```

---

## Hotfix Process

For critical production bugs that can't wait for next release:

```bash
# Create hotfix branch from release tag
git checkout v1.3.0
git checkout -b hotfix/1.3.1-security-fix

# Fix the issue
git commit -m "fix(security): patch CVE-2024-XXXX"

# Tag hotfix release
git tag -s v1.3.1 -m "Darwin v1.3.1 - Security Hotfix"

# Merge hotfix to main
git checkout main
git merge hotfix/1.3.1-security-fix

# Push everything
git push origin main
git push origin v1.3.1
```

---

## Release Artifacts Checklist

A complete Darwin release includes:

| Artifact | Format | Location |
|----------|--------|----------|
| Docker Images | `service:X.Y.Z` | Docker Registry |
| Helm Chart | `darwin-X.Y.Z.tgz` | Helm Repository |
| Source Code | `.tar.gz`, `.zip` | GitHub Release |
| Checksums | `.sha512` | GitHub Release |
| GPG Signatures | `.asc` | GitHub Release |
| Release Notes | `RELEASE_NOTES.md` | GitHub Release |
| SDK (Python) | `.whl` | PyPI (if public) |

---

## Release Calendar Template

| Week | Phase | Activities |
|------|-------|------------|
| W-2 | P0 | RM assigned, timeline announced |
| W-1 | P1 | Feature completion, scope review |
| W0 Mon | P2 | Release branch cut, scope freeze |
| W0 Tue-Thu | P3 | Stabilization, bug fixes |
| W0 Fri | P4 | RC1 build |
| W1 Mon-Tue | P5 | Team validation, voting |
| W1 Wed | P6 | Finalization, publish |
| W1 Thu | - | Announcement |

---

## Quick Reference

### For Contributors

```bash
# During development (target main)
git checkout main && git pull
git checkout -b feat/my-feature
# ... work ...
git push origin feat/my-feature
# Open PR → main

# Bug fix during stabilization
# 1. Fix on main first
# 2. Release Manager cherry-picks to release branch
```

### For Release Manager

```bash
# Cut release branch
git checkout main && git checkout -b release/X.Y.Z

# Cherry-pick fixes
git checkout release/X.Y.Z && git cherry-pick <sha>

# Build RC (clean build)
./setup.sh -y --clean
docker tag ... && docker push ...

# Tag release
git tag -s vX.Y.Z -m "Darwin vX.Y.Z"

# Merge back
git checkout main && git merge release/X.Y.Z
```

---

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

| Version | When to Bump | Example |
|---------|--------------|---------|
| **MAJOR** (X.0.0) | Breaking API changes | Cluster SDK incompatible |
| **MINOR** (0.X.0) | New features (backward compatible) | Add GPU support |
| **PATCH** (0.0.X) | Bug fixes only | Fix scheduler crash |

---

## References

- [Apache Ignite Release Process](https://cwiki.apache.org/confluence/display/IGNITE/Release+Process)
- [Semantic Versioning](https://semver.org/)
- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [GPG Key Management](https://www.apache.org/dev/openpgp.html)
