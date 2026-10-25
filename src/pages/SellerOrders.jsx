
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { translations } from "../launages/index.js";

const API_URL = "https://savelcart-backend.onrender.com/api/orders";

export default function SellerOrders() {
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

        const response = await fetch(`${API_URL}/seller-orders`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || t.sellerOrdersLoadError || "Unable to load seller orders."
          );
        }

        if (!cancelled) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || t.sellerOrdersLoadError || "Unable to load seller orders."
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

  const notAvailable = t.sellerOrdersNotAvailable || "Not available";

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">
              {t.sellerOrdersTitle || "Seller Orders"}
            </h1>
            <p className="mt-2 text-stone-600">
              {t.sellerOrdersSubtitle ||
                "Manage orders placed for your bird listings."}
            </p>
          </div>

          <Link
            to="/profile"
            className="rounded-xl border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-700 hover:bg-stone-100"
          >
            {t.sellerOrdersBackToProfile || "Back to Profile"}
          </Link>
        </div>

        {loading && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">
            {t.sellerOrdersLoading || "Loading seller orders..."}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {error}
            <p className="mt-2 text-sm">
              {t.sellerOrdersLoginHint ||
                "Please check whether you are logged in."}
            </p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <div className="text-5xl">📦</div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">
              {t.sellerOrdersEmptyTitle || "No orders received yet"}
            </h2>
            <p className="mt-2 text-stone-600">
              {t.sellerOrdersEmptyDescription ||
                "Orders for your bird listings will appear here."}
            </p>
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
                      {t.sellerOrdersOrderNumber || "Order Number"}
                    </p>
                    <p className="mt-1 break-all font-bold text-stone-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      {t.sellerOrdersOrderDate || "Order date"}:{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="my-5 border-t border-stone-200" />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <section>
                    <h2 className="font-bold text-stone-900">
                      {t.sellerOrdersBirdDetails || "Bird Details"}
                    </h2>

                    <div className="mt-3 flex items-start gap-4">
                      {order.birdDetails?.photo ? (
                        <img
                          src={order.birdDetails.photo}
                          alt={
                            order.birdDetails.title ||
                            t.sellerOrdersBirdFallback ||
                            "Bird"
                          }
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-3xl">
                          🐓
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="break-words font-semibold text-stone-900">
                          {order.birdDetails?.title ||
                            t.sellerOrdersBirdFallback ||
                            "Bird order"}
                        </p>
                        <p className="mt-2 text-sm text-stone-600">
                          {t.sellerOrdersBirdPrice || "Bird price"}:{" "}
                          {formatPrice(order.birdPrice)}
                        </p>
                        <p className="mt-1 font-bold text-[#294431]">
                          {t.sellerOrdersOrderAmount || "Order amount"}:{" "}
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="font-bold text-stone-900">
                      {t.sellerOrdersBuyerDetails || "Buyer Details"}
                    </h2>

                    <div className="mt-3 space-y-2 text-sm text-stone-700">
                      <p>
                        <span className="font-medium">
                          {t.sellerOrdersName || "Name"}:
                        </span>{" "}
                        {order.deliveryAddress?.name ||
                          order.buyer?.name ||
                          notAvailable}
                      </p>

                      <p>
                        <span className="font-medium">
                          {t.sellerOrdersPhone || "Phone"}:
                        </span>{" "}
                        {order.deliveryAddress?.phone || notAvailable}
                      </p>

                      <p>
                        <span className="font-medium">
                          {t.sellerOrdersEmail || "Email"}:
                        </span>{" "}
                        {order.buyer?.email || notAvailable}
                      </p>

                      <p>
                        <span className="font-medium">
                          {t.sellerOrdersAddress || "Address"}:
                        </span>{" "}
                        {[
                          order.deliveryAddress?.address,
                          order.deliveryAddress?.town,
                          order.deliveryAddress?.district,
                        ]
                          .filter(Boolean)
                          .join(", ") || notAvailable}
                      </p>
                    </div>
                  </section>
                </div>

                {order.status === "PENDING_PAYMENT" && (
                  <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                    {t.sellerOrdersPaymentWarning ||
                      "Payment is not connected yet. Do not dispatch the bird until payment has been verified through the backend."}
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
