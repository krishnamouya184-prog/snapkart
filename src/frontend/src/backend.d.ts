import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export type OrderStatus = 
  | { pending: null }
  | { confirmed: null }
  | { shipped: null }
  | { delivered: null }
  | { cancelled: null };

export interface OrderItem {
  productId: bigint;
  productName: string;
  quantity: bigint;
  priceAtPurchase: bigint;
}

export interface Product {
  id: bigint;
  name: string;
  category: string;
  price: bigint;
  description: string;
  imageUrl: string;
  discountPercent: bigint;
  stock: bigint;
  sellerId: Principal;
  rating: bigint;
}

export interface Order {
  id: bigint;
  buyerId: Principal;
  items: OrderItem[];
  totalAmount: bigint;
  status: OrderStatus;
  createdAt: bigint;
  paymentIntentId: string;
  shippingAddress: string;
}

export interface backendInterface {
    greet(name: string): Promise<string>;
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    getCallerUserRole(): Promise<{ admin: null } | { user: null } | { guest: null }>;
    assignCallerUserRole(user: Principal, role: { admin: null } | { user: null } | { guest: null }): Promise<void>;
    isCallerAdmin(): Promise<boolean>;

    // Seller
    registerAsSeller(): Promise<void>;
    isSeller(): Promise<boolean>;
    isSellerPrincipal(p: Principal): Promise<boolean>;

    // Products
    addProduct(name: string, category: string, price: bigint, description: string, imageUrl: string, discountPercent: bigint, stock: bigint): Promise<bigint>;
    updateProduct(id: bigint, name: string, category: string, price: bigint, description: string, imageUrl: string, discountPercent: bigint, stock: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAllProducts(): Promise<Product[]>;
    getProductsByCategory(category: string): Promise<Product[]>;
    getMyProducts(): Promise<Product[]>;
    getProduct(id: bigint): Promise<Option<Product>>;

    // Orders
    placeOrder(items: OrderItem[], totalAmount: bigint, paymentIntentId: string, shippingAddress: string): Promise<bigint>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    getMyOrders(): Promise<Order[]>;
    getOrdersForSeller(): Promise<Order[]>;
    getAllOrders(): Promise<Order[]>;

    // Stripe
    createStripePaymentIntent(amount: bigint, currency: string): Promise<string>;
    getStripePublishableKey(): Promise<string>;
}
