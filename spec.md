# SnapKart

## Current State
- Full e-commerce platform with Stripe payments, seller dashboard, customer orders, PWA
- Order statuses: pending/confirmed/shipped/delivered/cancelled
- Orders have: id, buyerId, items, totalAmount, status, createdAt, paymentIntentId, shippingAddress
- Products: id, name, category, price, description, imageUrl, discountPercent, stock, sellerId, rating
- No delivery contact info, no estimated delivery, no address book, no return/refund, no Q&A, no recently viewed, no recommendations

## Requested Changes (Diff)

### Add
- **DeliveryContact**: phone number field on orders (seller can set delivery boy phone number)
- **Estimated Delivery Date**: `estimatedDelivery` field on orders (text string like "3-5 business days")
- **Address Book**: customers can save multiple delivery addresses (CRUD)
- **Return/Refund Request**: customers can raise return request on delivered orders, seller can view/update
- **Product Q&A**: customers can ask questions on products, sellers/anyone can answer
- **Recently Viewed**: track last 10 viewed products per user (frontend only, localStorage)
- **Recommended Products**: show related products from same category (frontend only)
- **Order Packed status**: add `packed` to OrderStatus enum between confirmed and shipped

### Modify
- Order type: add `deliveryContact` (string), `estimatedDelivery` (string) optional fields
- Seller dashboard: can set delivery contact and estimated delivery on orders

### Remove
- Nothing

## Implementation Plan
1. Backend: Add packed status, extend Order with deliveryContact + estimatedDelivery, add Address CRUD, add ReturnRequest, add ProductQuestion/Answer
2. Frontend: 
   - Order details modal showing status timeline, delivery contact (tap to call), estimated delivery
   - Address book page in profile
   - Return request button on delivered orders
   - Q&A section on product modal
   - Recently viewed row (localStorage)
   - Recommended products section on product modal
   - Seller order management: set delivery contact + estimated delivery
