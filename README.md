# PokéFind

UK Pokemon card and sealed product price finder. Searches live UK retailers, flags scalper pricing against RRP, and surfaces in-stock results first.

**Retailers covered:** Total Cards, Argos, Magic Madhouse, eBay  
**Card data:** [Pokemon TCG API](https://pokemontcg.io/) (free, no key required)

---

## Project structure

```
pokefind/
├── docker-compose.yml   Single compose file — frontend + backend
├── frontend/            Vite + React + TypeScript + Tailwind CSS
└── backend/             Node.js + Express + TypeScript (scraping API)
```

---

## Local development

**Requirements:** Node.js 22+

```bash
# Terminal 1 — backend (listens on :3001)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (proxies /api → localhost:3001)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Deployment

One compose file at the root starts both containers. The backend is **not publicly exposed** — the frontend Nginx container proxies `/api/` to it over an internal Docker network. Only one domain and one NPM proxy host are needed.

```
Browser → pokefind.yourdomain.com (NPM → pokefind-frontend:80)
                                          ↓ /api/* internally
                              pokefind-api:3001 (no public port)
```

### 1. Transfer files to the server

```bash
ssh deploy@YOUR_SERVER_IP
cd /opt/docker
git clone <your-repo-url> pokefind
```

### 2. Build and start both containers

```bash
cd /opt/docker/pokefind
docker compose up -d --build
```

Verify the API is reachable from the frontend container:

```bash
docker exec pokefind-frontend curl -s http://pokefind-api:3001/health
# expected: {"status":"ok"}
```

### 3. Configure DNS

One A record is all that's needed:

```
Type  Name        Value
A     pokefind    YOUR_SERVER_IP
```

### 4. Add proxy host in Nginx Proxy Manager

Enable **Force SSL** and request a Let's Encrypt certificate.

| Field | Value |
|---|---|
| Domain | `pokefind.yourdomain.com` |
| Forward Hostname | `pokefind-frontend` |
| Forward Port | `80` |

### 5. Verify

```bash
curl -I https://pokefind.yourdomain.com
# HTTP/2 200

curl -s https://pokefind.yourdomain.com/health
# {"status":"ok"}  — proxied through Nginx to the backend
```

---

## Updating

```bash
cd /opt/docker/pokefind
git pull
docker compose up -d --build
```

Docker layer caching means `npm ci` only re-runs when `package.json` changes.

---

## Troubleshooting

**502 on the site** — check both containers are running: `docker compose ps`. The frontend must be able to resolve `pokefind-api` — confirm they share the `internal` network.

**API calls returning 502/504** — the backend may have crashed. Check logs: `docker compose logs api`. Restart with `docker compose restart api`.

**No product results** — scrapers rely on retailer HTML structure; it can change. Results are cached for 15 minutes — restart the API container to clear cache immediately.

**Stale prices** — scrape results are cached in memory for 15 minutes. `docker compose restart api` clears the cache.
