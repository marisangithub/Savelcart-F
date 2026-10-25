
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { translations } from "../launages/index.js";
import { getBirdById } from "../services/birdService";

const API_URL = "https://savelcart-backend.onrender.com/api";

const TAMIL_NADU_DISTRICTS = [
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
];

export default function BirdDetailsV2() {
  const { id } = useParams();

  const language =
    localStorage.getItem("savel-language") || "English";

  const t = translations[language] || translations.English;

  const [bird, setBird] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [buyer, setBuyer] = useState({
    name: "",
    phone: "",
    district: "",
    address: "",
  });

  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBird() {
      try {
        setLoading(true);
        setError("");

        const data = await getBirdById(id);

        if (!cancelled) {
          setBird(data);
          setSelectedPhoto(0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              t.birdDetailsLoadError ||
              "Unable to load bird details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBird();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const photos = (bird?.photos || [])
    .map((photo) =>
      typeof photo === "string" ? photo : photo?.url
    )
    .filter(Boolean);

  const price = Number(bird?.price) || 0;

  const isAvailable =
    Boolean(bird) &&
    (!bird.status || bird.status === "active");

  // Contact number is stored in Bird.contact in your backend.
  const sellerPhone = String(
    bird?.contact ||
      bird?.contactNumber ||
      bird?.seller?.contact ||
      bird?.seller?.phone ||
      ""
  ).trim();

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  function updateBuyer(event) {
    const { name, value } = event.target;

    setBuyer((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function showPreviousPhoto() {
    if (photos.length < 2) return;

    setSelectedPhoto((current) =>
      current <= 0 ? photos.length - 1 : current - 1
    );
  }

  function showNextPhoto() {
    if (photos.length < 2) return;

    setSelectedPhoto((current) =>
      current >= photos.length - 1 ? 0 : current + 1
    );
  }

  function handleTouchStart(event) {
    setTouchStartX(event.touches[0].clientX);
  }

  function handleTouchEnd(event) {
    if (touchStartX === null) return;

    const difference =
      event.changedTouches[0].clientX - touchStartX;

    if (difference > 50) {
      showPreviousPhoto();
    } else if (difference < -50) {
      showNextPhoto();
    }

    setTouchStartX(null);
  }

  useEffect(() => {
    if (!isImageViewerOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsImageViewerOpen(false);
      }

      if (event.key === "ArrowLeft") {
        showPreviousPhoto();
      }

      if (event.key === "ArrowRight") {
        showNextPhoto();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageViewerOpen, photos.length]);

  function openWhatsApp() {
    if (!sellerPhone) return;

    const phone = sellerPhone.replace(/\D/g, "");
    const internationalPhone =
      phone.length === 10 ? `91${phone}` : phone;

    window.open(
      `https://wa.me/${internationalPhone}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function callSeller() {
    if (!sellerPhone) return;

    window.location.href = `tel:${sellerPhone}`;
  }

  async function handleConfirmOrder(event) {
    event.preventDefault();

    if (!isAvailable || submitting) return;

    if (!sellerPhone) {
      setError(
        t.birdV2SellerContactMissing ||
          "Seller contact information is not available."
      );
      return;
    }

    if (!buyer.district) {
      setError(
        t.birdV2SelectDistrictError ||
          "Please select your delivery district."
      );
      return;
    }

    const cleanPhone = buyer.phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      setError(
        t.birdV2InvalidPhone ||
          "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birdId: bird._id,
          buyer: {
            name: buyer.name.trim(),
            phone: buyer.phone.trim(),
            district: buyer.district,
            town: buyer.town?.trim() || "",
            address: buyer.address.trim(),
          },
          paymentMethod: "direct_to_seller",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            t.birdV2OrderFailed ||
            "Unable to confirm your order."
        );
      }

      setSuccess(
        result.message ||
          t.birdV2OrderSuccess ||
          "Your order has been submitted successfully."
      );

      setBuyer({
        name: "",
        phone: "",
        district: "",
        town: "",
        address: "",
      });
    } catch (err) {
      setError(
        err.message ||
          t.birdV2OrderFailed ||
          "Unable to confirm your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <p className="text-stone-600">
          {t.loadingBirdDetails || "Loading bird details..."}
        </p>
      </main>
    );
  }

  if (error && !bird) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-20">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-stone-900">
            {t.birdNotAvailable || "Bird not available"}
          </h1>

          <p className="mt-3 text-stone-600">{error}</p>

          <Link
            to="/birds"
            className="mt-6 inline-block rounded-xl bg-[#294431] px-6 py-3 font-semibold text-white"
          >
            {t.browse || "Browse Birds"}
          </Link>
        </div>
      </main>
    );
  }

  if (!bird) return null;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/birds"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#294431] hover:underline"
        >
          ← {t.backToBirds || "Back to Birds"}
        </Link>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* Bird photo gallery */}
          <section className="min-w-0">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-[#e9ede5]">
              {photos.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsImageViewerOpen(true)}
                    className="h-full w-full cursor-zoom-in"
                    aria-label={t.birdV2ViewPhoto || "View photo"}
                  >
                    <img
                      src={photos[selectedPhoto]}
                      alt={bird.title || "Bird"}
                      className="h-full w-full object-cover"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsImageViewerOpen(true)}
                    className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-2 text-sm font-medium text-white"
                  >
                    ⛶ {t.birdV2ViewPhoto || "View photo"}
                  </button>

                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousPhoto}
                        aria-label={t.previous || "Previous photo"}
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white hover:bg-black/75"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={showNextPhoto}
                        aria-label={t.next || "Next photo"}
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white hover:bg-black/75"
                      >
                        ›
                      </button>
                    </>
                  )}
                </>
              ) : (
                <span className="text-8xl" aria-hidden="true">
                  🐓
                </span>
              )}
            </div>

            {photos.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() => setSelectedPhoto(index)}
                    aria-label={`${t.birdV2ViewPhoto || "View photo"} ${index + 1}`}
                    aria-pressed={selectedPhoto === index}
                    className={`aspect-square overflow-hidden rounded-xl border-2 ${
                      selectedPhoto === index
                        ? "border-[#294431]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={photo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {photos.length > 1 && (
              <p className="mt-2 text-center text-sm text-stone-500">
                {selectedPhoto + 1} / {photos.length}
              </p>
            )}
          </section>

          {/* Bird details and order form */}
          <section className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                {bird.category}
              </span>

              <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-700">
                {bird.breed}
              </span>
            </div>

            <h1 className="mt-4 break-words text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {bird.title}
            </h1>

            <p className="mt-3 text-stone-600">
              📍 {bird.location}
              {bird.district ? `, ${bird.district}` : ""}
            </p>

            {/* Price, information and description in one card */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-sm text-stone-500">
                {t.birdPrice || "Bird price"}
              </p>

              <p className="mt-1 text-3xl font-bold text-[#294431]">
                {formatPrice(price)}
              </p>

              <div className="my-5 border-t border-stone-200" />

              <h2 className="text-lg font-bold text-stone-900">
                {t.birdInformation || "Bird Information"}
              </h2>

              <dl className="mt-3 divide-y divide-stone-100">
                {[
                  [t.birdCategory || "Category", bird.category],
                  [t.breed || "Breed", bird.breed],
                  [t.birdAge || "Age", bird.age],
                  [t.district || "District", bird.district],
                  [t.location || "Location", bird.location],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 py-3"
                  >
                    <dt className="text-stone-500">{label}</dt>
                    <dd className="max-w-[60%] break-words text-right font-medium text-stone-900">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="my-4 border-t border-stone-200" />

              <h2 className="text-lg font-bold text-stone-900">
                {t.birdDescription || "Description"}
              </h2>

              <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-stone-600">
                {bird.description ||
                  t.noDescription ||
                  "No description provided."}
              </p>
            </div>

            {/* Seller contact */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="text-lg font-bold text-stone-900">
                {t.birdV2SellerContact || "Contact Seller"}
              </h2>

              {sellerPhone ? (
                <>
                  <p className="mt-2 text-stone-600">
                    {sellerPhone}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={callSeller}
                      className="rounded-xl border border-[#294431] px-4 py-3 font-semibold text-[#294431] hover:bg-green-50"
                    >
                      ☎ {t.birdV2CallSeller || "Call Seller"}
                    </button>

                    <button
                      type="button"
                      onClick={openWhatsApp}
                      className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                    >
                      {t.birdV2WhatsApp || "WhatsApp"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-amber-700">
                  {t.birdV2SellerContactMissing ||
                    "Seller contact information is not available."}
                </p>
              )}
            </div>

            {/* Buyer order form */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
              <h2 className="text-xl font-bold text-stone-900">
                {t.birdV2ConfirmOrderTitle || "Confirm Your Order"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-600">
                {t.birdV2OrderDescription ||
                  "Enter your contact details so the seller can contact you about your order."}
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800"
                >
                  {success}
                </div>
              )}

              <form
                onSubmit={handleConfirmOrder}
                className="mt-5 space-y-4"
              >
                <div>
                  <label
                    htmlFor="buyer-name"
                    className="mb-1 block text-sm font-semibold text-stone-700"
                  >
                    {t.birdV2BuyerName || "Your name"}
                  </label>

                  <input
                    id="buyer-name"
                    name="name"
                    value={buyer.name}
                    onChange={updateBuyer}
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder={
                      t.birdV2NamePlaceholder ||
                      "Enter your full name"
                    }
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="buyer-phone"
                    className="mb-1 block text-sm font-semibold text-stone-700"
                  >
                    {t.birdV2BuyerPhone || "Mobile number"}
                  </label>

                  <input
                    id="buyer-phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={buyer.phone}
                    onChange={updateBuyer}
                    required
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    autoComplete="tel"
                    placeholder={
                      t.birdV2PhonePlaceholder ||
                      "Enter your 10-digit mobile number"
                    }
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="buyer-district"
                    className="mb-1 block text-sm font-semibold text-stone-700"
                  >
                    {t.birdV2BuyerDistrict || "Delivery district"}
                  </label>

                  <select
                    id="buyer-district"
                    name="district"
                    value={buyer.district}
                    onChange={updateBuyer}
                    required
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">
                      {t.birdV2SelectDistrict || "Select district"}
                    </option>

                    {TAMIL_NADU_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
  <label
    htmlFor="buyer-town"
    className="mb-1 block text-sm font-semibold text-stone-700"
  >
    {t.birdV2Town || "Town / Village"}
  </label>

  <input
    id="buyer-town"
    name="town"
    value={buyer.town}
    onChange={updateBuyer}
    required
    maxLength={100}
    placeholder={
      t.birdV2TownPlaceholder || "Enter your town or village"
    }
    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-green-100"
  />
</div>

                <div>
                  <label
                    htmlFor="buyer-address"
                    className="mb-1 block text-sm font-semibold text-stone-700"
                  >
                    {t.birdV2DeliveryAddress || "Delivery address"}
                  </label>

                  <textarea
                    id="buyer-address"
                    name="address"
                    value={buyer.address}
                    onChange={updateBuyer}
                    required
                    maxLength={500}
                    rows={3}
                    autoComplete="street-address"
                    placeholder={
                      t.birdV2AddressPlaceholder ||
                      "House number, street, area and landmark"
                    }
                    className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  {t.birdV2DirectPaymentNotice ||
                    "Payment is arranged directly between you and the seller. Savel Selling does not verify direct payments."}
                </div>

                <button
                  type="submit"
                  disabled={!isAvailable || submitting || !sellerPhone}
                  className="w-full rounded-xl bg-[#294431] px-6 py-4 font-bold text-white transition hover:bg-[#203526] disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {submitting
                    ? t.birdV2Submitting || "Submitting..."
                    : isAvailable
                      ? t.birdV2ConfirmOrder || "Confirm Order"
                      : t.currentlyUnavailable || "Currently Unavailable"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      {/* Full-screen image viewer */}
      {isImageViewerOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsImageViewerOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label={t.birdV2ViewPhoto || "Bird photo viewer"}
        >
          <button
            type="button"
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25"
            aria-label={t.close || "Close"}
          >
            ×
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousPhoto();
              }}
              className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-4xl text-white hover:bg-white/25 sm:left-6"
              aria-label={t.previous || "Previous photo"}
            >
              ‹
            </button>
          )}

          <img
            src={photos[selectedPhoto]}
            alt={`${bird.title || "Bird"} ${selectedPhoto + 1}`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85vh] max-w-[85vw] select-none object-contain"
            draggable={false}
          />

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextPhoto();
              }}
              className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-4xl text-white hover:bg-white/25 sm:right-6"
              aria-label={t.next || "Next photo"}
            >
              ›
            </button>
          )}

          <div className="absolute bottom-5 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
            {selectedPhoto + 1} / {photos.length}
          </div>
        </div>
      )}
    </main>
  );
}
