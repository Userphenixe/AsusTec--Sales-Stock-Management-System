import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Download,
  FileText,
  Calendar,
  User,
  Loader,
  AlertCircle,
  RefreshCw,
  Receipt,
  Package,
  ArrowLeft,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableRow, TableCell } from "../components/ui/Table";
import { toast } from "sonner";
import { API, apiFetch } from "../lib/api";

interface Order {
  codecmd: string;
  client: string;
  codepdt: string;
  qtecmd: number;
  datecmd: string;
}

type UiOrder = {
  orderId: string;
  client: string;
  productCode: string;
  product?: string;
  quantity: number;
  unitPrice?: number;
  total?: number;
  date: string;
  invoice?: any;
};

export default function OrderConfirmation() {
  const location = useLocation();
  const newOrder = (location.state as any)?.newOrder as UiOrder | undefined;

  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<UiOrder | null>(
    newOrder || null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lastSelectedOrder, setLastSelectedOrder] = useState<UiOrder | null>(
    null,
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (newOrder) {
      setOrders((prev) => [newOrder, ...prev]);
      setSelectedOrder(newOrder);
      toast.success("Order created successfully!");
    }
  }, [newOrder]);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch<Order[]>(`${API.vente}/api/ventes/commandes`);

      const transformed: UiOrder[] = (data || []).map((o) => ({
        orderId: String(o.codecmd),
        client: o.client,
        productCode: String(o.codepdt),
        product: String(o.codepdt),
        quantity: Number(o.qtecmd ?? 0),
        unitPrice: 0,
        total: 0,
        date: o.datecmd,
      }));

      setOrders((prev) => {
        const map = new Map<string, UiOrder>();
        [...prev, ...transformed].forEach((x) => map.set(x.orderId, x));
        return Array.from(map.values());
      });
    } catch (err: any) {
      const status = err?.status;

      const errorMsg =
        status === 401
          ? "Unauthorized (401). Your token is missing/expired. Please login again."
          : "Unable to connect to Sale Service. Please ensure the backend is running.";

      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (order: UiOrder) => {
    toast.success(`Downloading invoice for ${order.orderId}...`);

    const invoiceText = `
INVOICE
=======

Order ID: ${order.orderId}
Client: ${order.client}
Date: ${new Date(order.date).toLocaleDateString()}

Product Code: ${order.productCode}
Product: ${order.product ?? order.productCode}
Quantity: ${order.quantity} units
Unit Price: $${order.unitPrice?.toFixed(2) || "0.00"}
Total: $${order.total?.toFixed(2) || "0.00"}
`;

    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.orderId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const onView = (order: UiOrder) => {
    setLastSelectedOrder(selectedOrder);
    setSelectedOrder(order);
  };

  const onBack = () => {
    if (lastSelectedOrder) {
      setSelectedOrder(lastSelectedOrder);
      setLastSelectedOrder(null);
      return;
    }
    setSelectedOrder(null);
  };

  const headerRight = useMemo(() => {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={fetchOrders}
          disabled={loading}
          className="h-10 px-4"
        >
          <RefreshCw
            size={16}
            className={`mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>

        {selectedOrder && (
          <Button
            onClick={() => handleDownloadPDF(selectedOrder)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download size={16} className="mr-2" />
            Download Invoice
          </Button>
        )}
      </div>
    );
  }, [loading, selectedOrder]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Orders & Invoices
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Review orders and download invoice details
          </p>
        </div>
        {headerRight}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Connection error</p>
            <p className="text-red-700 mt-1">{error}</p>
            <p className="text-red-700 mt-1">
              Make sure the Sale Service is running on port 8083
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={fetchOrders}
            className="h-10 px-4"
            disabled={loading}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Orders table */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="text-blue-600" size={18} />
                <h2 className="text-gray-900 font-semibold text-base">
                  All Orders
                </h2>
              </div>

              <span className="text-sm text-gray-500">
                {loading ? "—" : `${orders.length} order(s)`}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-blue-600 mr-3" size={22} />
                <p className="text-gray-600 text-sm">
                  Loading orders from Sale Service...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={44} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-1">No orders found</p>
                <p className="text-gray-400 text-sm">
                  Create your first order to see it here
                </p>
              </div>
            ) : (
              <Table
                headers={[
                  "Order ID",
                  "Client",
                  "Product Code",
                  "Quantity",
                  "Total",
                  "Date",
                  "Action",
                ]}
              >
                {orders.map((order) => {
                  const isSelected = selectedOrder?.orderId === order.orderId;

                  return (
                    <TableRow
                      key={order.orderId}
                      className={isSelected ? "bg-blue-50" : ""}
                    >
                      <TableCell className="font-medium">
                        {order.orderId}
                      </TableCell>

                      <TableCell>{order.client}</TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <Package size={14} className="text-gray-500" />
                          {order.productCode}
                        </span>
                      </TableCell>

                      <TableCell>{order.quantity} units</TableCell>

                      <TableCell>
                        {order.total && order.total > 0
                          ? `$${order.total.toFixed(2)}`
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Button
                          onClick={() => onView(order)}
                          className={`h-9 px-4 ${
                            isSelected
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                          }`}
                        >
                          <FileText size={14} className="mr-2" />
                          {isSelected ? "Selected" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Table>
            )}
          </Card>
        </div>

        {/* Right: Invoice panel */}
        <div>
          {selectedOrder ? (
            <Card className="sticky top-24 overflow-hidden">
              {/* Invoice header */}
              <div className="border-b border-gray-200 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="text-blue-600" size={18} />
                    <h2 className="text-gray-900 font-semibold text-base">
                      Invoice
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      #{selectedOrder.orderId}
                    </span>
                  </div>
                </div>

                {/* Back button */}
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    onClick={onBack}
                    className="h-9 px-3"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </Button>
                </div>
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-gray-600" />
                    <span className="text-gray-600 text-sm">Client</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {selectedOrder.client}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-gray-600" />
                    <span className="text-gray-600 text-sm">Date</span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {new Date(selectedOrder.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-gray-900 font-semibold mb-3 text-sm">
                    Order Details
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Product Code</span>
                      <span className="text-gray-900 font-medium">
                        {selectedOrder.productCode}
                      </span>
                    </div>

                    {selectedOrder.product &&
                      selectedOrder.product !== selectedOrder.productCode && (
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-600">Product</span>
                          <span className="text-gray-900 font-medium">
                            {selectedOrder.product}
                          </span>
                        </div>
                      )}

                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Quantity</span>
                      <span className="text-gray-900 font-medium">
                        {selectedOrder.quantity} units
                      </span>
                    </div>

                    {!!selectedOrder.unitPrice && selectedOrder.unitPrice > 0 && (
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-600">Unit Price</span>
                        <span className="text-gray-900 font-medium">
                          ${selectedOrder.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.total && selectedOrder.total > 0 && (
                  <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-800 font-semibold">
                        Total Amount
                      </span>
                      <span className="text-blue-700 text-lg font-semibold">
                        ${selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleDownloadPDF(selectedOrder)}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download size={16} className="mr-2" />
                  Download Invoice PDF
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <FileText size={44} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">
                Select an order to view invoice details
              </p>
              <p className="text-gray-400 mt-1 text-sm">
                Click “View” on any order from the list
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
