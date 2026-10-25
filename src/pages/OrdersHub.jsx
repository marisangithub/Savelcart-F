
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import { translations } from "../launages/index.js";
import EnablePushNotifications from "../components/EnablePushNotifications";

const API_URL = "https://savelcart-backend.onrender.com/api/orders";

export default function OrdersHub() {
  const language = localStorage.getItem("savel-language") || "English";
  const t = translations[language] || translations.English;

  const [activeTab, setActiveTab] = useState("buy");
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [actionMessage, setActionMessage] = useState({});
  const [statusFilter, setStatusFilter] = useState("ACTIVE");


  useEffect(() => {
    let cancelled = false;

    async function loadOrders(showLoading = false) {
      try {
        if (showLoading) {
          setLoading(true);
          setError("");
        }

        const [myOrders, sellerResponse] = await Promise.all([
          getMyOrders(),
          fetch(`${API_URL}/seller-orders`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const sellerData = await sellerResponse.json().catch(() => ({}));

        if (!sellerResponse.ok) {
          throw new Error(
            sellerData.message ||
              t.ordersHubSellerLoadError ||
              "Unable to load seller orders."
          );
        }

        if (!cancelled) {
          setBuyerOrders(myOrders);
          setSellerOrders(sellerData.orders || []);

          if (showLoading) {
            setError("");
          }
        }
      } catch (err) {
        if (!cancelled && showLoading) {
          setError(
            err.message ||
              t.ordersHubLoadError ||
              "Unable to load orders. Please log in."
          );
        } else if (!cancelled) {
          console.error("Automatic order refresh failed:", err);
        }
      } finally {
        if (!cancelled && showLoading) {
          setLoading(false);
        }
      }
    }

    // Load orders immediately when the page opens.
    loadOrders(true);

    // Refresh orders automatically every 5 seconds.
    const intervalId = setInterval(() => {
      loadOrders(false);
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);


  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

 const statusLabel = (status) =>
  ({
    PENDING_PAYMENT:
      t.orderStatusPendingPayment || "Awaiting Payment",
    CONFIRMED: "Confirmed",
    PAID: t.orderStatusPaid || "Paid",
    PREPARING: "Prepared",
    SHIPPED: "Shipped / Couriered",
    DELIVERED: "Delivered",
    RECEIVED: t.orderStatusReceived || "Received",
    PAYOUT_PENDING:
      t.orderStatusPayoutPending || "Payout Pending",
    COMPLETED: t.orderStatusCompleted || "Completed",
    DISPUTED: t.orderStatusDisputed || "Issue Reported",
    REFUNDED: t.orderStatusRefunded || "Refunded",
    CANCELLED: t.orderStatusCancelled || "Cancelled",
    AWAITING_BUYER_CONFIRMATION: "Awaiting Buyer Confirmation",
  })[status] || status;

  const allOrders = activeTab === "buy" ? buyerOrders : sellerOrders;

  const isActiveOrder = (status) =>
  [
    "PENDING_PAYMENT",
    "CONFIRMED",
    "PAID",
    "PREPARING",
    "SHIPPED",
    "AWAITING_BUYER_CONFIRMATION",
  ].includes(status);


 const filteredOrders = allOrders.filter((order) => {
  if (statusFilter === "ACTIVE") return isActiveOrder(order.status);
  if (statusFilter === "DELIVERED") return order.status === "DELIVERED";
  if (statusFilter === "COMPLETED") return order.status === "COMPLETED";
  if (statusFilter === "CANCELLED") return order.status === "CANCELLED";
  if (statusFilter === "REFUNDED") return order.status === "REFUNDED";
  return true;
});

  const filterOptions = [
  {
    value: "ACTIVE",
    label: "Active",
    count: allOrders.filter((o) => isActiveOrder(o.status)).length,
  },
  {
    value: "DELIVERED",
    label: "Delivered",
    count: allOrders.filter((o) => o.status === "DELIVERED").length,
  },
  {
    value: "COMPLETED",
    label: "Completed",
    count: allOrders.filter((o) => o.status === "COMPLETED").length,
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    count: allOrders.filter((o) => o.status === "CANCELLED").length,
  },
  {
    value: "REFUNDED",
    label: "Refunded",
    count: allOrders.filter((o) => o.status === "REFUNDED").length,
  },
  {
    value: "ALL",
    label: "All orders",
    count: allOrders.length,
  },
];

  const orders = filteredOrders;
  const notAvailable = t.ordersHubNotAvailable || "Not available";

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((current) => ({ ...current, [orderId]: !current[orderId] }));
  };

  const updateOrderStatus = async (orderId, status, role = "seller") => {
    setUpdatingOrderId(orderId);
    setActionMessage((current) => ({ ...current, [orderId]: "" }));
    try {
      const response = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Unable to update order status.");
      const updateList = (current) => current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: result.order?.status || status,
              deliveryMethod: result.order?.deliveryMethod || order.deliveryMethod,
            }
          : order
      );
      setSellerOrders(updateList);
      setBuyerOrders(updateList);
      setActionMessage((current) => ({ ...current, [orderId]: result.message || "Order status updated successfully." }));
    } catch (err) {
      setActionMessage((current) => ({ ...current, [orderId]: err.message || "Unable to update order status." }));
    } finally {
      setUpdatingOrderId("");
    }
  };

  

const sellerStatusOptions = (order) => {
  const status = order.status;

  const options = {
    PENDING_PAYMENT: [
      { value: "CONFIRMED", label: "Confirm Order" },
      { value: "CANCELLED", label: "Cancel Order" },
    ],
    CONFIRMED: [
      { value: "PREPARING", label: "Mark as Prepared" },
      { value: "CANCELLED", label: "Cancel Order" },
    ],
    PAID: [
      { value: "PREPARING", label: "Mark as Prepared" },
      { value: "CANCELLED", label: "Cancel Order" },
    ],
    PREPARING: [
  {
    value: "AWAITING_BUYER_CONFIRMATION",
    label: "Direct Deliver",
  },
  {
    value: "SHIPPED",
    label: "Shipped / Couriered",
  },
],
  };

  return options[status] || [];
};


  return (
    <main className="min-h-screen bg-[#faf9f5] px-4 py-10 text-[#243328] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="text-sm font-semibold text-[#294431] hover:underline"
        >
          ← {t.ordersHubBackHome || "Back to Home"}
        </Link>

        <header className="mt-6 rounded-3xl bg-[#294431] px-6 py-8 text-white sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            SAVEL SELLING
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {t.ordersHubTitle || "Orders"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/75">
            {t.ordersHubSubtitle ||
              "Manage the orders you place and the orders you receive as a seller."}
          </p>
        </header>

        <div className="mt-6 grid grid-cols-2 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("buy")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition sm:text-base ${
              activeTab === "buy"
                ? "bg-[#294431] text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
            aria-pressed={activeTab === "buy"}
          >
            🛍️ {t.ordersHubBuyOrders || "Buy Orders"} ({buyerOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sell")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition sm:text-base ${
              activeTab === "sell"
                ? "bg-[#294431] text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100"
            }`}
            aria-pressed={activeTab === "sell"}
          >
            📦 {t.ordersHubSellOrders || "Sell Orders"} ({sellerOrders.length})
          </button>
        </div>
   {activeTab === "sell" && (
          <EnablePushNotifications />
        )}
        {!loading && !error && (
          <div className="mt-5 flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === filter.value
                    ? "border-[#294431] bg-[#294431] text-white"
                    : "border-[#d7ddd5] bg-white text-[#294431] hover:bg-[#f0f3ed]"
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">
            {t.ordersHubLoading || "Loading your orders..."}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {error}
            <p className="mt-2 text-sm">
              {t.ordersHubLoginHint ||
                "Please log in with the account associated with your orders."}
            </p>
            <Link
              to="/login"
              className="mt-3 inline-block font-bold underline"
            >
              {t.ordersHubGoToLogin || "Go to Login"}
            </Link>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <div className="text-5xl">
              {activeTab === "buy" ? "🛍️" : "📦"}
            </div>

            <h2 className="mt-4 text-xl font-bold text-stone-900">
              {activeTab === "buy"
                ? t.ordersHubNoBuyOrders || "No buy orders yet"
                : t.ordersHubNoSellOrders || "No sell orders yet"}
            </h2>

            <p className="mt-2 text-stone-600">
              {activeTab === "buy"
                ? t.ordersHubNoBuyOrdersDescription ||
                  "Orders you place will appear here."
                : t.ordersHubNoSellOrdersDescription ||
                  "Orders placed for your bird listings will appear here."}
            </p>

            <Link
              to="/birds"
              className="mt-6 inline-block rounded-xl bg-[#294431] px-5 py-3 font-semibold text-white hover:bg-[#1e3325]"
            >
              {t.ordersHubBrowseBirds || "Browse Birds"}
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="mt-6 space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {t.ordersHubOrderNumber || "Order Number"}
                    </p>
                    <p className="mt-1 break-all font-bold text-stone-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
                    {statusLabel(order.status)}
                  </span>
                  <button type="button" onClick={() => toggleOrderDetails(order.id)}
                    className="rounded-xl border border-stone-300 px-3 py-1.5 text-sm font-semibold text-[#294431] hover:bg-stone-50"
                    aria-expanded={Boolean(expandedOrders[order.id])}>
                    {expandedOrders[order.id] ? "Hide Details" : "View Details"}
                  </button>
                </div>

                <div className="my-5 border-t border-stone-200" />

                <div className="flex items-start gap-4">
                  {order.birdDetails?.photo ? (
                    <img
                      src={order.birdDetails.photo}
                      alt={
                        order.birdDetails.title ||
                        t.ordersHubBirdFallback ||
                        "Bird"
                      }
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-3xl">
                      🐓
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="break-words font-bold text-stone-900">
                      {order.birdDetails?.title ||
                        t.ordersHubBirdFallback ||
                        "Bird order"}
                    </h2>

                    {activeTab === "sell" && expandedOrders[order.id] && (
                      <div className="mt-2 space-y-1 text-sm text-stone-600">
                        <p>
                          Delivery method:{" "}
                          {order.status === "AWAITING_BUYER_CONFIRMATION"
                            ? "Direct handover"
                            : order.status === "SHIPPED"
                              ? "Courier delivery"
                              : order.deliveryMethod === "PICKUP"
                                ? "Direct pickup"
                                : order.deliveryMethod === "COURIER"
                                  ? "Courier delivery"
                                  : "Not selected"}
                        </p>
                        <p>
                          {t.ordersHubBuyer || "Buyer"}:{" "}
                          {order.deliveryAddress?.name ||
                            order.buyer?.name ||
                            notAvailable}
                        </p>
                        <p>
                          {t.ordersHubPhone || "Phone"}:{" "}
                          {order.deliveryAddress?.phone || notAvailable}
                        </p>
                        <p>
                          {t.ordersHubAddress || "Address"}:{" "}
                          {[
                            order.deliveryAddress?.address,
                            order.deliveryAddress?.town,
                            order.deliveryAddress?.district,
                          ]
                            .filter(Boolean)
                            .join(", ") || notAvailable}
                        </p>
                      </div>
                    )}
                    {activeTab === "buy" && expandedOrders[order.id] && (
                      <div className="mt-2 space-y-1 text-sm text-stone-600">
                        <p>Seller: {order.sellerName || notAvailable}</p>
                        <p>
                          Delivery method:{" "}
                          {order.status === "AWAITING_BUYER_CONFIRMATION"
                            ? "Direct handover"
                            : order.status === "SHIPPED"
                              ? "Courier delivery"
                              : order.deliveryMethod === "PICKUP"
                                ? "Direct pickup"
                                : order.deliveryMethod === "COURIER"
                                  ? "Courier delivery"
                                  : "Not selected"}
                        </p>
                        <p>Delivery name: {order.deliveryAddress?.name || notAvailable}</p>
                        <p>Phone: {order.deliveryAddress?.phone || notAvailable}</p>
                        <p>Address: {[order.deliveryAddress?.address, order.deliveryAddress?.town, order.deliveryAddress?.district].filter(Boolean).join(", ") || notAvailable}</p>
                        <p>Order status: {statusLabel(order.status)}</p>
                      </div>
                    )}


                    <p className="mt-2 text-sm text-stone-600">
                      {t.ordersHubBirdPrice || "Bird price"}:{" "}
                      {formatPrice(order.birdPrice)}
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#294431]">
                      {t.ordersHubTotal || "Total"}:{" "}
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {activeTab === "sell" && expandedOrders[order.id] && sellerStatusOptions(order).length > 0 && (
                  <div className="mt-5 rounded-xl border border-stone-200 p-4">
                    <label htmlFor={`status-${order.id}`} className="mb-2 block text-sm font-semibold text-stone-700">Update order status</label>
                    <select id={`status-${order.id}`} defaultValue="" disabled={updatingOrderId === order.id}
                      onChange={(event) => { const nextStatus = event.target.value; if (nextStatus) updateOrderStatus(order.id, nextStatus); event.target.value = ""; }}
                      className="min-h-11 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm">
                      <option value="" disabled>Select next status...</option>
                      {sellerStatusOptions(order).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    {updatingOrderId === order.id && <p className="mt-2 text-sm text-stone-500">Updating...</p>}
                    {actionMessage[order.id] && <p role="status" className="mt-3 text-sm text-stone-600">{actionMessage[order.id]}</p>}
                  </div>
                )}
               {activeTab === "buy" &&
  expandedOrders[order.id] &&
  ["SHIPPED", "AWAITING_BUYER_CONFIRMATION"].includes(order.status) && (
    <div className="mt-5 rounded-xl border border-stone-200 p-4">
      <p className="text-sm text-stone-600">
        Have you received the bird? Confirm only after you receive it.
      </p>

      <button
        type="button"
        disabled={updatingOrderId === order.id}
        onClick={() => updateOrderStatus(order.id, "COMPLETED", "buyer")}
        className="mt-3 rounded-xl bg-[#294431] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3325] disabled:opacity-60"
      >
        {updatingOrderId === order.id
          ? "Updating..."
          : "I Received the Bird — Confirm Order"}
      </button>

      {actionMessage[order.id] && (
        <p role="status" className="mt-3 text-sm text-stone-600">
          {actionMessage[order.id]}
        </p>
      )}
    </div>
)}
                {expandedOrders[order.id] && order.status === "PENDING_PAYMENT" && (

                  <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                    {t.ordersHubPaymentPending ||
                      "Payment gateway is not connected yet. This order is not paid or confirmed."}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
