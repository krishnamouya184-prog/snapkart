import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CreditCard, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface as FullBackendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";

// Stripe global type
declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance;
  }
}

interface StripeInstance {
  elements: () => StripeElements;
  confirmCardPayment: (
    clientSecret: string,
    data: { payment_method: { card: StripeCardElement } },
  ) => Promise<{
    error?: { message: string };
    paymentIntent?: { id: string; status: string };
  }>;
}

interface StripeElements {
  create: (
    type: string,
    options?: Record<string, unknown>,
  ) => StripeCardElement;
}

interface StripeCardElement {
  mount: (el: HTMLElement) => void;
  unmount: () => void;
  on: (
    event: string,
    handler: (e: { complete: boolean; error?: { message: string } }) => void,
  ) => void;
}

interface CartItem {
  product: {
    id: number;
    name: string;
    salePrice: number;
    image: string;
    brand: string;
  };
  quantity: number;
}

interface CheckoutModalProps {
  cart: CartItem[];
  cartTotal: number;
  onClose: () => void;
  onSuccess: () => void;
}

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function CheckoutModal({
  cart,
  cartTotal,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackendInterface | null;
  const cardRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<StripeInstance | null>(null);
  const cardElementRef = useRef<StripeCardElement | null>(null);

  const [stripeReady, setStripeReady] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [cardError, setCardError] = useState("");
  const [cardComplete, setCardComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"address" | "payment">("address");

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    pincode: "",
  });

  // Load Stripe and mount card element
  useEffect(() => {
    if (!actor) return;

    actor
      .getStripePublishableKey()
      .then((key) => {
        if (!key || key.trim() === "") {
          setStripeError("Payment not configured. Please try again later.");
          return;
        }
        const waitForStripe = (attempts = 0) => {
          if (window.Stripe) {
            const stripe = window.Stripe(key);
            stripeRef.current = stripe;
            setStripeReady(true);
          } else if (attempts < 20) {
            setTimeout(() => waitForStripe(attempts + 1), 200);
          } else {
            setStripeError("Failed to load payment system. Please refresh.");
          }
        };
        waitForStripe();
      })
      .catch(() => {
        setStripeError("Failed to initialize payment.");
      });
  }, [actor]);

  // Mount card element when on payment step and stripe is ready
  useEffect(() => {
    if (
      step !== "payment" ||
      !stripeReady ||
      !cardRef.current ||
      !stripeRef.current
    )
      return;
    const elements = stripeRef.current.elements();
    const card = elements.create("card", {
      style: {
        base: {
          fontSize: "15px",
          color: "#1a1a2e",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          "::placeholder": { color: "#9ca3af" },
        },
        invalid: { color: "#ef4444" },
      },
    });
    card.mount(cardRef.current);
    card.on("change", (e) => {
      setCardComplete(e.complete);
      setCardError(e.error?.message ?? "");
    });
    cardElementRef.current = card;
    return () => {
      card.unmount();
      cardElementRef.current = null;
    };
  }, [step, stripeReady]);

  function validateAddress() {
    if (!address.name.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!address.phone.trim() || address.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (!address.addressLine.trim()) {
      toast.error("Please enter your address");
      return false;
    }
    if (!address.city.trim()) {
      toast.error("Please enter your city");
      return false;
    }
    if (!address.pincode.trim() || address.pincode.length < 6) {
      toast.error("Please enter a valid pincode");
      return false;
    }
    return true;
  }

  async function handlePayNow() {
    if (!actor || !stripeRef.current || !cardElementRef.current) return;
    if (!cardComplete) {
      toast.error("Please complete card details");
      return;
    }
    setIsProcessing(true);
    try {
      const amountPaise = BigInt(Math.round(cartTotal * 100));
      const clientSecret = await actor.createStripePaymentIntent(
        amountPaise,
        "inr",
      );
      const result = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElementRef.current },
      });
      if (result.error) {
        toast.error(result.error.message ?? "Payment failed");
        setIsProcessing(false);
        return;
      }
      const paymentIntentId = result.paymentIntent?.id ?? "";
      const shippingAddress = `${address.name}, ${address.addressLine}, ${address.city} - ${address.pincode}, Phone: ${address.phone}`;
      const items = cart.map((item) => ({
        productId: BigInt(item.product.id),
        productName: item.product.name,
        quantity: BigInt(item.quantity),
        priceAtPurchase: BigInt(Math.round(item.product.salePrice * 100)),
      }));
      await actor.placeOrder(
        items,
        amountPaise,
        paymentIntentId,
        shippingAddress,
      );
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  }

  const shippingFee = cartTotal >= 500 ? 0 : 40;
  const totalWithShipping = cartTotal + shippingFee;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-ocid="checkout.modal"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Close checkout"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Secure Checkout</h2>
            <p className="text-xs text-gray-500">
              {cart.length} item(s) · {formatPrice(totalWithShipping)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            data-ocid="checkout.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div
            className="flex flex-col items-center justify-center p-12 gap-4"
            data-ocid="checkout.success_state"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Order Placed!</h3>
            <p className="text-gray-500 text-center">
              Your payment was successful. We'll deliver your order soon!
            </p>
            <p className="text-sm text-primary font-medium">
              Estimated delivery: 3-5 business days
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x">
            {/* Left: Form */}
            <div className="md:col-span-3 p-6">
              {/* Step tabs */}
              <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                    step === "address"
                      ? "bg-white shadow text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setStep("address")}
                  data-ocid="checkout.tab"
                >
                  1. Delivery Address
                </button>
                <button
                  type="button"
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                    step === "payment"
                      ? "bg-white shadow text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    if (validateAddress()) setStep("payment");
                  }}
                  data-ocid="checkout.tab"
                >
                  2. Payment
                </button>
              </div>

              {step === "address" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="co-name">Full Name *</Label>
                    <Input
                      id="co-name"
                      placeholder="Raj Kumar"
                      value={address.name}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, name: e.target.value }))
                      }
                      className="mt-1"
                      data-ocid="checkout.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="co-phone">Phone Number *</Label>
                    <Input
                      id="co-phone"
                      type="tel"
                      placeholder="9876543210"
                      value={address.phone}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="mt-1"
                      data-ocid="checkout.input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="co-addr">Address *</Label>
                    <Input
                      id="co-addr"
                      placeholder="House No, Street, Area"
                      value={address.addressLine}
                      onChange={(e) =>
                        setAddress((p) => ({
                          ...p,
                          addressLine: e.target.value,
                        }))
                      }
                      className="mt-1"
                      data-ocid="checkout.input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="co-city">City *</Label>
                      <Input
                        id="co-city"
                        placeholder="Mumbai"
                        value={address.city}
                        onChange={(e) =>
                          setAddress((p) => ({ ...p, city: e.target.value }))
                        }
                        className="mt-1"
                        data-ocid="checkout.input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="co-pin">Pincode *</Label>
                      <Input
                        id="co-pin"
                        placeholder="400001"
                        value={address.pincode}
                        onChange={(e) =>
                          setAddress((p) => ({ ...p, pincode: e.target.value }))
                        }
                        className="mt-1"
                        data-ocid="checkout.input"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-blue-700 mt-2"
                    onClick={() => {
                      if (validateAddress()) setStep("payment");
                    }}
                    data-ocid="checkout.primary_button"
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}

              {step === "payment" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <p className="font-medium text-gray-700">Delivering to:</p>
                    <p className="text-gray-600 mt-0.5">
                      {address.name} · {address.phone}
                    </p>
                    <p className="text-gray-600">
                      {address.addressLine}, {address.city} - {address.pincode}
                    </p>
                    <button
                      type="button"
                      className="text-primary text-xs font-medium mt-1 hover:underline"
                      onClick={() => setStep("address")}
                    >
                      Change
                    </button>
                  </div>

                  {stripeError ? (
                    <div
                      className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm"
                      data-ocid="checkout.error_state"
                    >
                      {stripeError}
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          Card Details
                        </Label>
                        <div
                          ref={cardRef}
                          className="border border-gray-300 rounded-md p-3 min-h-[44px] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all"
                          data-ocid="checkout.input"
                        />
                        {cardError && (
                          <p className="text-red-500 text-xs mt-1">
                            {cardError}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>🔒</span>
                        <span>Your payment info is encrypted and secure</span>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-blue-700 font-bold h-12"
                        onClick={handlePayNow}
                        disabled={isProcessing || !cardComplete}
                        data-ocid="checkout.submit_button"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                            Processing...
                          </>
                        ) : (
                          <>Pay {formatPrice(totalWithShipping)}</>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="md:col-span-2 p-6 bg-gray-50 rounded-br-2xl md:rounded-tr-2xl">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-2 items-center"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">
                      {formatPrice(item.product.salePrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span
                    className={
                      shippingFee === 0 ? "text-green-600 font-medium" : ""
                    }
                  >
                    {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(totalWithShipping)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Inclusive of all taxes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
