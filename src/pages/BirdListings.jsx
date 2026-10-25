
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { translations } from "../launages";
import { getBirdListings } from "../services/birdService";

const districts = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore",
  "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
  "Kallakurichi", "Kancheepuram", "Kanniyakumari",
  "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
  "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem",
  "Sivaganga", "Tenkasi", "Thanjavur", "Theni",
  "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur",
  "Tiruvannamalai", "Tiruvarur", "Vellore",
  "Viluppuram", "Virudhunagar",
];

const categories = ["Rooster", "Hen", "Chicks"];

export default function BirdListings() {
  const language = localStorage.getItem("savel-language") || "English";
  const t = translations[language] || translations.English;

  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      setError("");

      try {
        const result = await getBirdListings({
          search,
          category,
          district,
        });

        if (!cancelled) {
          setListings(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              t.birdListingsError ||
              "Unable to load bird listings."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, [search, category, district, t.birdListingsError]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <main className="min-h-screen bg-[#faf9f5] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#55745c]">
              SAVEL SELLING
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#243328] sm:text-4xl">
              {t.birdListingsTitle || "Explore Birds"}
            </h1>
            <p className="mt-2 text-stone-600">
              {t.birdListingsSubtitle ||
                "Find birds from sellers across Tamil Nadu."}
            </p>
          </div>

          <Link
            to="/sell-bird"
            className="rounded-xl bg-[#294431] px-5 py-3 font-bold text-white transition hover:bg-[#1e3324]"
          >
            + {t.sellBirdTitle || "Sell a Bird"}
          </Link>
        </div>

        <section className="mt-8 grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-3">
          <div>
            <label
              htmlFor="bird-search"
              className="mb-2 block text-sm font-bold text-stone-700"
            >
              {t.birdSearchLabel || "Search"}
            </label>
            <input
              id="bird-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                t.birdSearchPlaceholder || "Bird name, breed, location..."
              }
              maxLength={100}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/10"
            />
          </div>

          <div>
            <label
              htmlFor="bird-category"
              className="mb-2 block text-sm font-bold text-stone-700"
            >
              {t.birdCategory || "Category"}
            </label>
            <select
              id="bird-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-[#294431]"
            >
              <option value="">
                {t.allCategories || "All categories"}
              </option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "Rooster"
                    ? t.rooster || item
                    : item === "Hen"
                      ? t.hen || item
                      : t.chicks || item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="bird-district"
              className="mb-2 block text-sm font-bold text-stone-700"
            >
              {t.district || "District"}
            </label>
            <select
              id="bird-district"
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-[#294431]"
            >
              <option value="">
                {t.allDistricts || "All districts"}
              </option>
              {districts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 md:col-span-3">
            <p className="text-sm text-stone-600" aria-live="polite">
              {loading
                ? t.loadingBirdListings || "Loading listings..."
                : `${listings.length} ${
                    t.birdListingsCountLabel || "listings found"
                  }`}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("");
                setDistrict("");
              }}
              className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-bold text-[#294431] hover:bg-stone-50"
            >
              {t.clearBirdFilters || "Clear filters"}
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-stone-500">
            {t.loadingBirdListings || "Loading listings..."}
          </div>
        ) : !error && listings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <div className="text-5xl" aria-hidden="true">
              🐓
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-[#243328]">
              {t.noBirdListings || "No birds found"}
            </h2>
            <p className="mt-2 text-stone-500">
              {t.noBirdListingsHint ||
                "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <section
            aria-label={t.birdListingsTitle || "Bird listings"}
            className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
           
{listings.map((bird) => (
  <Link
    key={bird._id}
    to={`/birds/${bird._id}`}
    className="block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#294431]"
  >

                
<div className="flex h-44 items-center justify-center overflow-hidden bg-[#f0f1e9]">
  {(() => {
    const firstPhoto = bird.photos?.[0];
    const photoUrl =
      typeof firstPhoto === "string"
        ? firstPhoto
        : firstPhoto?.url;

    return photoUrl ? (
      <img
        src={photoUrl}
        alt={bird.title || "Bird listing"}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    ) : (
      <span className="text-6xl" aria-hidden="true">
        🐓
      </span>
    );
  })()}
</div>


                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 font-extrabold text-[#243328]">
                      {bird.title}
                    </h2>
                    <span className="shrink-0 rounded-full bg-[#edf2e9] px-2 py-1 text-xs font-bold text-[#294431]">
                      {bird.category === "Rooster"
                        ? t.rooster || bird.category
                        : bird.category === "Hen"
                          ? t.hen || bird.category
                          : t.chicks || bird.category}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-stone-500">
                    {bird.breed} · {bird.age}
                  </p>

                  <p className="mt-3 text-xl font-black text-[#294431]">
                    {formatPrice(bird.price)}
                  </p>

                  <p className="mt-2 text-sm text-stone-600">
                    <span aria-hidden="true">📍 </span>
                    {bird.location}, {bird.district}
                  </p>

                  {bird.seller?.name && (
                    <p className="mt-2 text-sm text-stone-500">
                      {t.soldBy || "Seller"}: {bird.seller.name}
                    </p>
                  )}

                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-stone-600">
                    {bird.description}
                  </p>
              </div>
  </Link>
))}
          </section>
        )}

        <p className="mt-6 text-xs leading-5 text-stone-500">
          {t.birdListingsLimitNote ||
            "Up to 100 active listings are shown at a time."}
        </p>
      </div>
    </main>
  );
}
