# Development Guide

## Auto-Restart with Nodemon

The ML Platform GraphQL server is configured with **nodemon** for automatic restart on file changes.

### Quick Start

```bash
cd ml-platform-graphql
yarn start:dev
```

This will:
- ✅ Watch all TypeScript files for changes
- ✅ Automatically recompile TypeScript when files change
- ✅ Restart the server automatically
- ✅ Show colored output for easy debugging

### Available Scripts

| Command | Description |
|---------|-------------|
| `yarn start:dev` | **Recommended** - Auto-restart with TypeScript compilation |
| `yarn dev` | Compile once, then auto-restart |
| `yarn dev:no-compile` | Auto-restart without TypeScript compilation (fastest) |
| `yarn build` | Compile TypeScript once |
| `yarn build:watch` | Watch and recompile TypeScript continuously |
| `yarn start` | Start server without watching (production-like) |
| `yarn start:prod` | Start in production mode |

### Development Workflow

#### Option 1: Full Auto-Compilation (Recommended)
```bash
yarn start:dev
```

**What happens:**
1. Watches: `src/**/*.ts`, `*.ts`, `logger/**/*.ts`, `*.graphql`
2. On file change → Compiles TypeScript → Restarts server
3. Delay: 1 second after last change (to batch multiple saves)

**Output:**
```
[nodemon] 3.0.1
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/**/*.ts *.ts logger/**/*.ts src/**/*.graphql
[nodemon] watching extensions: ts,graphql,js,json
[nodemon] starting `tsc && node server.js`
[nodemon] clean exit - waiting for changes before restart
[nodemon] restarting due to changes...
[nodemon] files changed: src/lib/http-client.ts
[nodemon] starting `tsc && node server.js`
```

#### Option 2: Separate TypeScript Watch (Faster)

Terminal 1 - Watch TypeScript:
```bash
yarn build:watch
```

Terminal 2 - Watch Server:
```bash
yarn dev:no-compile
```

**Benefits:**
- ⚡ Faster restart (no compilation step)
- 👀 See TypeScript errors in separate terminal
- 🔄 TypeScript compiles in background

#### Option 3: Manual Build
```bash
yarn build
yarn start
```

**Use for:**
- Testing production-like behavior
- When you don't need auto-restart

### Nodemon Configuration

Located in `nodemon.json`:

```json
{
  "watch": [
    "src/**/*.ts",           // All TypeScript in src/
    "*.ts",                  // Root level TypeScript files
    "logger/**/*.ts",        // Logger TypeScript files
    "src/**/*.graphql"       // GraphQL schema files
  ],
  "ext": "ts,graphql,js,json",
  "ignore": [
    "**/*.test.ts",          // Ignore test files
    "**/*.spec.ts",          // Ignore spec files
    "node_modules/**",       // Ignore dependencies
    "**/*.js.map"            // Ignore source maps
  ],
  "exec": "tsc && node server.js",
  "delay": 1000,             // Wait 1 second after last change
  "colours": true,           // Colored output
  "verbose": false           // Reduce noise
}
```

### Customizing Nodemon

#### Change Watched Files

Edit `nodemon.json`:
```json
{
  "watch": [
    "src/**/*.ts",
    "config/**/*.json",     // Add: Watch config files
    "schema/**/*.graphql"   // Add: Watch schema files
  ]
}
```

#### Change Restart Delay

Edit `nodemon.json`:
```json
{
  "delay": 2000  // Wait 2 seconds instead of 1
}
```

#### Enable Verbose Logging

Edit `nodemon.json`:
```json
{
  "verbose": true  // Show detailed nodemon logs
}
```

### Manual Restart

While nodemon is running, you can manually restart:

```bash
# Type in the terminal where nodemon is running:
rs
```

Or press `Ctrl+R`

### Stop Nodemon

Press `Ctrl+C` twice

### What Files Trigger Restart?

✅ **Will restart:**
- `src/**/*.ts` - Any TypeScript in src folder
- `*.ts` - Root TypeScript files (server.ts, bootloader.ts, etc.)
- `logger/**/*.ts` - Logger TypeScript files
- `src/**/*.graphql` - GraphQL schema files
- `*.js` - Root JavaScript files (after compilation)
- `*.json` - JSON files (like package.json)

❌ **Will NOT restart:**
- `**/*.test.ts` - Test files
- `**/*.spec.ts` - Spec files
- `node_modules/**` - Dependencies
- `**/*.js.map` - Source maps

### Troubleshooting

#### Server doesn't restart after changes

**Check:**
1. Is the file being watched?
   ```bash
   # Check nodemon output for "watching path(s):"
   ```

2. Add the file pattern to `nodemon.json`:
   ```json
   {
     "watch": ["your/file/path/**/*.ts"]
   }
   ```

#### TypeScript errors but server still starts

**Solution:**
- Use separate terminals (Option 2 above)
- The TypeScript watch will show errors immediately
- Server restart will fail if compilation fails

#### Too many restarts

**Solution:**
- Increase delay in `nodemon.json`:
  ```json
  { "delay": 2000 }
  ```

#### Nodemon not detecting changes

**Check:**
1. File system permissions
2. If using Docker, enable polling:
   ```json
   {
     "legacyWatch": true,
     "polling": true
   }
   ```

### Performance Tips

#### Fast Development (Recommended)
```bash
# Terminal 1
yarn build:watch

# Terminal 2  
yarn dev:no-compile
```

**Why?**
- TypeScript compiles in background (faster, incremental)
- Server restarts immediately on .js file changes
- See compilation errors in separate terminal

#### Slower but Simpler
```bash
yarn start:dev
```

**Why?**
- Single command
- Everything in one terminal
- TypeScript compiles before each restart (slower)

### Environment Variables

Set in `nodemon.json` (applies to all runs):
```json
{
  "env": {
    "NODE_ENV": "dev-local",
    "CURL_LOGGING": "true",
    "ENABLE_PLAYGROUND": "true"
  }
}
```

Or override when running:
```bash
ENABLE_MOCKS=true yarn start:dev
```

### Integration with Root Scripts

The root `package.json` can still use the existing commands:

```bash
# From root directory
yarn start:dev:ml-platform
```

This will use the nodemon configuration automatically!

## Summary

🎯 **For daily development:** `yarn start:dev`  
⚡ **For fast development:** `yarn build:watch` + `yarn dev:no-compile`  
🧪 **For testing:** `yarn build && yarn start`  

All development modes now have **automatic restart** on file changes! 🎉

