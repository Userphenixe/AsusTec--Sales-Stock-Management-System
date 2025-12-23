import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Archive,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API, apiFetch } from "../lib/api";

// =======================
// Endpoints
// =======================
const COMMERCIAL_URL = `${API.commercial}/api/commercial/produits`;
const STOCK_URL = `${API.stock}/api/stock/produits`;
const SALES_ORDERS_URL = `${API.vente}/api/ventes/commandes`;

// =======================
// Types (tolérants)
// =======================
type CommercialProduct = {
  codepdt: number;
  nompdt: string;
  prixpdt: number;
};

type StockItem = {
  codepdt: number;
  qtepdt?: number;
  qteStock?: number;
};

type SaleOrder = {
  codecmd: string | number;
  client: string;
  codepdt: string | number;
  qtecmd: number;
  datecmd: string;
};

type ChartRow = { month: string; orders: number; revenue: number };

// =======================
// Helpers sûrs
// =======================
const toInt = (v: any) => {
  const n = Number.parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
};

const toNum = (v: any) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const monthLabel = (year: number, monthIndex: number) =>
  new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    new Date(year, monthIndex, 1),
  );

const fmtNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function last6Months(): { key: string; label: string; date: Date }[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const arr: { key: string; label: string; date: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(start.getFullYear(), start.getMonth() - i, 1);
    arr.push({
      key: monthKey(d),
      label: monthLabel(d.getFullYear(), d.getMonth()),
      date: d,
    });
  }
  return arr;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [products, setProducts] = useState<CommercialProduct[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [chartData, setChartData] = useState<ChartRow[]>(() =>
    last6Months().map((m) => ({ month: m.label, orders: 0, revenue: 0 })),
  );

  const fetchAll = async (isRefresh = false) => {
    setError("");
    isRefresh ? setRefreshing(true) : setLoading(true);

    try {
      const [pJson, sJson, oJson] = await Promise.all([
        apiFetch<any[]>(COMMERCIAL_URL),
        apiFetch<any[]>(STOCK_URL),
        apiFetch<any[]>(SALES_ORDERS_URL),
      ]);

      const normalizedProducts: CommercialProduct[] = (pJson || []).map((x) => ({
        codepdt: toInt(x.codepdt),
        nompdt: String(x.nompdt ?? ""),
        prixpdt: toNum(x.prixpdt),
      }));

      const normalizedStocks: StockItem[] = (sJson || []).map((x) => ({
        codepdt: toInt(x.codepdt),
        qtepdt: x.qtepdt !== undefined ? toInt(x.qtepdt) : undefined,
        qteStock: x.qteStock !== undefined ? toInt(x.qteStock) : undefined,
      }));

      const normalizedOrders: SaleOrder[] = (oJson || []).map((x) => ({
        codecmd: x.codecmd,
        client: String(x.client ?? ""),
        codepdt: x.codepdt,
        qtecmd: toInt(x.qtecmd),
        datecmd: String(x.datecmd ?? ""),
      }));

      setProducts(normalizedProducts);
      setStocks(normalizedStocks);
      setOrders(normalizedOrders);

      setLastUpdated(new Date());
      const months = last6Months();
      const priceMap = new Map<number, number>();
      normalizedProducts.forEach((p) =>
        priceMap.set(p.codepdt, toNum(p.prixpdt)),
      );

      const buckets = new Map<string, { orders: number; revenue: number }>();
      months.forEach((m) => buckets.set(m.key, { orders: 0, revenue: 0 }));

      for (const o of normalizedOrders) {
        const d = new Date(o.datecmd);
        if (Number.isNaN(d.getTime())) continue;

        const k = monthKey(d);
        if (!buckets.has(k)) continue;

        const pid = toInt(o.codepdt);
        const price = priceMap.get(pid) ?? 0;
        const qty = toInt(o.qtecmd);

        const b = buckets.get(k)!;
        b.orders += 1;
        b.revenue += price * qty;
      }

      const computedChart: ChartRow[] = months.map((m) => {
        const b = buckets.get(m.key)!;
        return {
          month: m.label,
          orders: Number.isFinite(b.orders) ? b.orders : 0,
          revenue: Number.isFinite(b.revenue) ? Math.round(b.revenue) : 0,
        };
      });

      setChartData(computedChart);

      if (isRefresh) toast.success("Dashboard refreshed");
    } catch (e: any) {
      const status = e?.status;

      const msg =
        status === 401
          ? "Unauthorized (401). Your token is missing/expired. Please login again."
          : e?.message ||
            "Unable to load dashboard data. Check services 8081/8082/8083 and CORS.";

      setError(msg);
      toast.error(msg);
      console.error(e);

      setChartData(
        last6Months().map((m) => ({ month: m.label, orders: 0, revenue: 0 })),
      );
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================
  // KPIs live
  // =======================
  const totalProducts = products.length;

  const totalStockQty = useMemo(() => {
    return stocks.reduce((acc, s) => {
      const q = s.qteStock !== undefined ? s.qteStock : s.qtepdt ?? 0;
      return acc + toInt(q);
    }, 0);
  }, [stocks]);

  const thisMonthKey = monthKey(new Date());

  const ordersThisMonth = useMemo(() => {
    return orders.filter((o) => {
      const d = new Date(o.datecmd);
      if (Number.isNaN(d.getTime())) return false;
      return monthKey(d) === thisMonthKey;
    });
  }, [orders, thisMonthKey]);

  const numberOfCommandsThisMonth = ordersThisMonth.length;

  const revenueThisMonth = useMemo(() => {
    const priceMap = new Map<number, number>();
    products.forEach((p) => priceMap.set(p.codepdt, toNum(p.prixpdt)));

    return ordersThisMonth.reduce((acc, o) => {
      const pid = toInt(o.codepdt);
      const price = priceMap.get(pid) ?? 0;
      const qty = toInt(o.qtecmd);
      const v = price * qty;
      return acc + (Number.isFinite(v) ? v : 0);
    }, 0);
  }, [ordersThisMonth, products]);

  const kpis = [
    {
      title: "Total Products",
      value: fmtNumber(totalProducts),
      icon: Package,
      color: "bg-blue-600",
      trend: "Commercial",
      sub: "Live sync",
    },
    {
      title: "Total Stock Quantity",
      value: fmtNumber(totalStockQty),
      icon: Archive,
      color: "bg-green-600",
      trend: "Stock",
      sub: "Live sync",
    },
    {
      title: "Number of Commands (This Month)",
      value: fmtNumber(numberOfCommandsThisMonth),
      icon: ShoppingCart,
      color: "bg-purple-600",
      trend: "Sale",
      sub: "This month",
    },
    {
      title: "Revenue (This Month)",
      value: fmtCurrency(revenueThisMonth),
      icon: TrendingUp,
      color: "bg-orange-600",
      trend: "Computed",
      sub: "Qty × price",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Synced from Commercial (8081), Stock (8082) and Sale (8083)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Last updated</p>
            <p className="text-sm text-gray-700">
              {lastUpdated ? lastUpdated.toLocaleDateString() : "—"}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => fetchAll(true)}
            disabled={loading || refreshing}
            className="h-11"
          >
            <RefreshCw
              size={18}
              className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle
            className="text-red-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Connection error</p>
            <p className="text-red-700 mt-1">{error}</p>
            <p className="text-red-700 mt-1">
              Check ports 8081/8082/8083 and CORS.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => fetchAll(true)}
            className="h-11"
          >
            Retry
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700">
                      {kpi.title}
                    </p>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border bg-white text-gray-600">
                      {kpi.trend}
                    </span>
                  </div>

                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
                </div>

                <div className={`${kpi.color} p-3 rounded-xl shadow-sm`}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-gray-900 font-semibold">Sales Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Last 6 months: Orders count and computed revenue
            </p>
          </div>

          <Button
            onClick={() => navigate("/orders")}
            variant="secondary"
            className="h-10"
          >
            View Orders
          </Button>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
              formatter={(value: any, name: any) => {
                if (name === "Revenue ($)")
                  return [fmtCurrency(toNum(value)), name];
                return [fmtNumber(toInt(value)), name];
              }}
            />
            <Legend />
            <Bar
              dataKey="orders"
              fill="#2563eb"
              name="Orders"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="revenue"
              fill="#10b981"
              name="Revenue ($)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Quick actions */}
      <Card>
        <h2 className="text-gray-900 font-semibold mb-2">Quick Actions</h2>
        <p className="text-sm text-gray-600 mb-4">Jump to the main flows</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => navigate("/products")}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Products
          </Button>
          <Button
            onClick={() => navigate("/order-creation")}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Order
          </Button>
          <Button
            onClick={() => navigate("/orders")}
            variant="secondary"
            className="h-12"
          >
            Orders & Invoices
          </Button>
        </div>

        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-900 text-sm">
            <strong>Note:</strong> Revenue is computed from Sale orders using
            product prices from the Commercial Service (quantity × unit price).
          </p>
        </div>
      </Card>
    </div>
  );
}
