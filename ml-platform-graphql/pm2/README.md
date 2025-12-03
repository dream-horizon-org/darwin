# PM2 Configuration Files

PM2 process manager configurations for different environments.

## Files

- **pm2-dev.json** - Development environment (1 instance, debug logs)
- **pm2-stag.json** - Staging environment (2 instances, info logs)
- **pm2-uat.json** - UAT environment (2 instances, info logs)
- **pm2-prod.json** - Production environment (max instances, warn logs)

## Usage

### Via Odin Scripts

The `.odin/ml-platform-graphql/start.sh` script automatically uses the appropriate PM2 config:

```bash
# From build output directory
sh .odin/ml-platform-graphql/start.sh
```

### Direct PM2 Usage

```bash
# Development
pm2 start pm2/pm2-dev.json

# Staging
pm2 start pm2/pm2-stag.json

# UAT
pm2 start pm2/pm2-uat.json

# Production
pm2 start pm2/pm2-prod.json

# View logs
pm2 logs ml-platform-graphql-{env}

# Monitor
pm2 monit

# Restart
pm2 restart ml-platform-graphql-{env}

# Stop
pm2 stop ml-platform-graphql-{env}

# Delete
pm2 delete ml-platform-graphql-{env}
```

### With envconsul (Recommended)

For production deployments with Consul/Vault:

```bash
# Container mode (PM2 runtime)
envconsul -config=envconsul.hcl pm2-runtime start pm2/pm2-prod.json

# Regular mode
envconsul -config=envconsul.hcl pm2 start pm2/pm2-prod.json
```

## Configuration Details

### Instance Count

- **Dev**: 1 instance (easier debugging)
- **Stag/UAT**: 2 instances (basic HA)
- **Prod**: max instances (uses all CPU cores)

### Memory Limits

All environments: 512MB max per instance

If memory exceeds this, PM2 will restart the process.

### Logging

Logs are written to:
- Error logs: `/var/log/ml-platform-graphql/error.log`
- Output logs: `/var/log/ml-platform-graphql/out.log`

**Note**: Ensure log directory exists:
```bash
mkdir -p /var/log/ml-platform-graphql
```

### Auto-restart

- Enabled for all environments
- Max 10 restarts within min uptime window
- 4 second delay between restarts
- Min uptime: 10 seconds before considered stable

## Environment Variables

PM2 configs set these base variables, but they can be overridden by:
1. Consul/Vault (via envconsul)
2. System environment variables
3. `.env` file (if using dotenv)

### Per Environment

#### Development
- `NODE_ENV=development`
- `ENABLE_PLAYGROUND=true`
- `ENABLE_INTROSPECTION=true`
- `LOG_LEVEL=debug`
- `CURL_LOGGING=true`

#### Staging
- `NODE_ENV=staging`
- `ENABLE_PLAYGROUND=true`
- `ENABLE_INTROSPECTION=true`
- `LOG_LEVEL=info`

#### UAT
- `NODE_ENV=uat`
- `ENABLE_PLAYGROUND=true`
- `ENABLE_INTROSPECTION=true`
- `LOG_LEVEL=info`

#### Production
- `NODE_ENV=production`
- `ENABLE_PLAYGROUND=false` ⚠️ Disabled for security
- `ENABLE_INTROSPECTION=false` ⚠️ Disabled for security
- `ENABLE_TRACING=true` (for monitoring)
- `LOG_LEVEL=warn`

## Monitoring

### PM2 Commands

```bash
# List processes
pm2 list

# Monitor (real-time)
pm2 monit

# View logs
pm2 logs ml-platform-graphql-prod

# Show process details
pm2 show ml-platform-graphql-prod

# Reload (0-downtime)
pm2 reload ml-platform-graphql-prod

# Restart
pm2 restart ml-platform-graphql-prod
```

### Health Checks

PM2 doesn't have built-in health checks. Use external monitoring:

```bash
# Check health endpoint
curl http://localhost:4000/health

# Check GraphQL
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

## Troubleshooting

### Process Won't Start

```bash
# Check PM2 logs
pm2 logs ml-platform-graphql-{env} --err

# Check if server.js exists
ls -la server.js

# Check if port is available
lsof -i :4000
```

### Memory Issues

If process keeps restarting due to memory:

1. Increase `max_memory_restart` in PM2 config
2. Check for memory leaks
3. Reduce number of instances

### High CPU Usage

```bash
# Check CPU usage
pm2 list

# Scale down instances
pm2 scale ml-platform-graphql-prod 2
```

## Best Practices

1. **Development**: Use single instance with watch mode for auto-reload
2. **Staging/UAT**: Use 2 instances to test cluster mode
3. **Production**: Use max instances, disable playground/introspection
4. **Logs**: Rotate logs regularly (use logrotate)
5. **Monitoring**: Set up alerts for restarts and memory usage
6. **Graceful Restart**: Use `pm2 reload` instead of `pm2 restart` in production

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [PM2 Process File](https://pm2.keymetrics.io/docs/usage/application-declaration/)

