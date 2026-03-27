# SnapKart

## Current State
SnapKart is a Flipkart-inspired e-commerce React frontend with:
- 30+ real trending products across 8 categories
- Shopping cart, wishlist, search/filter
- Internet Identity login
- Big Saving Days Sale banner with countdown
- Flash deals, trending brands
- Backend: minimal (only greet + authorization mixin)
- No payments, no seller system, no PWA

## Requested Changes (Diff)

### Add
- **Stripe payment gateway**: Full checkout flow for customers (credit/debit card)
- **Seller dashboard**: Sellers can register, add/edit/delete products, view incoming orders, update order status
- **Role-based authorization**: Customer role vs Seller role (admin can assign seller role)
- **Order management backend**: Store orders with product details, buyer info, status tracking
- **Product management backend**: Sellers can persist their own products in the canister
- **PWA support**: manifest.json, service worker, installable on mobile (home screen), offline fallback page, app icons

### Modify
- App.tsx: Add seller dashboard route, Stripe checkout flow, PWA install prompt
- Backend: Full actor with products, orders, seller management

### Remove
- Nothing removed

## Implementation Plan
1. Select `stripe` and `authorization` components
2. Generate Motoko backend with:
   - Product CRUD (sellers manage their own products)
   - Order creation and tracking
   - Role-based access (seller vs customer)
   - Stripe payment intent creation via HTTP outcalls
3. Build frontend:
   - PWA: vite-plugin-pwa or manual manifest + service worker in index.html
   - Seller dashboard page: product management, order management
   - Checkout page: Stripe payment form (Stripe.js Elements)
   - Customer order history page
   - Role-based navigation (seller sees dashboard link)
