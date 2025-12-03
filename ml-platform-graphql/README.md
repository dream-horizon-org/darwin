# ML Platform GraphQL

A standalone GraphQL server for ML Platform operations, providing a unified API for machine learning workflows, model deployments, and feature management.

## Features

- 🚀 Standalone GraphQL server (no federation required)
- 🔧 Environment-based configuration
- 📊 OpenTelemetry instrumentation support
- 🎮 Built-in GraphQL Playground
- 🔒 Configurable authentication (Phase 1: hardcoded user)
- 📝 Comprehensive logging with Winston

## Prerequisites

- Node.js v20.16.0 or higher
- Yarn package manager
- TypeScript

## Getting Started

### 1. Installation

```bash
yarn install
```

### 2. Configuration

Copy the template environment file and configure it:

```bash
cp env.template .env
```

Edit `.env` with your configuration:

```env
PORT=4000
NODE_ENV=development
DEFAULT_SERVICE_HOST=http://your-backend-service
ENABLE_PLAYGROUND=true
LOG_LEVEL=info
```

### 3. Build

Compile TypeScript files:

```bash
yarn tsc
```

Or from the root:

```bash
yarn build
```

### 4. Run the Server

Start the development server:

```bash
yarn start
```

The server will be available at:
- GraphQL endpoint: `http://localhost:4000/graphql`
- GraphQL Playground: `http://localhost:4000/graphql` (if enabled)
- Health check: `http://localhost:4000/health`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `DEFAULT_SERVICE_HOST` | Default backend service URL | `http://localhost:8000` |
| `LOG_LEVEL` | Logging level (error, warn, info, debug) | `info` |
| `CURL_LOGGING` | Enable cURL logging in dev mode | `false` |
| `ENABLE_MOCKS` | Enable mock data | `false` |
| `ENABLE_PLAYGROUND` | Enable GraphQL Playground | `true` |
| `ENABLE_INTROSPECTION` | Enable schema introspection | `true` |
| `ENABLE_TRACING` | Enable Apollo tracing | `false` |

## Project Structure

```
ml-platform/
├── src/
│   ├── lib/
│   │   ├── config.ts           # Configuration management
│   │   ├── http-client.ts      # HTTP client for backend services
│   │   ├── logger.ts           # Winston logger setup
│   │   └── utils.ts            # Utility functions
│   ├── loaders/                # DataLoader implementations
│   ├── resolvers/              # GraphQL resolvers
│   ├── schema/                 # GraphQL schema definitions
│   └── index.ts                # Module exports
├── bootloader.ts               # Apollo Server setup
├── server.ts                   # Express server
├── package.json
├── tsconfig.json
└── .env.example
```

## Development

### Running in Development Mode

```bash
NODE_ENV=dev-local CURL_LOGGING=true yarn start
```

### Linting

```bash
yarn lint
```

### Fix Linting Issues

```bash
yarn lint:fix
```

### Testing

```bash
yarn test
```

## Phase 1: Hardcoded User

In the current phase, authentication is simplified with a hardcoded user:

```typescript
{
  id: 1,
  name: 'ML Platform User',
  email: 'mlplatform@example.com',
  role: 'admin'
}
```

All requests automatically use this user with full permissions. Future phases will implement proper authentication.

## API Usage

### Health Check

```bash
curl http://localhost:4000/health
```

### GraphQL Query Example

```graphql
query {
  # Your queries here
}
```

Using cURL:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

## Migration from Subgraph

This service was migrated from an Apollo Federation subgraph to a standalone GraphQL server. Key changes:

1. ✅ Removed `@apollo/subgraph` and `@apollo/federation` dependencies
2. ✅ Replaced with standard `@graphql-tools/schema`
3. ✅ Internalized shared utilities (`d11-request`, `d11-utils`, logger)
4. ✅ Replaced `@d11/config` with environment-based configuration
5. ✅ Simplified authentication (Phase 1: hardcoded user)

## Roadmap

### Phase 2 (Planned)
- [ ] Implement proper authentication (JWT, OAuth, etc.)
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Enhanced error handling
- [ ] API documentation generation

### Phase 3 (Planned)
- [ ] Add caching layer (Redis)
- [ ] Implement subscriptions (WebSocket)
- [ ] Add metrics dashboard
- [ ] Performance optimizations

## Troubleshooting

### Port Already in Use

If port 4000 is already in use:

```bash
PORT=5000 yarn start
```

### TypeScript Errors

Clean and rebuild:

```bash
yarn tsc --build --clean
yarn tsc
```

### Missing Dependencies

```bash
yarn install --force
```

## Contributing

1. Make changes in feature branch
2. Run tests: `yarn test`
3. Run linting: `yarn lint:fix`
4. Commit with descriptive message
5. Create pull request

## License

[Your License Here]

## Deployment

### Odin Platform (Production Deployment)

This service is deployed via the **Odin platform** using the scripts in the `.odin/` folder.

📖 **See [ODIN_DEPLOYMENT_READY.md](./ODIN_DEPLOYMENT_READY.md)** for complete deployment guide

**Deployment Process:**
1. Odin runs `.odin/ml-platform-graphql/build.sh` - Builds the service
2. Odin packages the built service
3. Odin deploys to target environment
4. Odin runs `.odin/ml-platform-graphql/start.sh` - Starts with PM2 + envconsul
5. Service loads config from Consul and secrets from Vault

**Key Files:**
- `.odin/ml-platform-graphql/build.sh` - Build script
- `.odin/ml-platform-graphql/start.sh` - Startup script  
- `.odin/ml-platform-graphql/application-spec.yml` - Service specification
- `pm2/*.json` - PM2 process manager configs

### Local Development (darwin-distro)

For local development with darwin-distro:

**Note:** darwin-distro handles all Docker/K8s/Helm configuration. This repository only contains:
- Source code
- Build scripts (.odin/)
- Runtime configs (pm2/)

**Integration:**
1. Copy this repo into darwin-distro directory
2. darwin-distro's deployment scripts will handle containerization and deployment
3. Refer to darwin-distro documentation for local setup

## Support

For issues or questions, please contact the ML Platform team.

