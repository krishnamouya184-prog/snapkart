import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  ChevronRight,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Plus,
  Shield,
  ShoppingBag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  fullAddress: string;
  pincode: string;
}

function getAddresses(principal: string): Address[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem(`snapkart_addresses_${principal}`) ?? "[]",
    );
  } catch {
    return [];
  }
}

function saveAddresses(principal: string, addresses: Address[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `snapkart_addresses_${principal}`,
    JSON.stringify(addresses),
  );
}

const emptyAddress: Omit<Address, "id"> = {
  label: "Home",
  fullName: "",
  phone: "",
  fullAddress: "",
  pincode: "",
};

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onViewOrders: () => void;
}

export function UserProfile({
  onBack,
  onLogout,
  onViewOrders,
}: UserProfileProps) {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal =
    principal.length > 10 ? `${principal.slice(0, 10)}...` : principal;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [form, setForm] = useState<Omit<Address, "id">>(emptyAddress);

  useEffect(() => {
    if (principal) {
      setAddresses(getAddresses(principal));
    }
  }, [principal]);

  function openAdd() {
    setForm(emptyAddress);
    setEditingAddr(null);
    setShowAddForm(true);
  }

  function openEdit(addr: Address) {
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      fullAddress: addr.fullAddress,
      pincode: addr.pincode,
    });
    setEditingAddr(addr);
    setShowAddForm(true);
  }

  function handleSaveAddress() {
    if (!form.fullName || !form.phone || !form.fullAddress || !form.pincode) {
      toast.error("Please fill all fields");
      return;
    }
    let updated: Address[];
    if (editingAddr) {
      updated = addresses.map((a) =>
        a.id === editingAddr.id ? { ...form, id: editingAddr.id } : a,
      );
    } else {
      updated = [...addresses, { ...form, id: `addr_${Date.now()}` }];
    }
    setAddresses(updated);
    saveAddresses(principal, updated);
    setShowAddForm(false);
    toast.success(editingAddr ? "Address updated!" : "Address added!");
  }

  function handleDeleteAddress(id: string) {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    saveAddresses(principal, updated);
    toast.success("Address removed");
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Header */}
      <div className="bg-[#2874f0] text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-blue-700 transition-colors"
          data-ocid="profile.button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold tracking-wide">My Profile</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Avatar Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-[#2874f0] flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800 text-lg">SnapKart User</p>
            <p className="text-sm text-gray-500 mt-1 font-mono bg-gray-50 px-3 py-1 rounded-full">
              {shortPrincipal}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">
            <Shield className="w-3.5 h-3.5" />
            Verified with Internet Identity
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              My Account
            </p>
          </div>

          <button
            type="button"
            onClick={onViewOrders}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-blue-50 transition-colors border-b border-gray-50"
            data-ocid="profile.button"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#2874f0]" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">My Orders</p>
                <p className="text-xs text-gray-500">
                  Track, return or buy again
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-blue-50 transition-colors"
            data-ocid="profile.button"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Notifications</p>
                <p className="text-xs text-gray-500">
                  Order updates &amp; offers
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Address Book */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2874f0]" />
              <p className="text-sm font-semibold text-gray-700">
                Address Book
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 px-3 text-[#2874f0] border-[#2874f0]"
              onClick={openAdd}
              data-ocid="profile.secondary_button"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Address
            </Button>
          </div>

          {addresses.length === 0 && !showAddForm && (
            <div
              className="px-4 py-6 text-center"
              data-ocid="profile.empty_state"
            >
              <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No saved addresses</p>
              <button
                type="button"
                onClick={openAdd}
                className="text-xs text-[#2874f0] mt-1 hover:underline"
              >
                + Add your first address
              </button>
            </div>
          )}

          {addresses.map((addr, addrIdx) => (
            <div
              key={addr.id}
              className="px-4 py-3 border-b border-gray-50 last:border-0"
              data-ocid={`profile.item.${addrIdx + 1}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase bg-blue-100 text-[#2874f0] px-1.5 py-0.5 rounded">
                      {addr.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {addr.fullName}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {addr.fullAddress}
                  </p>
                  <p className="text-xs text-gray-500">
                    {addr.pincode} · {addr.phone}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(addr)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#2874f0] hover:bg-blue-50 rounded"
                    data-ocid={`profile.edit_button.${addrIdx + 1}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    data-ocid={`profile.delete_button.${addrIdx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div
              className="px-4 py-4 bg-gray-50 border-t border-gray-100"
              data-ocid="profile.panel"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">
                  {editingAddr ? "Edit Address" : "New Address"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                  data-ocid="profile.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Select
                    value={form.label}
                    onValueChange={(v) => setForm((p) => ({ ...p, label: v }))}
                  >
                    <SelectTrigger
                      className="h-9 mt-1"
                      data-ocid="profile.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Full Name</Label>
                    <Input
                      className="h-9 mt-1"
                      placeholder="Your name"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      data-ocid="profile.input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input
                      className="h-9 mt-1"
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      data-ocid="profile.input"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Full Address</Label>
                  <Input
                    className="h-9 mt-1"
                    placeholder="House no, Street, Area"
                    value={form.fullAddress}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, fullAddress: e.target.value }))
                    }
                    data-ocid="profile.input"
                  />
                </div>
                <div>
                  <Label className="text-xs">Pincode</Label>
                  <Input
                    className="h-9 mt-1"
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, pincode: e.target.value }))
                    }
                    data-ocid="profile.input"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[#2874f0] hover:bg-blue-700 font-bold"
                  onClick={handleSaveAddress}
                  data-ocid="profile.save_button"
                >
                  Save Address
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 transition-colors text-red-600"
            data-ocid="profile.delete_button"
          >
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Logout</p>
              <p className="text-xs text-red-400">Sign out of your account</p>
            </div>
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 pb-2">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-[#2874f0] hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
