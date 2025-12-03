# 🚀 Quick Start Guide - Open Source Mode

This application now runs without authentication. All login code has been **commented out** (not deleted).

## ⚡ Get Started in 3 Steps

### 1. Start GraphQL Server
```bash
# Make sure your GraphQL server is running at:
# http://localhost:4000/graphql
```

### 2. Update Schema (First Time Only)
```bash
yarn gql:update    # Fetch schema from GraphQL server
yarn gql:compile   # Generate TypeScript types
```

### 3. Start Frontend
```bash
yarn start
# Opens at http://localhost:7700
```

That's it! You're automatically logged in as "Open Source User" with full access. 🎉

---

## 📚 Documentation

- **What Changed?** → Read `OPEN_SOURCE_CHANGES.md`
- **Where's the Code?** → Read `AUTHENTICATION_MARKERS.md`
- **Quick Summary** → Read `SUMMARY_OF_CHANGES.md`

## 🔍 Finding Commented Code

Search for: **`OPEN SOURCE MODE`** in your IDE

All authentication code is preserved in comments, clearly marked and documented.

## ⚙️ GraphQL Server Requirements

Your server at `http://localhost:4000/graphql` should:
- ✅ Accept requests without authentication headers
- ✅ Allow GraphQL introspection
- ✅ Handle CORS for localhost

## 🔐 Re-enable Authentication?

Follow the step-by-step guide in `OPEN_SOURCE_CHANGES.md`

All original code is preserved - just uncomment it!

---

**Need Help?** All changes are documented with clear comments in the code.

