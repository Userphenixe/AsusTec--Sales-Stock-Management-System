import React, { useState } from "react";
import {
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { API, apiFetch } from "../../lib/api";

export default function CreateProduct() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nompdt: "",
    descpdt: "",
    prixpdt: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    const name = formData.nompdt.trim();
    const desc = (formData.descpdt || "").trim();
    const price = Number(String(formData.prixpdt).replace(",", "."));

    if (!name || !formData.prixpdt) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be a valid number greater than 0");
      setLoading(false);
      return;
    }

    const payload = { nompdt: name, descpdt: desc, prixpdt: price };

    try {
      await apiFetch(`${API.commercial}/api/commercial/produits`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(`Product "${name}" created successfully!`);
      setFormData({ nompdt: "", descpdt: "", prixpdt: "" });

      setTimeout(() => navigate("/products"), 1200);
    } catch (err: any) {
      const status = err?.status;

      if (status === 401) {
        setError("Unauthorized (401). Please login again.");
      } else {
        setError(err?.message || "Error connecting to Commercial Service");
      }

      console.error("Create product payload:", payload);
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Product
          </h1>
          <p className="text-gray-600 mt-1">
            Add a new product to the Commercial Service
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
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Something went wrong</p>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-0.5" size={20} />
          <div>
            <p className="text-green-800 font-medium">{success}</p>
            <p className="text-green-700 mt-1">
              Redirecting to products list...
            </p>
          </div>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                name="nompdt"
                type="text"
                placeholder="e.g., Laptop ASUS VivoBook"
                value={formData.nompdt}
                onChange={handleChange}
                className="pl-10 h-11"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Use a clear, searchable name (brand + model).
            </p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                name="prixpdt"
                type="text"
                inputMode="decimal"
                placeholder="e.g., 12000"
                value={formData.prixpdt}
                onChange={handleChange}
                className="pl-10 h-11"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Accepts dot or comma (e.g. 12000 or 12000,50).
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              name="descpdt"
              rows={4}
              placeholder="Enter product description..."
              value={formData.descpdt}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-11"
            >
              {loading ? "Creating Product..." : "Create Product"}
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
              <strong>Note:</strong> Product ID is generated automatically by the
              backend (Commercial Service – Port 8081).
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
