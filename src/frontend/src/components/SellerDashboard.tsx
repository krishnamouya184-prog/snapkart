import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit3,
  Loader2,
  Package,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order, Product } from "../backend.d";
import type { backendInterface as FullBackendInterface } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const CATEGORIES = [
  "Mobiles",
  "Laptops",
  "Wearables",
  "Home & Kitchen",
  "Fashion",
  "Beauty",
  "Books",
];

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

function getStatusColor(
  status: Product["id"] extends bigint ? Order["status"] : Order["status"],
) {
  if ("pending" in status) return "bg-yellow-100 text-yellow-700";
  if ("confirmed" in status) return "bg-blue-100 text-blue-700";
  if ("shipped" in status) return "bg-purple-100 text-purple-700";
  if ("delivered" in status) return "bg-green-100 text-green-700";
  if ("cancelled" in status) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

function getStatusLabel(status: Order["status"]) {
  if ("pending" in status) return "Pending";
  if ("confirmed" in status) return "Confirmed";
  if ("shipped" in status) return "Shipped";
  if ("delivered" in status) return "Delivered";
  if ("cancelled" in status) return "Cancelled";
  return "Unknown";
}

interface ProductFormData {
  name: string;
  category: string;
  priceInr: string;
  description: string;
  imageUrl: string;
  discountPercent: string;
  stock: string;
}

const emptyForm: ProductFormData = {
  name: "",
  category: "Mobiles",
  priceInr: "",
  description: "",
  imageUrl: "",
  discountPercent: "0",
  stock: "1",
};

export function SellerDashboard({ onBack }: { onBack: () => void }) {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackendInterface | null;
  const { identity } = useInternetIdentity();
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState<ProductFormData>(emptyForm);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProductFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!actor || !identity) return;
    Promise.all([actor.isSeller()])
      .then(([sellerStatus]) => {
        setIsSeller(sellerStatus);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor, identity]);

  useEffect(() => {
    if (!actor || !isSeller) return;
    Promise.all([actor.getMyProducts(), actor.getOrdersForSeller()])
      .then(([prods, ords]) => {
        setProducts(prods);
        setOrders(ords);
      })
      .catch((e) => console.error(e));
  }, [actor, isSeller]);

  async function handleRegisterAsSeller() {
    if (!actor) return;
    setIsRegistering(true);
    try {
      await actor.registerAsSeller();
      setIsSeller(true);
      toast.success("You are now a registered seller!");
    } catch (e) {
      console.error(e);
      toast.error("Registration failed. Please try again.");
    }
    setIsRegistering(false);
  }

  async function handleAddProduct() {
    if (!actor) return;
    if (!addForm.name || !addForm.priceInr) {
      toast.error("Name and price are required");
      return;
    }
    setIsSaving(true);
    try {
      const pricePaise = BigInt(
        Math.round(Number.parseFloat(addForm.priceInr) * 100),
      );
      await actor.addProduct(
        addForm.name,
        addForm.category,
        pricePaise,
        addForm.description,
        addForm.imageUrl,
        BigInt(Number.parseInt(addForm.discountPercent) || 0),
        BigInt(Number.parseInt(addForm.stock) || 1),
      );
      toast.success("Product added successfully!");
      setAddForm(emptyForm);
      const prods = await actor.getMyProducts();
      setProducts(prods);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add product.");
    }
    setIsSaving(false);
  }

  async function handleEditSave() {
    if (!actor || !editProduct) return;
    setIsSaving(true);
    try {
      const pricePaise = BigInt(
        Math.round(Number.parseFloat(editForm.priceInr) * 100),
      );
      await actor.updateProduct(
        editProduct.id,
        editForm.name,
        editForm.category,
        pricePaise,
        editForm.description,
        editForm.imageUrl,
        BigInt(Number.parseInt(editForm.discountPercent) || 0),
        BigInt(Number.parseInt(editForm.stock) || 1),
      );
      toast.success("Product updated!");
      setEditProduct(null);
      const prods = await actor.getMyProducts();
      setProducts(prods);
    } catch (e) {
      console.error(e);
      toast.error("Failed to update product.");
    }
    setIsSaving(false);
  }

  async function handleDelete(id: bigint, _idx: number) {
    if (!actor) return;
    if (!confirm("Delete this product?")) return;
    try {
      await actor.deleteProduct(id);
      toast.success("Product deleted.");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete product.");
    }
  }

  async function handleUpdateStatus(orderId: bigint, statusKey: string) {
    if (!actor) return;
    const statusMap: Record<string, Order["status"]> = {
      pending: { pending: null },
      confirmed: { confirmed: null },
      shipped: { shipped: null },
      delivered: { delivered: null },
      cancelled: { cancelled: null },
    };
    const status = statusMap[statusKey];
    if (!status) return;
    try {
      await actor.updateOrderStatus(orderId, status);
      toast.success("Order status updated!");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to update status.");
    }
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      priceInr: (Number(product.price) / 100).toString(),
      description: product.description,
      imageUrl: product.imageUrl,
      discountPercent: product.discountPercent.toString(),
      stock: product.stock.toString(),
    });
  }

  if (!identity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">
          Please login to access Seller Dashboard
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

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="seller.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          type="button"
          onClick={onBack}
          className="text-primary hover:underline text-sm mb-6 flex items-center gap-1"
        >
          ← Back to Store
        </button>
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <Store className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Become a Seller
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Join thousands of sellers on SnapKart. List your products, manage
            orders, and grow your business.
          </p>
          <ul className="text-sm text-gray-600 mb-8 space-y-2 inline-block text-left">
            <li>✅ Reach millions of customers</li>
            <li>✅ Easy product management</li>
            <li>✅ Secure payments</li>
            <li>✅ Real-time order tracking</li>
          </ul>
          <div>
            <Button
              className="bg-primary hover:bg-blue-700 font-bold h-12 px-8"
              onClick={handleRegisterAsSeller}
              disabled={isRegistering}
              data-ocid="seller.primary_button"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Registering...
                </>
              ) : (
                "Start Selling on SnapKart"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" data-ocid="seller.panel">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-primary hover:underline text-sm"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Seller Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Manage your products and orders
            </p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200">
          ✓ Verified Seller
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl font-bold text-primary">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-green-600">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(orders.reduce((s, o) => s + o.totalAmount, 0n))}
          </p>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="products" data-ocid="seller.tab">
            <Package className="w-4 h-4 mr-1" /> My Products
          </TabsTrigger>
          <TabsTrigger value="add" data-ocid="seller.tab">
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="seller.tab">
            <ShoppingBag className="w-4 h-4 mr-1" /> Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        {/* My Products */}
        <TabsContent value="products">
          {products.length === 0 ? (
            <div
              className="bg-white rounded-xl p-12 text-center border border-gray-100"
              data-ocid="seller.empty_state"
            >
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">
                No products yet. Add your first product!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <Table data-ocid="seller.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, idx) => (
                    <TableRow
                      key={product.id.toString()}
                      data-ocid={`seller.item.${idx + 1}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {product.discountPercent.toString()}%
                      </TableCell>
                      <TableCell>{product.stock.toString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(product)}
                            data-ocid={`seller.edit_button.${idx + 1}`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(product.id, idx)}
                            data-ocid={`seller.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Add Product */}
        <TabsContent value="add">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Add New Product</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="p-name">Product Name *</Label>
                <Input
                  id="p-name"
                  placeholder="e.g. Samsung Galaxy S25"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="seller.input"
                />
              </div>
              <div>
                <Label htmlFor="p-cat">Category *</Label>
                <Select
                  value={addForm.category}
                  onValueChange={(v) =>
                    setAddForm((p) => ({ ...p, category: v }))
                  }
                >
                  <SelectTrigger className="mt-1" data-ocid="seller.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="p-price">Price (INR) *</Label>
                <Input
                  id="p-price"
                  type="number"
                  placeholder="e.g. 29999"
                  value={addForm.priceInr}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, priceInr: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="seller.input"
                />
              </div>
              <div>
                <Label htmlFor="p-disc">Discount %</Label>
                <Input
                  id="p-disc"
                  type="number"
                  placeholder="e.g. 10"
                  min="0"
                  max="90"
                  value={addForm.discountPercent}
                  onChange={(e) =>
                    setAddForm((p) => ({
                      ...p,
                      discountPercent: e.target.value,
                    }))
                  }
                  className="mt-1"
                  data-ocid="seller.input"
                />
              </div>
              <div>
                <Label htmlFor="p-stock">Stock Quantity</Label>
                <Input
                  id="p-stock"
                  type="number"
                  placeholder="e.g. 50"
                  min="1"
                  value={addForm.stock}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, stock: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="seller.input"
                />
              </div>
              <div>
                <Label htmlFor="p-img">Image URL</Label>
                <Input
                  id="p-img"
                  placeholder="https://images.unsplash.com/..."
                  value={addForm.imageUrl}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  className="mt-1"
                  data-ocid="seller.input"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea
                  id="p-desc"
                  placeholder="Brief product description..."
                  value={addForm.description}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="mt-1"
                  rows={3}
                  data-ocid="seller.textarea"
                />
              </div>
            </div>
            <Button
              className="mt-4 bg-primary hover:bg-blue-700 font-bold"
              onClick={handleAddProduct}
              disabled={isSaving}
              data-ocid="seller.submit_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div
              className="bg-white rounded-xl p-12 text-center border border-gray-100"
              data-ocid="seller.empty_state"
            >
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <Table data-ocid="seller.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Shipping Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, idx) => (
                    <TableRow
                      key={order.id.toString()}
                      data-ocid={`seller.item.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        #{order.id.toString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          {order.items.map((item) => (
                            <p
                              key={item.productName}
                              className="text-xs text-gray-600"
                            >
                              {item.productName} × {item.quantity.toString()}
                            </p>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.totalAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-[150px]">
                        {order.shippingAddress}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={Object.keys(order.status)[0]}
                          onValueChange={(v) => handleUpdateStatus(order.id, v)}
                        >
                          <SelectTrigger
                            className={`h-7 text-xs w-32 ${getStatusColor(order.status)}`}
                            data-ocid={`seller.select.${idx + 1}`}
                          >
                            <SelectValue>
                              {getStatusLabel(order.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editProduct}
        onOpenChange={(open) => {
          if (!open) setEditProduct(null);
        }}
      >
        <DialogContent className="max-w-lg" data-ocid="seller.dialog">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Product Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-1"
                data-ocid="seller.input"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={editForm.category}
                onValueChange={(v) =>
                  setEditForm((p) => ({ ...p, category: v }))
                }
              >
                <SelectTrigger className="mt-1" data-ocid="seller.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price (INR)</Label>
              <Input
                type="number"
                value={editForm.priceInr}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, priceInr: e.target.value }))
                }
                className="mt-1"
                data-ocid="seller.input"
              />
            </div>
            <div>
              <Label>Discount %</Label>
              <Input
                type="number"
                value={editForm.discountPercent}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    discountPercent: e.target.value,
                  }))
                }
                className="mt-1"
                data-ocid="seller.input"
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={editForm.stock}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, stock: e.target.value }))
                }
                className="mt-1"
                data-ocid="seller.input"
              />
            </div>
            <div className="col-span-2">
              <Label>Image URL</Label>
              <Input
                value={editForm.imageUrl}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, imageUrl: e.target.value }))
                }
                className="mt-1"
                data-ocid="seller.input"
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
                className="mt-1"
                rows={3}
                data-ocid="seller.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditProduct(null)}
              data-ocid="seller.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-blue-700"
              onClick={handleEditSave}
              disabled={isSaving}
              data-ocid="seller.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
