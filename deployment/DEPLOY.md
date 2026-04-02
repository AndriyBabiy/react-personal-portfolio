# Portfolio Deployment Guide

## Architecture

- **App**: React SPA served by nginx inside a Docker container
- **VPS**: Hetzner Cloud cpx42 at 78.47.89.101 (shared with Cuigg + Study.ie)
- **Reverse Proxy**: nginx (NOT Caddy — Caddy is inactive on this VPS)
- **SSL**: Cloudflare Origin Certificate (proxied mode, Full Strict)
- **Domain**: andriybabiy.com (Cloudflare DNS)
- **CI/CD**: GitHub Actions → GHCR → SSH to VPS → docker pull → restart

## CI/CD (Automatic)

Push to `main` auto-deploys. Workflow: `.github/workflows/deploy.yml`

```bash
# Monitor runs
gh run list --limit 3 -R AndriyBabiy/react-personal-portfolio

# Re-run failed
gh run rerun <run-id> -R AndriyBabiy/react-personal-portfolio
```

### GitHub Secrets Required

| Secret | Value |
|--------|-------|
| `VPS_SSH_KEY` | `~/.ssh/studyie_vps` private key |
| `VPS_HOST` | `78.47.89.101` |
| `VPS_USER` | `deploy` |

### CI/CD Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `repository name must be lowercase` | `github.repository` returns mixed case | Hardcode lowercase image name |
| `sudo: a password is required` | sudoers only allows specific paths | Use `~/portfolio` (no sudo) for compose files |
| `Failed to connect to port 8090` | Port bound to 127.0.0.1 only | Smoke test via SSH + curl localhost |

## Deploy (Manual fallback)

```bash
# 1. Build for amd64 (required — VPS is amd64, Mac is arm64)
docker build --platform linux/amd64 -t ghcr.io/andriybabiy/react-personal-portfolio:latest .

# 2. Export and SCP
docker save ghcr.io/andriybabiy/react-personal-portfolio:latest | gzip > /tmp/portfolio-image.tar.gz
scp -i ~/.ssh/studyie_vps /tmp/portfolio-image.tar.gz deploy@78.47.89.101:/tmp/

# 3. Load and restart on VPS
ssh -i ~/.ssh/studyie_vps deploy@78.47.89.101 '
  gunzip -c /tmp/portfolio-image.tar.gz | sudo docker load &&
  cd ~/portfolio &&
  sudo docker compose down &&
  sudo docker compose up -d
'
```

## Health Check

```bash
curl -I https://andriybabiy.com/
curl -I https://andriybabiy.com/desktop
```

## VPS File Locations

| Path | Purpose |
|------|---------|
| `~/portfolio/docker-compose.yml` | Container config (port 8090) |
| `/etc/nginx/conf.d/andriybabiy.conf` | nginx server block |
| `/etc/nginx/andriybabiy-origin.pem` | Cloudflare origin SSL cert |
| `/etc/nginx/andriybabiy-origin.key` | Origin SSL private key |

## Coexisting Services

| Service | Port | Domain |
|---------|------|--------|
| Study.ie frontend | :8080 | study.ie |
| Study.ie backend | :8000 | study.ie/api |
| Cuigg | :3001 | cuigg.study.ie |
| Grafana | :3000 | grafana.study.ie |
| **Portfolio** | **:8090** | **andriybabiy.com** |
