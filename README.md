# Inventory & Order Management System

Production-ready full-stack Inventory and Order Management System built with FastAPI, PostgreSQL, React, and Docker.

## Project Overview

This project helps teams manage:
- Products
- Customers
- Orders
- Inventory levels

It supports full CRUD operations, transaction-safe order creation, responsive admin UI, API docs, Dockerized local development, and cloud deployment.

## Tech Stack

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy ORM
- Alembic Migrations
- PostgreSQL
- Pydantic V2
- Pytest

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Axios
- React Router
- React Query
- Vitest + Testing Library

### Infrastructure
- Docker + Docker Compose
- Render (backend)
- Neon PostgreSQL (database)
- Vercel (frontend)

## Architecture Diagram

```mermaid
flowchart LR
  U[Browser] --> FE[React Frontend]
  FE -->|REST API| BE[FastAPI Backend]
  BE -->|SQLAlchemy| DB[(PostgreSQL)]
  BE --> DOCS[/Swagger OpenAPI/]
```

## Repository Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Core Features

- Product CRUD with unique SKU enforcement
- Customer CRUD with unique email enforcement
- Order creation with transaction + rollback
- Stock validation and automatic stock deduction
- Inventory listing with low-stock visibility
- Pagination, search, sorting on list APIs
- Exception handling with consistent error response messages
- Swagger docs at `/docs`

## Database Design

### Tables
- `products`
- `customers`
- `orders`
- `order_items`

### Business Rules Implemented
- Product SKU must be unique
- Customer email must be unique
- Order cannot be created when stock is insufficient
- Stock never goes negative
- Full rollback if any order item fails validation

## API Documentation

When backend is running:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`
- Health: `http://localhost:8001/health`

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
SECRET_KEY=change-me
ENVIRONMENT=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8001
```

## Local Setup (Without Docker)

## 1) Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

## 2) Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

## Docker Setup

Run the complete project:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8001`
- PostgreSQL: `localhost:5432`

## Testing

### Backend tests
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest -v
```

### Frontend tests
```bash
cd frontend
npm test
```

## Deployment Guide

## 1) Neon PostgreSQL
1. Create a Neon project.
2. Copy the connection string.
3. Use it as `DATABASE_URL` in Render backend service.
4. Ensure SSL mode is enabled (`?sslmode=require` if needed).

## 2) Render (Backend)
1. Create new Web Service from this repo.
2. Set root directory to `backend`.
3. Deploy via Dockerfile.
4. Set env vars:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `ENVIRONMENT=production`
5. Confirm:
   - `/health` works
   - `/docs` works

## 3) Vercel (Frontend)
1. Import this repo in Vercel.
2. Set root directory to `frontend`.
3. Set env var:
   - `VITE_API_BASE_URL=https://<render-service>.onrender.com`
4. Deploy and verify app can create/list records.

## Docker Hub (Backend Image)

### Build and push

```bash
# 1) Login to Docker Hub (one time)
docker login

# 2) Build + push using helper script
DOCKERHUB_USERNAME=nirajk102 ./scripts/push-dockerhub.sh
```

### Submission link format

After push succeeds, use:

`https://hub.docker.com/r/nirajk102/warehouse-backend`

> Replace `nirajk102` with your actual Docker Hub username if different.

## Submission Checklist

- GitHub repo link (frontend + backend in same repo)
- Backend Docker Hub image link
- Frontend hosted URL (Vercel)
- Backend API hosted URL (Render)

## License

For assessment/demo use.

