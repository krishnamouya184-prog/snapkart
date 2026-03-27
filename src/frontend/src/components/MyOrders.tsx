import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Order } from "../backend.d";
import type { backendInterface as FullBackendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function formatPrice(paise: bigint) {
  return `₹${(Number(paise) / 100).toLocaleString("en-IN")}`;
}

function formatDate(ns: bigint) {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Order["status"] }) {
  if ("pending" in status)
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
        Pending
      </Badge>
    );
  if ("confirmed" in status)
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
        Confirmed
      </Badge>
    );
  if ("shipped" in status)
    return (
      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
        Shipped
      </Badge>
    );
  if ("delivered" in status)
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        Delivered
      </Badge>
    );
  if ("cancelled" in status)
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200">
        Cancelled
      </Badge>
    );
  return null;
}

function OrderCard({ order, idx }: { order: Order; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      data-ocid={`orders.item.${idx + 1}`}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-bold text-gray-900">
            Order #{order.id.toString()}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <span className="font-bold text-gray-900">
            {formatPrice(order.totalAmount)}
          </span>
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="text-gray-400 hover:text-gray-600"
            data-ocid={`orders.toggle.${idx + 1}`}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Items Ordered
            </p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.productName}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {item.productName}
                    </span>
                    <span className="text-xs text-gray-400">
                      × {item.quantity.toString()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(item.priceAtPurchase * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Shipping Address
            </p>
            <p className="text-sm text-gray-600">{order.shippingAddress}</p>
          </div>
          {order.paymentIntentId && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Payment ID
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {order.paymentIntentId}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MyOrders({ onBack }: { onBack: () => void }) {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackendInterface | null;
  const { identity } = useInternetIdentity();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || !identity) {
      setLoading(false);
      return;
    }
    actor
      .getMyOrders()
      .then((data) => {
        setOrders(data.sort((a, b) => Number(b.createdAt - a.createdAt)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, identity]);

  if (!identity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">
          Please login to view your orders
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-primary hover:underline text-sm"
        >
          ← Back to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" data-ocid="orders.panel">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="text-primary hover:underline text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500">
            Track and manage your purchases
          </p>
        </div>
      </div>

      {loading ? (
        <div
          className="flex items-center justify-center h-48"
          data-ocid="orders.loading_state"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div
          className="bg-white rounded-2xl p-12 text-center border border-gray-100"
          data-ocid="orders.empty_state"
        >
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            No orders yet
          </h3>
          <p className="text-gray-500 mb-4">
            Your purchased items will appear here.
          </p>
          <Button
            className="bg-primary"
            onClick={onBack}
            data-ocid="orders.primary_button"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => (
            <OrderCard key={order.id.toString()} order={order} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
