# Darwin Release Process & Contribution Guide

Welcome to the development guide for **Darwin** (Dream11 ML Platform). This document outlines our branching strategy, development lifecycle, and the release process designed to maintain stability while automating repetitive tasks.

---

## 1. Branching Strategy

We follow a streamlined version of the [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

| Branch | Status | Description |
| :--- | :--- | :--- |
| **`main`** | **Stable** | The official release history. Contains the latest production-ready code. No direct commits; only merges from release branches or hotfixes. |
| **`develop`** | **Active** | The integration branch for the next version. All new features and non-critical bug fixes target this branch. |
| **`release/*`** | **Frozen** | Temporary branches for finalizing a release (e.g., `release/1.2.0`). No new features allowed here. |

---

## 2. Naming Conventions

To ensure a clean and readable history, please use the following prefixes for your branches:

* **Features:** `feat/`
    * *Format:* `feat/<short-description>`
    * *Example:* `feat/add-model-monitoring`
* **Bug Fixes:** `fix/`
    * *Format:* `fix/<short-description>`
    * *Example:* `fix/memory-leak-tensor-serving`
* **Hotfixes:** `hotfix/` (Critical production bugs on `main`)
    * *Format:* `hotfix/<version>-<description>`
    * *Example:* `hotfix/1.1.1-security-patch-log4j`
* **Documentation:** `docs/`
    * *Example:* `docs/update-setup-guide`
* **Chore:** `chore/` (Build tasks, dependency updates, cleanup)
    * *Example:* `chore/upgrade-gradle-7`

---

## 3. Development Workflow

### A. The Feature Cycle (Standard Dev)
1.  **Sync Up:** Always start by pulling the latest `develop`.
    ```bash
    git checkout develop
    git pull origin develop
    ```
2.  **Create Branch:** Create a feature branch off `develop`.
    ```bash
    git checkout -b feat/new-scheduler
    ```
3.  **Develop:** Write code and ensure local unit tests pass.
4.  **Open Pull Request (PR):**
    * **Target:** `develop`
    * **Requirements:** CI "Gatekeeper" pipeline must pass.
    * **Review:** At least 1 approval from a Maintainer is required.
5.  **Merge:** Squash and merge into `develop`.

### B. The Bug Fix Cycle
1.  **Branch:** Create a branch off `develop` (unless it's a `hotfix` for `main`).
    ```bash
    git checkout -b fix/scheduler-lag
    ```
2.  **Reproduce:** Add a test case that reproduces the bug (it should fail initially).
3.  **Fix:** Implement the fix so the test passes.
4.  **Merge:** Follow the standard PR process targeting `develop`.

---

## 4. The Release Process

Our release process is modeled after Apache NiFi and Ignite to ensure high quality and security.

### Phase 1: The Freeze (Release Branch Cut)
* **Trigger:** Release Manager (RM) decides a milestone is reached.
* **Action:** RM creates a release branch from `develop`.
    ```bash
    git checkout -b release/1.2.0 develop
    ```
* **Versioning:** Update project version from `1.2.0-SNAPSHOT` to `1.2.0-RC1` (Release Candidate 1).
* **Code Freeze:** No new features permitted. Only critical bug fixes discovered during testing are cherry-picked into this branch.

### Phase 2: Validation (Voting & QA)
* **Build:** CI generates signed artifacts (Docker images, JARs, Wheels).
* **Staging:** Artifacts are pushed to a Staging Repository.
* **Community Vote/QA:** Developers validate the RC using the **Release Checklist**:
    * [ ] Clean install/startup.
    * [ ] Successful execution of the "Hello World" ML pipeline.
    * [ ] Checksum verification (`.sha512`).
    * [ ] License header compliance.
* **Outcome:** If bugs are found, fix them, create `RC2`, and restart Phase 2.

### Phase 3: Finalization
* **Tag:** Create a GPG-signed git tag `v1.2.0`.
* **Publish:**
    * Promote artifacts from Staging to Production (Maven Central, PyPI, Docker Hub).
    * Tag Docker images as `1.2.0` and `latest`.
* **Merge Back:** Merge `release/1.2.0` into both `main` and `develop`.
* **Next Version:** Bump `develop` to `1.3.0-SNAPSHOT`.

---

## 5. CI/CD Requirements

To make life simple, Darwin relies on three specific CI pipelines.

### ✅ Pipeline 1: "The Gatekeeper" (PR Checks)
* **Runs On:** Every PR to `develop`, `main`, or `release/*`.
* **Goal:** Immediate feedback on code quality.
* **Jobs:**
    * **Linting:** Style checks (`black`, `checkstyle`).
    * **Unit Tests:** Fast, component-level tests.
    * **Build Verification:** Ensures the code compiles.

### 🌙 Pipeline 2: "The Night Watch" (Nightly Builds)
* **Runs On:** Every night at 00:00 UTC on `develop`.
* **Goal:** Catch regressions in complex flows.
* **Jobs:**
    * **Integration Tests:** Heavy end-to-end ML workflows (Training $\to$ Serving).
    * **Security Scan:** Vulnerability scanning (OWASP/Snyk).
    * **Snapshot Publish:** Deploys `SNAPSHOT` artifacts for edge testing.

### 🚀 Pipeline 3: "The Release Button" (Automation)
* **Runs On:** Manual dispatch by Release Manager.
* **Goal:** Eliminate manual toil during releases.
* **Jobs:**
    * **Changelog Generator:** Scrapes PR titles between tags to create `CHANGELOG.md`.
    * **Auto-Signing:** Signs artifacts with GPG keys stored in CI Secrets.
    * **Docs Deployment:** Builds and deploys versioned docs (e.g., `/docs/1.2.0/`).

---

## 6. Release Artifacts Checklist

A successful Darwin release must include:

1.  **Source Code:** `.zip` / `.tar.gz`.
2.  **Binaries:** Java JARs, Python Wheels (`.whl`).
3.  **Docker Images:** Pushed to registry with semantic tags.
4.  **Checksums:** `.sha512` files for all binaries.
5.  **Release Notes:** A summary of Features, Fixes, and Breaking Changes.
