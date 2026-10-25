
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { translations } from "../launages/index.js";
import { getBirdById } from "../services/birdService.js";

export default function BirdDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const language = localStorage.getItem("savel-language") || "English";
  const t = translations[language] || translations.English;

  const [bird, setBird] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

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
  const buyerFee = 0;
  const estimatedTotal = price + buyerFee;

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const isAvailable =
    bird && (!bird.status || bird.status === "active");

  function openGallery(index = 0) {
    if (!photos.length) return;

    setSelectedPhoto(index);
    setIsGalleryOpen(true);
  }

  function closeGallery() {
    setIsGalleryOpen(false);
  }

  function showPreviousPhoto() {
    setSelectedPhoto((current) =>
      current === 0 ? photos.length - 1 : current - 1
    );
  }

  function showNextPhoto() {
    setSelectedPhoto((current) =>
      current === photos.length - 1 ? 0 : current + 1
    );
  }

  useEffect(() => {
    if (!isGalleryOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") showPreviousPhoto();
      if (event.key === "ArrowRight") showNextPhoto();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isGalleryOpen, photos.length]);

  function handleBuyNow() {
    if (!isAvailable) return;

    navigate(`/checkout/${bird._id}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-[#294431]" />
          <p className="mt-4 text-stone-600">
            {t.loadingBirdDetails || "Loading bird details..."}
          </p>
        </div>
      </main>
    );
  }

  if (error || !bird) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-20">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl" aria-hidden="true">
            🐓
          </div>

          <h1 className="mt-4 text-2xl font-bold text-stone-900">
            {t.birdNotAvailable || "Bird not available"}
          </h1>

          <p className="mt-3 text-stone-600">
            {error ||
              t.birdListingNotFound ||
              "This listing could not be found."}
          </p>

          <Link
            to="/birds"
            className="mt-6 inline-block rounded-xl bg-[#294431] px-6 py-3 font-semibold text-white hover:bg-[#203526]"
          >
            {t.browse || "Browse Birds"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/birds"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#294431] hover:underline"
        >
          <span aria-hidden="true">←</span>
          {t.backToBirds || "Back to Birds"}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Photo gallery */}
          <section>
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-[#e9ede5]">
              {photos.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => openGallery(selectedPhoto)}
                    className="h-full w-full cursor-zoom-in"
                    aria-label={
                      t.openPhotoGallery ||
                      "Open full-screen photo gallery"
                    }
                  >
                    <img
                      src={photos[selectedPhoto]}
                      alt={`${bird.title} - Photo ${selectedPhoto + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => openGallery(selectedPhoto)}
                    aria-label={
                      t.viewPhotosFullScreen ||
                      "View photos full screen"
                    }
                    className="absolute bottom-3 right-3 rounded-xl bg-black/70 px-3 py-2 text-sm font-semibold text-white hover:bg-black/85"
                  >
                    ⛶ {t.viewPhotos || "View photos"}
                  </button>

                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousPhoto}
                        aria-label={
                          t.previousPhoto || "Previous photo"
                        }
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80"
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={showNextPhoto}
                        aria-label={t.nextPhoto || "Next photo"}
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80"
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
                    aria-label={`${t.viewPhoto || "View photo"} ${index + 1}`}
                    aria-pressed={selectedPhoto === index}
                    className={`aspect-square overflow-hidden rounded-xl border-2 ${
                      selectedPhoto === index
                        ? "border-[#294431]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${bird.title} ${index + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-3 text-sm text-stone-500">
              {photos.length > 0
                ? `${selectedPhoto + 1} ${
                    t.of || "of"
                  } ${photos.length} ${
                    t.photos || "photos"
                  } · ${t.clickToEnlarge || "Click to enlarge"}`
                : t.noPhotosAvailable || "No photos available"}
            </p>
          </section>

          {/* Bird information */}
          <section className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                {bird.category}
              </span>

              <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-700">
                {bird.breed}
              </span>

              {!isAvailable && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {t.soldUnavailable || "Sold / Unavailable"}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {bird.title}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-stone-600">
              <span aria-hidden="true">📍</span>
              {bird.location}, {bird.district}
            </p>

            {/* Price summary */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
              <p className="text-sm text-stone-500">
                {t.birdPrice || "Bird price"}
              </p>

              <p className="mt-1 text-3xl font-bold text-[#294431]">
                {formatPrice(price)}
              </p>

              <div className="my-4 border-t border-dashed border-stone-200" />

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-stone-600">
                  {t.birdPrice || "Bird price"}
                </span>
                <span className="font-medium text-stone-900">
                  {formatPrice(price)}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4 text-sm">
                <span className="text-stone-600">
                  {t.buyerPlatformFee || "Buyer platform fee"}
                </span>
                <span className="font-medium text-stone-900">
                  {formatPrice(buyerFee)}
                </span>
              </div>

              <div className="mt-4 flex justify-between gap-4 border-t border-stone-200 pt-4">
                <span className="font-bold text-stone-900">
                  {t.estimatedSubtotal || "Estimated subtotal"}
                </span>
                <span className="text-lg font-bold text-stone-900">
                  {formatPrice(estimatedTotal)}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-stone-500">
                {t.checkoutFeeNote ||
                  "Delivery charges and applicable taxes, if any, will be shown at checkout."}
              </p>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!isAvailable}
                className="mt-5 w-full rounded-xl bg-[#294431] px-6 py-4 font-bold text-white transition hover:bg-[#203526] disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {isAvailable
                  ? `${t.buyNow || "Buy Now"} →`
                  : t.currentlyUnavailable || "Currently Unavailable"}
              </button>

              <p className="mt-3 text-center text-xs text-stone-500">
                {t.orderProtectionNote ||
                  "Order tracking and payment protection depend on the checkout and payment services configured by Savel Selling."}
              </p>
            </div>

            {/* Bird information */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="text-lg font-bold text-stone-900">
                {t.birdInformation || "Bird Information"}
              </h2>

              <dl className="mt-4 divide-y divide-stone-100">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">
                    {t.birdCategory || "Category"}
                  </dt>
                  <dd className="text-right font-medium text-stone-900">
                    {bird.category}
                  </dd>
                </div>

                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">
                    {t.breed || "Breed"}
                  </dt>
                  <dd className="text-right font-medium text-stone-900">
                    {bird.breed}
                  </dd>
                </div>

                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">
                    {t.birdAge || "Age"}
                  </dt>
                  <dd className="text-right font-medium text-stone-900">
                    {bird.age}
                  </dd>
                </div>

                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">
                    {t.district || "District"}
                  </dt>
                  <dd className="text-right font-medium text-stone-900">
                    {bird.district}
                  </dd>
                </div>

                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">
                    {t.location || "Location"}
                  </dt>
                  <dd className="text-right font-medium text-stone-900">
                    {bird.location}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Description */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="text-lg font-bold text-stone-900">
                {t.birdDescription || "Description"}
              </h2>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-stone-600">
                {bird.description ||
                  t.noDescription ||
                  "No description provided."}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Full-screen photo gallery modal */}
      {isGalleryOpen && photos.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.birdPhotoGallery || "Bird photo gallery"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={closeGallery}
        >
          <button
            type="button"
            onClick={closeGallery}
            aria-label={t.closeGallery || "Close gallery"}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
          >
            ×
          </button>

          <p className="absolute left-4 top-5 text-sm text-white/80">
            {selectedPhoto + 1} / {photos.length}
          </p>

          <div
            className="flex max-h-[85vh] max-w-6xl items-center justify-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            {photos.length > 1 && (
              <button
                type="button"
                onClick={showPreviousPhoto}
                aria-label={t.previousPhoto || "Previous photo"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25"
              >
                ‹
              </button>
            )}

            <img
              src={photos[selectedPhoto]}
              alt={`${bird.title} - Photo ${selectedPhoto + 1}`}
              className="max-h-[80vh] max-w-[75vw] rounded-lg object-contain"
            />

            {photos.length > 1 && (
              <button
                type="button"
                onClick={showNextPhoto}
                aria-label={t.nextPhoto || "Next photo"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25"
              >
                ›
              </button>
            )}
          </div>

          {photos.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4">
              {photos.map((photo, index) => (
                <button
                  key={`${photo}-modal-${index}`}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedPhoto(index);
                  }}
                  aria-label={`${t.selectPhoto || "Select photo"} ${index + 1}`}
                  aria-pressed={selectedPhoto === index}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedPhoto === index
                      ? "border-white"
                      : "border-transparent opacity-60"
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
        </div>
      )}
    </main>
  );
}
