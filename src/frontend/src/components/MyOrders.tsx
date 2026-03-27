import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Phone,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

const STATUS_STEPS = [
  { key: "ordered", label: "Ordered", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStepIndex(status: Order["status"]): number {
  if ("pending" in status) return 0;
  if ("confirmed" in status) return 1;
  if ("shipped" in status) return 3;
  if ("delivered" in status) return 5;
  return 0;
}

function isCancelled(status: Order["status"]) {
  return "cancelled" in status;
}

function OrderStatusTimeline({ status }: { status: Order["status"] }) {
  if (isCancelled(status)) {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-500 text-xs font-bold">✕</span>
        </div>
        <span className="text-sm font-semibold text-red-600">
          Order Cancelled
        </span>
      </div>
    );
  }
  const currentStep = getStepIndex(status);
  return (
    <div className="py-3">
      <div className="flex items-start justify-between relative">
        <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        {STATUS_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div
              key={step.key}
              className="flex flex-col items-center gap-1 z-10 flex-1"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isDone
                    ? "bg-green-500 border-green-500"
                    : isCurrent
                      ? "bg-[#2874f0] border-[#2874f0]"
                      : "bg-white border-gray-300"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isDone || isCurrent ? "text-white" : "text-gray-300"
                  }`}
                />
              </div>
              <span
                className={`text-[9px] font-medium text-center leading-tight max-w-[48px] ${
                  isDone
                    ? "text-green-600"
                    : isCurrent
                      ? "text-[#2874f0] font-bold"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ReturnRequest {
  orderId: string;
  reason: string;
  status: "requested" | "approved" | "rejected";
  createdAt: string;
}

function getReturns(): ReturnRequest[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("snapkart_returns") ?? "[]");
  } catch {
    return [];
  }
}

function saveReturn(ret: ReturnRequest) {
  const existing = getReturns();
  const idx = existing.findIndex((r) => r.orderId === ret.orderId);
  if (idx >= 0) existing[idx] = ret;
  else existing.push(ret);
  localStorage.setItem("snapkart_returns", JSON.stringify(existing));
}

function OrderCard({ order, idx }: { order: Order; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(
    null,
  );

  const orderId = order.id.toString();
  const deliveryContact =
    typeof window !== "undefined"
      ? (localStorage.getItem(`snapkart_delivery_contact_${orderId}`) ?? "")
      : "";
  const estDelivery =
    typeof window !== "undefined"
      ? (localStorage.getItem(`snapkart_est_delivery_${orderId}`) ??
        (() => {
          const d = new Date(
            Number(order.createdAt) / 1_000_000 + 5 * 86400000,
          );
          return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        })())
      : "";

  useEffect(() => {
    const returns = getReturns();
    const found = returns.find((r) => r.orderId === orderId);
    setReturnRequest(found ?? null);
  }, [orderId]);

  function handleRequestReturn() {
    if (!returnReason) {
      toast.error("Please select a reason");
      return;
    }
    const ret: ReturnRequest = {
      orderId,
      reason: returnReason,
      status: "requested",
      createdAt: new Date().toISOString(),
    };
    saveReturn(ret);
    setReturnRequest(ret);
    setShowReturnModal(false);
    toast.success("Return request submitted!");
  }

  const isDelivered = "delivered" in order.status;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      data-ocid={`orders.item.${idx + 1}`}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-bold text-gray-900">Order #{orderId}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(order.createdAt)}
          </p>
          {estDelivery && !isCancelled(order.status) && (
            <p className="text-xs text-green-600 font-medium mt-0.5">
              Delivered by {estDelivery}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {returnRequest && (
            <Badge
              className={`text-xs ${
                returnRequest.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : returnRequest.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
              }`}
            >
              Return{" "}
              {returnRequest.status === "requested"
                ? "Requested"
                : returnRequest.status === "approved"
                  ? "Approved"
                  : "Rejected"}
            </Badge>
          )}
          {(() => {
            const s = order.status;
            if ("pending" in s)
              return (
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  Pending
                </Badge>
              );
            if ("confirmed" in s)
              return (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  Confirmed
                </Badge>
              );
            if ("shipped" in s)
              return (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  Shipped
                </Badge>
              );
            if ("delivered" in s)
              return (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Delivered
                </Badge>
              );
            if ("cancelled" in s)
              return (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  Cancelled
                </Badge>
              );
            return null;
          })()}
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

      {/* Order Status Timeline */}
      <div className="px-5 border-t border-gray-50">
        <OrderStatusTimeline status={order.status} />
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

          {/* Delivery Contact */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Delivery Contact
            </p>
            {deliveryContact ? (
              <a
                href={`tel:${deliveryContact}`}
                className="flex items-center gap-2 text-[#2874f0] font-semibold text-sm hover:underline"
                data-ocid={`orders.button.${idx + 1}`}
              >
                <Phone className="w-4 h-4" />
                Call Delivery Boy: {deliveryContact}
              </a>
            ) : (
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Contact not available yet
              </p>
            )}
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

          {/* Return/Refund */}
          {isDelivered && !returnRequest && (
            <Button
              size="sm"
              variant="outline"
              className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs"
              onClick={() => setShowReturnModal(true)}
              data-ocid={`orders.secondary_button.${idx + 1}`}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Request Return /
              Refund
            </Button>
          )}
        </div>
      )}

      {/* Return Modal */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent data-ocid="orders.dialog">
          <DialogHeader>
            <DialogTitle>Request Return / Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-500">Order #{orderId}</p>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1.5">
                Reason for return
              </p>
              <Select onValueChange={setReturnReason}>
                <SelectTrigger data-ocid="orders.select">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wrong item received">
                    Wrong item received
                  </SelectItem>
                  <SelectItem value="Item damaged">
                    Item damaged / defective
                  </SelectItem>
                  <SelectItem value="Not as described">
                    Not as described
                  </SelectItem>
                  <SelectItem value="Changed my mind">
                    Changed my mind
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReturnModal(false)}
              data-ocid="orders.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#2874f0] hover:bg-blue-700"
              onClick={handleRequestReturn}
              data-ocid="orders.submit_button"
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
