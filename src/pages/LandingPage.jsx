
import { useEffect, useState } from "react";
import { translations } from "../launages/index.js";
import { Link } from "react-router-dom";
import {
  getCurrentUser,
  logoutUser,
} from "../services/authService";
import { useNavigate } from "react-router-dom";
import { getBirdListings } from "../services/birdService";


const districts = [
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


const categories = [
  { key: "rooster", emoji: "🐓", color: "bg-orange-50" },
  { key: "hen", emoji: "🐔", color: "bg-rose-50" },
  { key: "chicks", emoji: "🐣", color: "bg-amber-50" },
];

export default function LandingPage() {

  
  const [language, setLanguage] = useState("English");
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
const [profileOpen, setProfileOpen] = useState(false);
const [authLoading, setAuthLoading] = useState(true);
const [authError, setAuthError] = useState("");
const [latestListings, setLatestListings] = useState([]);
const [listingsLoading, setListingsLoading] = useState(true);
const [listingsError, setListingsError] = useState("");
const navigate = useNavigate();


useEffect(() => {
  let active = true;

  async function checkLogin() {
    try {
      const response = await getCurrentUser();

      // API direct user object return pannalum,
      // { user: ... } format-la return pannalum handle pannum.
      const currentUser =
        response?.user ??
        response?.data?.user ??
        response?.data ??
        response;

      if (active) {
        setUser(
          currentUser && (currentUser.name || currentUser.email)
            ? currentUser
            : null
        );
      }
    } catch (error) {
      if (active) {
        setUser(null);
      }
    } finally {
      if (active) {
        setAuthLoading(false);
      }
    }
  }

  checkLogin();

  return () => {
    active = false;
  };
}, []);


  useEffect(() => {
    const saved = localStorage.getItem("savel-language");

    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savel-language", language);
  }, [language]);

  const t = translations[language] || translations.English;

  // Load the latest active listings from the same API used by Browse Birds.
  useEffect(() => {
    let active = true;

    async function loadLatestListings() {
      setListingsLoading(true);
      setListingsError("");

      try {
        const listings = await getBirdListings();
        if (active) {
          // The API already sorts newest first. Show a small home-page preview.
          setLatestListings(Array.isArray(listings) ? listings.slice(0, 4) : []);
        }
      } catch (error) {
        if (active) {
          setListingsError(
            error.message || "Unable to load latest bird listings."
          );
          setLatestListings([]);
        }
      } finally {
        if (active) setListingsLoading(false);
      }
    }

    loadLatestListings();
    return () => {
      active = false;
    };
  }, []);

  function openBirdSearch(overrides = {}) {
    const params = new URLSearchParams();
    const searchValue = overrides.search ?? search;

    if (searchValue.trim()) params.set("search", searchValue.trim());
    if (overrides.category) params.set("category", overrides.category);
    if (overrides.district) params.set("district", overrides.district);

    const query = params.toString();
    navigate(query ? `/birds?${query}` : "/birds");
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);
  }

  function getPhotoUrl(bird) {
    const photo = bird?.photos?.[0];
    return typeof photo === "string" ? photo : photo?.url;
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#243328]">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">

          {/* Top navbar row */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">

            {/* Logo */}
            <a
              href="#home"
              className="flex shrink-0 items-center gap-2"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#294431] text-2xl">
                🐓
              </span>

              <span className="whitespace-nowrap text-xl font-black tracking-tight">
                Savel <span className="text-[#b85e38]">Selling</span>
              </span>
            </a>

            {/* Desktop navigation links */}
            <nav className="hidden flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium lg:flex">
              <a
                href="#home"
                className="whitespace-nowrap transition hover:text-[#b85e38]"
              >
                {t.home}
              </a>

              <a
                href="#categories"
                className="whitespace-nowrap transition hover:text-[#b85e38]"
              >
                {t.popular}
              </a>

              <a
                href="#listings"
                className="whitespace-nowrap transition hover:text-[#b85e38]"
              >
                {t.browse}
              </a>
            </nav>

            {/* Language and action buttons */}
            <div className="flex min-w-0 flex-wrap items-center gap-2">

              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value);
                  setMenuOpen(false);
                }}
                aria-label="Choose language"
                className="min-w-0 max-w-32 rounded-lg border border-stone-300 bg-white px-2 py-2.5 text-sm outline-none focus:border-[#294431] sm:max-w-none sm:px-3"
              >
                <option value="English">English</option>
                <option value="Tamil">தமிழ்</option>
                <option value="Thanglish">Thanglish</option>
              </select>
              {/* Orders Cart Button */}
<Link
  to="/orders"
  aria-label="My Orders"
  title="My Orders"
  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-xl transition hover:border-[#294431] hover:bg-[#edf1e8]"
>
  🛒
</Link>

         
{/* User profile or Login/Register buttons */}
{authLoading ? (
  <div
    className="h-10 w-10 rounded-full bg-stone-100 animate-pulse"
    aria-label="Checking login"
  />
) : user ? (
  <div className="relative">
    <button
      type="button"
      onClick={() => {
        setProfileOpen((previous) => !previous);
        setAuthError("");
      }}
      aria-label="Open user profile menu"
      aria-expanded={profileOpen}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#294431] text-lg font-black uppercase text-white shadow-sm transition hover:bg-[#1e3324] focus:outline-none focus:ring-2 focus:ring-[#b85e38] focus:ring-offset-2"
    >
      {(
  user?.name?.trim() ||
  user?.email?.trim()?.charAt(0) ||
  "U"
)
  .charAt(0)
  .toUpperCase()}
    </button>

    {profileOpen && (
      <div className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
        <div className="border-b border-stone-100 px-3 py-3">
          <p className="truncate font-bold text-[#243328]">
  {user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "User"}
</p>
          <p className="mt-1 truncate text-xs text-stone-500">
            {user.email || ""}
          </p>
        </div>

        <Link
          to="/profile"
          onClick={() => setProfileOpen(false)}
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-stone-700 transition hover:bg-[#edf1e8] hover:text-[#294431]"
        >
          <span>👤</span>
         { t.profileTitle }
        </Link>

        <button
          type="button"
          onClick={async () => {
            setAuthError("");

            try {
              await logoutUser();
              setUser(null);
              setProfileOpen(false);
            } catch (error) {
              setAuthError(
                error.message || "Logout failed. Please try again."
              );
            }
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <span>↪</span>
          {t.logout}
        </button>

        {authError && (
          <p role="alert" className="px-3 py-2 text-xs text-red-600">
            {authError}
          </p>
        )}
      </div>
    )}
  </div>
) : (
  <>
    <Link
      to="/login"
      className="whitespace-nowrap rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-semibold transition hover:border-[#294431] hover:bg-[#edf1e8] sm:px-4"
    >
      {t.login}
    </Link>

    <Link
      to="/register"
      className="whitespace-nowrap rounded-lg bg-amber-400 px-3 py-2.5 text-sm font-bold text-stone-950 transition hover:bg-amber-500 sm:px-4"
    >
      {t.register}
    </Link>
  </>
)}


              <button
                type="button"
                onClick={() => navigate("/sell-bird")}
                className="whitespace-nowrap rounded-lg bg-[#294431] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#1e3324] sm:px-4"
              >
                + {t.sell}
              </button>
            </div>
          </div>

          {/* Secondary navigation for tablet and mobile */}
          <div className="mt-3 border-t border-stone-100 pt-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold hover:bg-[#edf1e8]"
            >
              {menuOpen ? "✕ Close menu" : "☰ Menu"}
            </button>

            {menuOpen && (
              <nav className="mt-3 flex flex-col gap-1 rounded-xl bg-[#faf9f5] p-2">
                <a
                  href="#home"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-[#edf1e8]"
                >
                  {t.home}
                </a>

                <a
                  href="#categories"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-[#edf1e8]"
                >
                  {t.popular}
                </a>

                <a
                  href="#listings"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-[#edf1e8]"
                >
                  {t.browse}
                </a>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section id="home" className="overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-20 lg:px-8">
            <div>
              <span className="inline-flex rounded-full border border-[#d8dfd0] bg-[#edf1e8] px-4 py-2 text-xs font-bold tracking-wider text-[#38583d]">
                ✦ {t.heroLabel}
              </span>

              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {t.heroTitle}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
                {t.heroDescription}
              </p>

              <form
                className="mt-8 flex max-w-xl flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-lg shadow-stone-200/40 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  document.getElementById("listings")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="min-w-0 flex-1 rounded-xl px-3 py-3 outline-none placeholder:text-stone-400"
                />

                <Link
  to="/birds"
  className="inline-flex items-center whitespace-nowrap rounded-xl bg-[#b85e38] px-6 py-3 font-bold text-white transition hover:bg-[#994727]"
>
  {t.explore} →
</Link>
              </form>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
                <span>✓ {t.trust}</span>
                <span>✓ {t.connect}</span>
              </div>
            </div>

            {/* Native breed image showcase */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-[#e8e9d9] blur-2xl" />

              <img
                src="https://live.staticflickr.com/7384/12025765045_508ae22568_b.jpg"
                alt="Native Aseel rooster and hen in Tamil Nadu"
                className="relative h-[350px] w-full rounded-[2rem] object-cover shadow-xl sm:h-[460px]"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src =
                    "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1100&q=85";
                }}
              />

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/50 bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-7 sm:left-7 sm:right-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {t.local}
                </p>

                <p className="mt-1 text-lg font-extrabold">
                  {t.heroCardTitle}
                </p>

                <p className="mt-1 text-sm text-stone-600">
                  {t.heroCardDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bird categories */}
        <section
          id="categories"
          className="mx-auto max-w-7xl px-5 py-14 lg:px-8"
        >
          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-widest text-[#b85e38]">
              EXPLORE
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {t.popular}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => {
                  const categoryValue =
                    category.key === "rooster"
                      ? "Rooster"
                      : category.key === "hen"
                        ? "Hen"
                        : "Chicks";
                  openBirdSearch({ category: categoryValue, search: "" });
                }}
                className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#b8c6b1] hover:shadow-lg"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${category.color} text-3xl`}
                >
                  {category.emoji}
                </span>

                <span className="min-w-0 font-bold">
                  {t[category.key]}
                </span>

                <span className="ml-auto text-xl text-stone-400 transition group-hover:text-[#b85e38]">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Latest active listings loaded from the backend */}
        <section id="listings" className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#b85e38]">
                  JUST ARRIVED
                </p>
                <h2 className="mt-2 text-3xl font-black">{t.latest}</h2>
              </div>

              <button
                type="button"
                onClick={() => openBirdSearch({ search: "" })}
                className="text-sm font-semibold text-[#294431] hover:underline"
              >
                {t.viewAll} →
              </button>
            </div>

            {listingsLoading ? (
              <div className="mt-8 rounded-2xl border border-stone-200 bg-[#faf9f5] px-5 py-12 text-center text-stone-500" role="status">
                {t.loadingBirdListings || "Loading latest listings..."}
              </div>
            ) : listingsError ? (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center text-red-700" role="alert">
                <p className="font-semibold">
                  {t.birdListingsError || "Unable to load bird listings."}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-red-100"
                >
                  {t.tryAgain || "Try again"}
                </button>
              </div>
            ) : latestListings.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-[#faf9f5] px-5 py-12 text-center">
                <span className="text-4xl" aria-hidden="true">🐓</span>
                <p className="mt-3 font-semibold">
                  {t.empty || "Bird listings will appear here soon."}
                </p>
                <button
                  type="button"
                  onClick={() => openBirdSearch({ search: "" })}
                  className="mt-2 text-sm text-stone-500 underline underline-offset-4 hover:text-[#294431]"
                >
                  {t.browse || "Browse Birds"}
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {latestListings.map((bird) => {
                  const photoUrl = getPhotoUrl(bird);

                  return (
                    <Link
                      key={bird._id}
                      to={`/birds/${bird._id}`}
                      className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#294431]"
                    >
                      <div className="flex h-44 items-center justify-center overflow-hidden bg-[#f0f1e9]">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={bird.title || "Bird listing"}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-6xl" aria-hidden="true">🐓</span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 font-extrabold text-[#243328]">
                            {bird.title || "Bird"}
                          </h3>
                          <span className="shrink-0 rounded-full bg-[#edf2e9] px-2 py-1 text-xs font-bold text-[#294431]">
                            {bird.category === "Rooster"
                              ? t.rooster || bird.category
                              : bird.category === "Hen"
                                ? t.hen || bird.category
                                : t.chicks || bird.category}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-stone-500">
                          {bird.breed || ""}{bird.age ? ` · ${bird.age}` : ""}
                        </p>
                        <p className="mt-3 text-xl font-black text-[#294431]">
                          {formatPrice(bird.price)}
                        </p>
                        <p className="mt-2 truncate text-sm text-stone-600">
                          <span aria-hidden="true">📍 </span>
                          {[bird.location, bird.district].filter(Boolean).join(", ")}
                        </p>
                        {bird.seller?.name && (
                          <p className="mt-2 text-sm text-stone-500">
                            {t.soldBy || "Seller"}: {bird.seller.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>


{/* Browse by District */}
<section
  id="districts"
  className="mx-auto max-w-7xl px-5 py-14 lg:px-8"
>
  <div className="mb-7">
    <p className="text-sm font-bold uppercase tracking-widest text-[#b85e38]">
      EXPLORE TAMIL NADU
    </p>

    <h2 className="mt-2 text-3xl font-black">
      {t.districts || "Browse by District"}
    </h2>

    <p className="mt-2 text-sm text-stone-500">
      Explore native birds available in your district.
    </p>
  </div>

  <div className="flex flex-wrap gap-3">
    {districts.map((district) => (
      <button
        key={district}
        type="button"
        onClick={() => openBirdSearch({ district, search: "" })}
        className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[#294431] hover:bg-[#edf1e8] hover:shadow-sm"
      >
        📍 {district}
      </button>
    ))}
  </div>
</section>


        {/* Footer */}
        <footer className="bg-[#203729] px-5 py-10 text-white">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row">
            <div>
              <p className="text-xl font-black">
                Savel Selling 🐓
              </p>

              <p className="mt-2 text-sm text-white/70">
                {t.heroDescription}
              </p>
            </div>

            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} Savel Selling
            </p>
          </div>
        </footer>
      </main>

      {/* Floating Sell button */}
      <button
        type="button"
        onClick={() => navigate("/sell-bird")}
        className="fixed bottom-5 right-5 z-30 rounded-full bg-[#b85e38] px-6 py-4 font-bold text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#994727]"
      >
        + {t.sell}
      </button>
    </div>
  );
}
