import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/orderService";
import { translations } from "../launages/index.js";

export default function MyOrders() {
  const language = localStorage.getItem("savel-language") || "English";
  const t = translations[language] || translations.English;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders();

        if (!cancelled) {
          setOrders(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || t.myOrdersLoadError || "Unable to load your orders."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
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
      PENDING_PAYMENT: t.orderStatusPendingPayment || "Awaiting Payment",
      PAID: t.orderStatusPaid || "Paid",
      PREPARING: t.orderStatusPreparing || "Preparing",
      SHIPPED: t.orderStatusShipped || "Shipped",
      DELIVERED: t.orderStatusDelivered || "Delivered",
      RECEIVED: t.orderStatusReceived || "Received",
      PAYOUT_PENDING: t.orderStatusPayoutPending || "Payout Pending",
      COMPLETED: t.orderStatusCompleted || "Completed",
      DISPUTED: t.orderStatusDisputed || "Issue Reported",
      REFUNDED: t.orderStatusRefunded || "Refunded",
    })[status] || status;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">
              {t.myOrdersTitle || "My Orders"}
            </h1>
            <p className="mt-2 text-stone-600">
              {t.myOrdersSubtitle ||
                "View your bird orders and their current status."}
            </p>
          </div>

          <Link
            to="/birds"
            className="rounded-xl bg-[#294431] px-5 py-3 font-semibold text-white hover:bg-[#1e3325]"
          >
            {t.myOrdersBrowseBirds || "Browse Birds"}
          </Link>
        </div>

        {loading && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">
            {t.myOrdersLoading || "Loading your orders..."}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {error}
            <p className="mt-2 text-sm">
              {t.myOrdersLoginHint ||
                "Please check whether you are logged in."}
            </p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <div className="text-5xl">🐓</div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">
              {t.myOrdersEmptyTitle || "No orders yet"}
            </h2>
            <p className="mt-2 text-stone-600">
              {t.myOrdersEmptyDescription ||
                "Your orders will appear here after you place an order."}
            </p>
            <Link
              to="/birds"
              className="mt-6 inline-block rounded-xl bg-[#294431] px-5 py-3 font-semibold text-white hover:bg-[#1e3325]"
            >
              {t.myOrdersExploreBirds || "Explore Birds"}
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                      {t.myOrdersOrderNumber || "Order Number"}
                    </p>
                    <p className="mt-1 break-all font-bold text-stone-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      {t.myOrdersOrderedOn || "Ordered on"}{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="my-5 border-t border-stone-200" />

                <div className="flex items-start gap-4">
                  {order.birdDetails?.photo ? (
                    <img
                      src={order.birdDetails.photo}
                      alt={order.birdDetails.title || "Bird"}
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
                        t.myOrdersBirdFallback ||
                        "Bird order"}
                    </h2>
                    <p className="mt-2 text-sm text-stone-600">
                      {t.myOrdersSeller || "Seller"}: {order.sellerName}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      {t.myOrdersBirdPrice || "Bird price"}:{" "}
                      {formatPrice(order.birdPrice)}
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#294431]">
                      {t.myOrdersTotal || "Total"}:{" "}
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                {order.status === "PENDING_PAYMENT" && (
                  <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                    {t.myOrdersPaymentPending ||
                      "Payment gateway is not connected yet. This order has not been paid for or confirmed."}
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