import React, { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Package,
  Hash,
  AlertCircle,
  CheckCircle,
  Loader,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { API, apiFetch } from "../../lib/api";

interface Product {
  codepdt: number;
  nompdt: string;
  prixpdt: number;
}

export default function AddStock() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    codepdt: "",
    qtepdt: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const selectedProduct = useMemo(() => {
    const id = Number.parseInt(formData.codepdt || "0", 10);
    return products.find((p) => p.codepdt === id);
  }, [formData.codepdt, products]);

  const canSubmit = useMemo(() => {
    const code = Number.parseInt(String(formData.codepdt).trim(), 10);
    const qty = Number.parseInt(String(formData.qtepdt).trim(), 10);
    if (loading) return false;
    if (!Number.isInteger(code) || code <= 0) return false;
    if (!Number.isInteger(qty) || qty <= 0) return false;
    return true;
  }, [formData.codepdt, formData.qtepdt, loading]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setError("");

    try {
      const data = await apiFetch<Product[]>(`${API.commercial}/api/commercial/produits`);
      setProducts(data || []);
    } catch (err: any) {
      const status = err?.status;

      const msg =
        status === 401
          ? "Unauthorized (401). Please login again."
          : err?.message || "Unable to load products from Commercial Service";

      setError(msg);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const code = Number.parseInt(String(formData.codepdt).trim(), 10);
    const qty = Number.parseInt(String(formData.qtepdt).trim(), 10);

    if (!formData.codepdt || !formData.qtepdt) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!Number.isInteger(code) || code <= 0) {
      setError("Please select a valid product");
      setLoading(false);
      return;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Quantity must be a positive integer");
      setLoading(false);
      return;
    }

    const payload = { codepdt: code, qtepdt: qty };

    try {
      await apiFetch(`${API.stock}/api/stock/produits`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const p = products.find((x) => x.codepdt === code);
      setSuccess(
        `Stock added successfully! ${qty} units of "${p?.nompdt ?? "selected product"}" added.`,
      );

      setFormData({ codepdt: "", qtepdt: "" });

      setTimeout(() => navigate("/products"), 1200);
    } catch (err: any) {
      const status = err?.status;

      const msg =
        status === 401
          ? "Unauthorized (401). Please login again."
          : err?.message || "Error connecting to Stock Service";

      setError(msg);
      console.error("Add stock payload:", payload);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add Stock</h1>
          <p className="text-gray-600 mt-1">
            Add stock quantity for existing products
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/products")}
          className="whitespace-nowrap"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Something went wrong</p>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle
            className="text-green-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <p className="text-green-800 font-medium">{success}</p>
            <p className="text-green-700 mt-1">
              Redirecting to products list...
            </p>
          </div>
        </div>
      )}

      <Card>
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600 mr-3" size={24} />
            <p className="text-gray-600">
              Loading products from Commercial Service...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-600 mb-4">
              No products available. Please create a product first.
            </p>
            <Button
              onClick={() => navigate("/admin/products/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white h-11"
            >
              Create Product
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    name="qtepdt"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="e.g., 100"
                    value={formData.qtepdt}
                    onChange={handleChange}
                    className="pl-10 h-11"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Number of units to add</p>
              </div>

              {/* Product Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Product <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Archive
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                  <select
                    name="codepdt"
                    value={formData.codepdt}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-900"
                    required
                  >
                    <option value="">-- Select a product --</option>
                    {products.map((product) => (
                      <option key={product.codepdt} value={product.codepdt}>
                        #{product.codepdt} - {product.nompdt} ($
                        {product.prixpdt.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  Choose the product to add stock for
                </p>
              </div>
            </div>

            {/* Selected Product Card */}
            {selectedProduct && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-900 font-semibold mb-2">
                  Selected Product
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-blue-700">ID</p>
                    <p className="text-blue-900 font-medium">
                      {selectedProduct.codepdt}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-blue-700">Name</p>
                    <p className="text-blue-900 font-medium">
                      {selectedProduct.nompdt}
                    </p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-blue-700">Price</p>
                    <p className="text-blue-900 font-medium">
                      ${selectedProduct.prixpdt.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-gray-900 font-semibold mb-3">Summary</h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Product</span>
                  <span className="text-gray-900 font-medium">
                    {selectedProduct
                      ? `#${selectedProduct.codepdt} - ${selectedProduct.nompdt}`
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quantity to Add</span>
                  <span className="text-gray-900 font-medium">
                    {formData.qtepdt ? `${formData.qtepdt} units` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Adding Stock..." : "Add Stock"}
              </Button>

              <Button
                type="button"
                onClick={() => navigate("/products")}
                className="h-11 bg-red-600 hover:bg-red-700 text-white sm:w-40"
              >
                Cancel
              </Button>
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="text-blue-700 mt-0.5" size={18} />
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This will add stock to the Stock Service
                (Port 8082). The product must already exist in the Commercial
                Service. Stock ID is assumed to be generated by the backend.
              </p>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
