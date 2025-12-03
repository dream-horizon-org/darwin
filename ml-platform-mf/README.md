# ML Platform MicroFrontend

This repository contains the frontend code for the ML Platform web application.

ML Platform is built as a microfrontend that can work standalone or as part of a larger microfrontend framework.

# Prerequisites

1. **Frontend Container (Optional)**

   If you're using a microfrontend architecture, you may need a frontend container application to host this microfrontend. The container application manages routing and orchestration between multiple microfrontends.

2. **GraphQL Backend**
   
   The ML Platform requires a GraphQL backend service (like `ml-platform-graphql` in this distribution) that acts as a Backend-for-Frontend (BFF) layer, connecting the UI with backend ML services.

# Setup

## Development Requirements

- **Node.js**: >= v16.x (recommended: v20.16.0)
- **Yarn**: >= 1.22.x

## Installation

1.  **Install Node.js** via [nvm](https://github.com/nvm-sh/nvm)

    ```bash
    nvm install 20.16.0
    nvm use 20.16.0
    ```

2.  **Install yarn globally**

    ```bash
    npm install -g yarn
    ```

3.  **Clone and install dependencies**

    ```bash
    git clone <repository-url>
    cd ml-platform-mf
    yarn install
    ```

4.  **Build the application**

    ```bash
    yarn build
    ```

5.  **Start the development server**

    ```bash
    yarn start
    ```

    The application will be available at `http://localhost:7700` (or the port configured in your environment)

## Standalone Mode

If you're running the ML Platform as a standalone application (not within a microfrontend container), ensure the GraphQL backend service is running and accessible.

# Configuration

The application supports multiple environment configurations managed using [node-config-ts](https://github.com/tusharmath/node-config-ts).

Configuration files are located in the `/config` directory:
- `default.json` - Default configuration
- `dev.json` - Development environment
- `production.json` - Production environment
- `custom-environment-variables.json` - Environment variable mappings

## Environment Variables

Key environment variables:
- `NODE_ENV` - Environment mode (development, production)
- `PORT` - Server port (default: 7700)
- GraphQL endpoint URLs (see config files for details)

# Testing

Unit testing, integration testing and snapshot testing are the three types of testing we do as part of our CI runs.

## Unit testing

The goal of unit testing is to isolate each part of the program and show that the individual parts are correct.

To run all unit tests.

```
yarn test
```

## Snapshot Testing

Snapshot test is a way to evaluate changes in component structure.

To update the snapshots when you make changes to your component run

```
yarn test -u
```

## Integration Testing

It tests the interaction between individual components. It helps in detecting behavioral errors of the feature.

To run all integration tests

```
yarn integration-test
```

# Deployment

## Docker Deployment

The application includes a `Dockerfile` for containerized deployments.

### Build Docker Image

```bash
docker build -t ml-platform-mf:latest .
```

### Run Docker Container

```bash
docker run -p 7700:7700 \
  -e NODE_ENV=production \
  ml-platform-mf:latest
```

## Kubernetes Deployment

The application can be deployed to Kubernetes using the included Helm charts (see `/helm` directory in the parent darwin-distro repository).

### Using Kind (Local Kubernetes)

For local development, you can use Kind (Kubernetes in Docker):

```bash
# From the darwin-distro root directory
./kind/start-cluster.sh
./start.sh
```

## Production Considerations

When deploying to production:

1. **Environment Variables**: Ensure all required environment variables are properly configured
2. **Security**: Configure proper authentication and authorization
3. **Monitoring**: Set up logging and monitoring for the application
4. **SSL/TLS**: Use HTTPS in production environments
5. **Resource Limits**: Configure appropriate CPU and memory limits in Kubernetes
6. **Health Checks**: Ensure liveness and readiness probes are configured

# Architecture & Documentation

## Project Structure

- `/src` - Source code
  - `/components` - Reusable React components
  - `/modules` - Feature modules
  - `/utils` - Utility functions
  - `/server` - Server-side code
- `/config` - Environment configurations
- `/public` - Static assets
- `/tests` - Test files

## Additional Documentation

- [TechStack](./TECHSTACK.md) - Technology stack and libraries used
- [Folder Nomenclature](./NOMENCLATURE.md) - Project structure and naming conventions
- [Generate TS and IO-TS types for GQL Query](./docs/types-generation.md) - GraphQL type generation
- [Data Fetching using useGQL Hook](./docs/Data-Fetching.md) - Data fetching patterns

## Contributing

When contributing to this project:

1. Follow the existing code style and conventions
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting changes

## License

See LICENSE file for details.
