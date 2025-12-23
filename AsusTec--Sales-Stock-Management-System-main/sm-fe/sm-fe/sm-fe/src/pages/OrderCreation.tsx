import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  User,
  Hash,
  DollarSign,
  AlertCircle,
  Loader,
  RefreshCw,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { API, apiFetch } from "../lib/api";

/* ===================== TYPES ===================== */

type ProductFromListState = {
  id?: number | string;
  code?: number | string;
  codepdt?: number | string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
};

type RawProduct = {
  codepdt: number;
  nompdt: string;
  descpdt?: string;
  prixpdt: number;
  qteStock?: number;
  qtepdt?: number;
};

type Product = {
  codepdt: number;
  nompdt: string;
  descpdt: string;
  prixpdt: number;
  qteStock: number;
};

/* ===================== COMPONENT ===================== */

export default function OrderCreation() {
  const location = useLocation();
  const navigate = useNavigate();

  const productState = (location.state as any)?.product as
    | ProductFromListState
    | undefined;

  /* ===================== PRODUCTS (manual mode) ===================== */

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const normalizeProducts = (data: RawProduct[]): Product[] =>
    (data || []).map((p) => ({
      codepdt: Number(p.codepdt),
      nompdt: p.nompdt ?? "",
      descpdt: p.descpdt ?? "",
      prixpdt: Number(p.prixpdt ?? 0),
      qteStock: Number(p.qteStock ?? p.qtepdt ?? 0),
    }));

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await apiFetch<RawProduct[]>(`${API.vente}/api/ventes/produits`);
      setProducts(normalizeProducts(data || []));
    } catch (e: any) {
      const status = e?.status;

      if (status === 401) {
        toast.error("Unauthorized (401). Please login again.");
      } else {
        toast.error("Unable to load products from Sale Service");
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (!productState) fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===================== PRODUCT SELECTION ===================== */

  const stateProductId = useMemo(() => {
    const raw = productState?.id ?? productState?.code ?? productState?.codepdt;
    const n = Number.parseInt(String(raw ?? ""), 10);
    return Number.isFinite(n) ? n : 0;
  }, [productState]);

  const [selectedProductId, setSelectedProductId] = useState(
    stateProductId ? String(stateProductId) : "",
  );

  useEffect(() => {
    if (stateProductId) setSelectedProductId(String(stateProductId));
  }, [stateProductId]);

  const selectedFromList = useMemo(() => {
    const id = Number(selectedProductId);
    return products.find((p) => p.codepdt === id) || null;
  }, [products, selectedProductId]);

  const productId = stateProductId || Number(selectedProductId) || 0;
  const productName = productState?.name ?? selectedFromList?.nompdt ?? "";
  const price = productState?.price ?? selectedFromList?.prixpdt ?? 0;
  const availableStock =
    productState?.stock ?? selectedFromList?.qteStock ?? 0;

  /* ===================== FORM ===================== */

  const [clientName, setClientName] = useState("Hamza");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const qtyInt = Number(quantity) || 0;
  const totalAmount = price * Math.max(qtyInt, 0);

  const canSubmit =
    !loading &&
    clientName.trim() &&
    productId > 0 &&
    qtyInt > 0 &&
    qtyInt <= availableStock;

  const handleCreateOrder = async () => {
    if (!canSubmit) {
      toast.error("Please verify your inputs");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const invoice = await apiFetch(`${API.vente}/api/ventes/commande`, {
        method: "POST",
        body: JSON.stringify({
          client: clientName.trim(),
          codePdt: productId,
          qteCmd: qtyInt,
        }),
      });

      toast.success("Order created successfully");

      navigate("/orders", {
        state: { newOrder: invoice },
      });
    } catch (e: any) {
      const status = e?.status;

      if (status === 401) {
        setError("Unauthorized (401). Please login again.");
        toast.error("Unauthorized (401)");
      } else {
        setError(e?.message || "Sale Service error");
        toast.error("Order creation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Create New Order</h1>

        {!productState && (
          <Button
            variant="secondary"
            onClick={fetchProducts}
            disabled={loadingProducts}
          >
            <RefreshCw
              size={18}
              className={`mr-2 ${loadingProducts ? "animate-spin" : ""}`}
            />
            Refresh products
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= PRODUCT ================= */}
        <Card>
          <h2 className="text-gray-900 mb-4">Product Details</h2>

          {!productState && (
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Select Product *
              </label>
              {loadingProducts ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader className="animate-spin" size={18} /> Loading...
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">-- Select a product --</option>
                  {products.map((p) => (
                    <option key={p.codepdt} value={p.codepdt}>
                      #{p.codepdt} - {p.nompdt} ({p.qteStock} units)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="p-4 bg-blue-50 rounded-lg flex gap-3 mb-4">
            <Package className="text-blue-600" />
            <div>
              <h3 className="text-gray-900">{productName || "—"}</h3>
              <p className="text-gray-600">ID: {productId || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Unit Price</p>
              <p className="text-gray-900">${price.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Available Stock</p>
              <p
                className={
                  availableStock > 50
                    ? "text-green-600"
                    : availableStock > 0
                    ? "text-orange-600"
                    : "text-red-600"
                }
              >
                {availableStock} units
              </p>
            </div>
          </div>
        </Card>

        {/* ================= ORDER ================= */}
        <Card>
          <h2 className="text-gray-900 mb-4">Order Information</h2>

          <div className="space-y-4">
            {/* Client */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Client Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  type="number"
                  min={1}
                  max={availableStock || undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Total */}
            <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-lg flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-700">
                <DollarSign className="text-blue-600" /> Total Amount
              </span>
              <h2 className="text-blue-600">${totalAmount.toFixed(2)}</h2>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleCreateOrder}
                disabled={!canSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Creating..." : "Create Order"}
              </Button>

              <Button
                type="button"
                onClick={() => navigate("/products")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>Note:</strong> Stock will be updated automatically and an
              invoice will be generated.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
