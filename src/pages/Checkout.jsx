
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBirdById } from "../services/birdService";
import { createOrder } from "../services/orderService";

const BUYER_FEE = 0;

const initialForm = {
  name: "",
  phone: "",
  district: "",
  town: "",
  address: "",
};

export default function Checkout() { 
  const { id } = useParams();

  const [bird, setBird] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [deliveryMethod, setDeliveryMethod] = useState("COURIER");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBird() {
      try {
        setLoading(true);
        setError("");

        const data = await getBirdById(id);

        if (!cancelled) {
          setBird(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load bird details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadBird();
    } else {
      setError("Bird listing ID is missing.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setNotice("");
    setError("");
  };

  const birdPrice = Number(bird?.price || 0);
  const total = birdPrice + BUYER_FEE;

  const firstPhoto = bird?.photos?.[0];

  const photoUrl =
    typeof firstPhoto === "string"
      ? firstPhoto
      : firstPhoto?.url;

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setNotice("");
  setCreatedOrder(null);

  if (!form.name.trim()) {
    setError("Please enter your full name.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
    setError("Enter a valid 10-digit Indian mobile number.");
    return;
  }

  if (!form.district) {
    setError("Please select your district.");
    return;
  }

  if (!form.town.trim()) {
    setError("Please enter your town or village.");
    return;
  }

  if (!form.address.trim()) {
    setError("Please enter your delivery address.");
    return;
  }

  try {
    setSubmitting(true);

    const data = await createOrder({
      birdId: id,
      deliveryMethod,
      buyer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        district: form.district,
        town: form.town.trim(),
        address: form.address.trim(),
      },
    });

    setCreatedOrder(data.order);

    setNotice(
      "Order created successfully! Payment gateway is not connected yet. Your order is NOT paid or confirmed."
    );
  } catch (err) {
    setError(err.message || "Unable to create your order.");
  } finally {
    setSubmitting(false);
  }
};
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
        <p className="text-stone-600">Loading checkout...</p>
      </main>
    );
  }

  if (error && !bird) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 p-6">
        <p className="text-red-600">{error}</p>
        <Link
          to="/birds"
          className="rounded-xl bg-[#294431] px-5 py-3 font-semibold text-white"
        >
          Browse Birds
        </Link>
      </main>
    );
  }

  if (!bird) {
    return null;
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to={`/birds/${bird._id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#294431] hover:underline"
        >
          ← Back to Bird Details
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Checkout
          </h1>
          <p className="mt-2 text-stone-600">
            Enter your details to continue with your bird order.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Buyer Details */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">
            <h2 className="text-xl font-bold text-stone-900">
              Buyer Details
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Enter the details where the bird should be delivered.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <fieldset className="space-y-3 rounded-xl border border-stone-200 p-4">
                <legend className="px-1 text-sm font-semibold text-stone-700">Delivery method *</legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3">
                  <input type="radio" name="deliveryMethod" value="COURIER" checked={deliveryMethod === "COURIER"} onChange={() => setDeliveryMethod("COURIER")} className="mt-1 accent-[#294431]" />
                  <span><span className="block font-medium text-stone-800">Courier delivery</span><span className="mt-1 block text-sm text-stone-500">Seller dispatches the order. You mark it delivered after receiving the bird.</span></span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 p-3">
                  <input type="radio" name="deliveryMethod" value="PICKUP" checked={deliveryMethod === "PICKUP"} onChange={() => setDeliveryMethod("PICKUP")} className="mt-1 accent-[#294431]" />
                  <span><span className="block font-medium text-stone-800">Direct pickup</span><span className="mt-1 block text-sm text-stone-500">You collect the bird from the seller. The seller marks it delivered at handover.</span></span>
                </label>
              </fieldset>
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Full Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={updateField}
                  maxLength={100}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/15"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Mobile Number *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={form.phone}
                  onChange={updateField}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/15"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="district"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    District *
                  </label>

                  <select
                    id="district"
                    name="district"
                    value={form.district}
                    onChange={updateField}
                    required
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/15"
                  >
                    <option value="">Select district</option>
                    {[
                      "Ariyalur",
                      "Chengalpattu",
                      "Chennai",
                      "Coimbatore",
                      "Cuddalore",
                      "Dharmapuri",
                      "Dindigul",
                      "Erode",
                      "Kallakurichi",
                      "Kancheepuram",
                      "Kanniyakumari",
                      "Karur",
                      "Krishnagiri",
                      "Madurai",
                      "Mayiladuthurai",
                      "Nagapattinam",
                      "Namakkal",
                      "Nilgiris",
                      "Perambalur",
                      "Pudukkottai",
                      "Ramanathapuram",
                      "Ranipet",
                      "Salem",
                      "Sivaganga",
                      "Tenkasi",
                      "Thanjavur",
                      "Theni",
                      "Thoothukudi",
                      "Tiruchirappalli",
                      "Tirunelveli",
                      "Tirupathur",
                      "Tiruppur",
                      "Tiruvallur",
                      "Tiruvannamalai",
                      "Tiruvarur",
                      "Vellore",
                      "Viluppuram",
                      "Virudhunagar",
                    ].map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="town"
                    className="mb-2 block text-sm font-medium text-stone-700"
                  >
                    Town / Village *
                  </label>

                  <input
                    id="town"
                    name="town"
                    type="text"
                    autoComplete="address-level2"
                    value={form.town}
                    onChange={updateField}
                    maxLength={100}
                    placeholder="Enter your town or village"
                    required
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/15"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  Full Delivery Address *
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  rows={3}
                  maxLength={500}
                  autoComplete="street-address"
                  placeholder="House number, street, area and nearby landmark"
                  required
                  className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/15"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {notice && (
                <div
                  role="status"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"
                >
                  {notice}
                </div>
              )}

              {createdOrder && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <h3 className="font-bold text-green-800">
                    Order Created Successfully!
                  </h3>

                  <p className="mt-2 text-sm text-green-700">
                    Order Number:{" "}
                    <span className="font-bold">
                      {createdOrder.orderNumber}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Amount: {formatPrice(createdOrder.totalAmount)}
                  </p>

                  <p className="mt-2 text-sm text-green-700">
                    Payment is not connected yet. This order is not paid or confirmed.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#294431] px-5 py-4 font-semibold text-white transition hover:bg-[#1e3325] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Please wait..."
                  : "Continue to Payment"}
              </button>

              <p className="text-xs leading-5 text-stone-500">
                Payment has not been connected yet. Your order will
                only be confirmed after the server verifies payment.
              </p>
            </form>
          </section>

          {/* Order Summary */}
          <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-stone-900">
              Order Summary
            </h2>

            <div className="mt-5 flex gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={bird.title || "Bird listing"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">
                    🐓
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="break-words font-semibold text-stone-900">
                  {bird.title}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {bird.category} · {bird.breed}
                </p>
                <p className="mt-2 font-bold text-[#294431]">
                  {formatPrice(birdPrice)}
                </p>
              </div>
            </div>

            <div className="my-5 border-t border-stone-200" />

            <div className="space-y-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-stone-600">Bird price</span>
                <span className="font-medium text-stone-900">
                  {formatPrice(birdPrice)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-stone-600">
                  Buyer service fee
                </span>
                <span className="font-medium text-stone-900">
                  {formatPrice(BUYER_FEE)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-stone-600">
                  Delivery charges
                </span>
                <span className="text-right text-stone-500">
                  Confirm before payment
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-stone-200" />

            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-stone-900">
                Subtotal
              </span>
              <span className="text-2xl font-bold text-[#294431]">
                {formatPrice(total)}
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-stone-500">
              Final payable amount may change if delivery charges
              or applicable taxes are added before payment.
            </p>

            <div className="mt-5 rounded-xl bg-stone-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">
                  🛡️
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-800">
                    Savel Selling Order Protection
                  </p>
                  <p className="mt-1 text-xs leading-5 text-stone-600">
                    Track your order and report an issue if the
                    bird is not received as agreed. Protection and
                    refund terms will be shown before payment.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
