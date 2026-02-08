# Kybr E-commerce Backend

Production-ready Express backend structured for website + admin clients with Supabase as the data layer.

## Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## Structure

- `src/app.js` - express app setup and middleware
- `src/server.js` - server entrypoint
- `src/config` - environment and Supabase client
- `src/routes` - route aggregation
- `src/modules` - feature modules (auth, users, products, orders, cart, admin)
- `src/middlewares` - error handling, not found
- `src/utils` - helpers and shared utilities

## Base routes

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/store/products`
- `GET /api/v1/admin/orders`
