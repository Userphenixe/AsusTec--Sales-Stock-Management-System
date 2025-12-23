import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Loader,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Table, TableRow, TableCell } from "../components/ui/Table";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API, apiFetch } from "../lib/api";

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

export default function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const normalizeProducts = (data: RawProduct[]): Product[] => {
    return (data || []).map((p) => ({
      codepdt: Number(p.codepdt),
      nompdt: p.nompdt ?? "",
      descpdt: p.descpdt ?? "",
      prixpdt: Number(p.prixpdt ?? 0),
      qteStock: Number((p.qteStock ?? p.qtepdt ?? 0) as number),
    }));
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<RawProduct[]>(
        `${API.vente}/api/ventes/produits`,
      );

      const normalized = normalizeProducts(data || []);
      setProducts(normalized);
      toast.success("Products loaded successfully");
    } catch (err: any) {
      const status = err?.status;

      const errorMsg =
        status === 401
          ? "Unauthorized (401). Your token is missing/expired. Please login again."
          : "Unable to connect to Sale Service. Please ensure the backend is running.";

      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products
      .filter((p) => {
        if (!term) return true;
        return (
          p.nompdt.toLowerCase().includes(term) ||
          String(p.codepdt).includes(term)
        );
      })
      .sort((a, b) => {
        if (sortBy === "price") return a.prixpdt - b.prixpdt;
        if (sortBy === "stock") return b.qteStock - a.qteStock;
        return a.nompdt.localeCompare(b.nompdt);
      });
  }, [products, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-900">Product Catalog</h1>
        <Button
          variant="secondary"
          onClick={fetchProducts}
          disabled={loading}
          className="h-11 bg-gray-200 hover:bg-gray-300"
        >
          <RefreshCw
            size={20}
            className={`mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle
            className="text-red-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{error}</p>
            <Button
              variant="secondary"
              onClick={fetchProducts}
              className="h-11 mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Search by product name or id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600 mr-3" size={24} />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <Table
            headers={[
              "Product ID",
              "Product Name",
              "Description",
              "Price",
              "Stock Quantity",
              "Action",
            ]}
          >
            {filteredProducts.map((product) => (
              <TableRow key={product.codepdt}>
                <TableCell>{product.codepdt}</TableCell>
                <TableCell>{product.nompdt}</TableCell>
                <TableCell>{product.descpdt || "—"}</TableCell>
                <TableCell>${product.prixpdt.toFixed(2)}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full ${
                      product.qteStock > 100
                        ? "bg-green-100 text-green-800"
                        : product.qteStock > 50
                        ? "bg-yellow-100 text-yellow-800"
                        : product.qteStock > 0
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.qteStock} units
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() =>
                      navigate("/order-creation", {
                        state: {
                          product: {
                            id: product.codepdt,
                            code: product.codepdt,
                            name: product.nompdt,
                            description: product.descpdt,
                            price: product.prixpdt,
                            stock: product.qteStock,
                          },
                        },
                      })
                    }
                    className={`flex items-center gap-2 ${
                      product.qteStock === 0
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    disabled={product.qteStock === 0}
                  >
                    <ShoppingCart size={16} />
                    {product.qteStock === 0 ? "Out of Stock" : "Order"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
