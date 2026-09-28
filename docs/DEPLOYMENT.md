# Deployment

## Student-friendly

1. Create a managed PostgreSQL database.
2. Deploy `backend/` as a Python container.
3. Configure `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`.
4. Deploy `frontend/` as a static Vite application.
5. Configure `VITE_API_URL` and `VITE_WS_URL`.
6. Use HTTPS and WSS.
7. Remove/disable `/api/dev/seed`.
8. Add rate limiting and centralized logs.

Provider free tiers change. Verify current student/free-tier pricing before choosing a service.

## AWS reference

CloudFront/S3 or Amplify -> API Gateway/ALB -> ECS/Fargate or Lambda -> RDS PostgreSQL. Use WebSocket API/AppSync for realtime, SQS for async notifications, SES/SNS for delivery, CloudWatch for observability.

## Azure reference

Static Web Apps/Blob -> Container Apps/App Service -> Azure PostgreSQL -> Web PubSub -> Service Bus -> Application Insights.

## GCP reference

Firebase Hosting/Cloud Storage -> Cloud Run -> Cloud SQL PostgreSQL -> shared realtime layer -> Pub/Sub -> Cloud Monitoring.

## Production hardening

HTTPS, WSS, secret manager, database backups, connection pooling, rate limits, audit logs, monitoring, shared WebSocket broker, and removal of demo seed endpoint.
