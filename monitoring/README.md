# Monitoring Setup for DevOps Academy

This directory contains monitoring configurations using Prometheus and Grafana.

## 📊 Overview

- **Prometheus**: Metrics collection and alerting
- **Grafana**: Visualization and dashboards
- **Alert Manager**: Alert routing and notifications

## 🚀 Quick Setup

### Option 1: Helm (Recommended)

```bash
# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.retention=30d \
  --set grafana.adminPassword=admin123

# Check installation
kubectl get pods -n monitoring
```

### Option 2: Manual Deployment

```bash
# Deploy monitoring stack
kubectl apply -f monitoring-stack.yaml

# Check status
kubectl get all -n monitoring

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=300s
kubectl wait --for=condition=ready pod -l app=grafana -n monitoring --timeout=300s
```

## 🔐 Access Dashboards

### Prometheus

```bash
# Port forward
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Access: http://localhost:9090
```

### Grafana

```bash
# Port forward
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Access: http://localhost:3000
# Username: admin
# Password: admin123
```

## 📈 Pre-configured Dashboards

### 1. Kubernetes Cluster Monitoring
- Node CPU/Memory usage
- Pod resource consumption
- Network traffic
- Disk I/O

### 2. Application Metrics
- HTTP request rate
- Response time (p50, p95, p99)
- Error rate
- Active connections

### 3. Database Monitoring
- Connection pool usage
- Query performance
- Slow queries
- Replication lag

## 🚨 Alert Rules

Configured alerts in `alerts.yml`:

| Alert | Threshold | Severity |
|-------|-----------|----------|
| High CPU Usage | >80% for 5min | Warning |
| High Memory Usage | >85% for 5min | Warning |
| Pod CrashLooping | Restart rate >0 | Critical |
| Backend API Down | >2min downtime | Critical |
| High Error Rate | >5% 5xx errors | Warning |
| Low Disk Space | <15% free | Warning |

## 📝 Adding Custom Metrics

### Backend (Node.js)

```javascript
// Install prom-client
npm install prom-client

// Add to your Express app
const promClient = require('prom-client');
const register = promClient.register;

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### Enable Prometheus Scraping

Add annotations to your pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/path: "/metrics"
    prometheus.io/port: "5001"
```

## 🎨 Grafana Dashboard Examples

### Import Pre-built Dashboards

1. **Kubernetes Cluster Monitoring**
   - Dashboard ID: 7249
   - URL: https://grafana.com/grafana/dashboards/7249

2. **Node Exporter Full**
   - Dashboard ID: 1860
   - URL: https://grafana.com/grafana/dashboards/1860

3. **Prometheus 2.0 Stats**
   - Dashboard ID: 3662
   - URL: https://grafana.com/grafana/dashboards/3662

### Import Steps

1. Open Grafana UI
2. Click "+" → "Import"
3. Enter Dashboard ID
4. Select Prometheus datasource
5. Click "Import"

## 🔔 Alert Notification Channels

### Slack

```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#devops-alerts'
        title: 'DevOps Academy Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

### Email

```yaml
receivers:
  - name: 'email'
    email_configs:
      - to: 'devops-team@devopsacademy.com'
        from: 'alerts@devopsacademy.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'
```

## 📊 Useful Queries

### CPU Usage by Pod
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="devops-academy"}[5m])) by (pod)
```

### Memory Usage by Pod
```promql
sum(container_memory_working_set_bytes{namespace="devops-academy"}) by (pod) / 1024 / 1024
```

### HTTP Request Rate
```promql
rate(http_requests_total{namespace="devops-academy"}[5m])
```

### Error Rate
```promql
rate(http_requests_total{status=~"5..",namespace="devops-academy"}[5m]) / 
rate(http_requests_total{namespace="devops-academy"}[5m])
```

## 🔧 Configuration

### Retention Period

Edit `prometheus.yml`:
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

# Retention in Prometheus deployment
--storage.tsdb.retention.time=30d
```

### Scrape Targets

Add new targets in `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'my-service'
    static_configs:
      - targets: ['my-service:9090']
```

## 🧹 Cleanup

```bash
# Using Helm
helm uninstall prometheus -n monitoring

# Manual
kubectl delete -f monitoring-stack.yaml
kubectl delete namespace monitoring
```

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Guide](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

## 🐛 Troubleshooting

### Prometheus Not Scraping

```bash
# Check targets
kubectl exec -it -n monitoring prometheus-xxx -- sh
wget -O- http://localhost:9090/api/v1/targets

# Check service discovery
wget -O- http://localhost:9090/api/v1/sd
```

### Grafana Can't Connect to Prometheus

```bash
# Test connection from Grafana pod
kubectl exec -it -n monitoring grafana-xxx -- sh
wget -O- http://prometheus:9090/api/v1/query?query=up
```

### High Memory Usage

```bash
# Reduce retention period
# Edit deployment and set:
--storage.tsdb.retention.time=7d

# Or reduce scrape interval
scrape_interval: 30s
```

---

**Happy Monitoring! 📊**
