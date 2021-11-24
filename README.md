# TTS With Cache

The purpose of this project is to proxy a TTS request to a vendor application, taking the response and storing into a redis cache.  This will help with innevidable costs.

## Sample Run Command for Local

```
REPLICA_STUDIO_CLIENT_ID=VALUE REPLICA_STUDIO_CLIENT_SECRET=VALUE REPLICA_STUDIO_SPEAKER_ID=VALUE REDIS_URL=VALUE REDIS_PORT=VALUE npm run dev
```
