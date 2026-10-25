
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  updateMyProfile,
  logoutUser,
} from "../services/authService";
import { getMyListings } from "../services/myListingsService";
import { translations } from "../launages";

export default function MyProfile() {
  const language = localStorage.getItem("savel-language") || "English";
  const t = translations[language] || translations.English;
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [listingsError, setListingsError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await getCurrentUser();

        const currentUser =
          response?.user ??
          response?.data?.user ??
          response?.data ??
          response;

        if (!currentUser || !(currentUser.name || currentUser.email)) {
          throw new Error("Unable to load your account details.");
        }

        if (active) {
          setUser(currentUser);
          setName(currentUser.name || "");
        }
      } catch {
        if (active) {
          navigate("/login", {
            replace: true,
            state: {
              message:
                t.profileLoginRequired ||
                "Please log in to view your profile.",
            },
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    async function loadListings() {
      try {
        const myListings = await getMyListings();

        if (active) setListings(myListings);
      } catch (err) {
        if (active) {
          setListingsError(
            err.message || "Unable to load your bird listings."
          );
        }
      } finally {
        if (active) setListingsLoading(false);
      }
    }

    loadProfile();
    loadListings();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanedName = name.trim();

    if (cleanedName.length < 2 || cleanedName.length > 80) {
      setError(
        t.nameValidation ||
          "Name must be between 2 and 80 characters."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await updateMyProfile({
        name: cleanedName,
      });

      const updatedUser =
        response?.user ??
        response?.data?.user ??
        response?.data ??
        response;

      setUser((previous) => ({
        ...previous,
        ...updatedUser,
        name: updatedUser.name || cleanedName,
      }));

      setName(updatedUser.name || cleanedName);
      setEditing(false);
      setSuccess(t.profileUpdated || "Profile updated successfully.");
    } catch (err) {
      setError(
        err.message ||
          t.profileUpdateError ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setError("");
    setLoggingOut(true);

    try {
      await logoutUser();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || t.logoutError || "Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  }

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const getStatus = (status) => {
    const normalized = String(status || "active").toLowerCase();

    if (normalized === "sold") {
      return {
        label: "Sold",
        className: "bg-blue-50 text-blue-700",
      };
    }

    if (normalized === "reserved") {
      return {
        label: "Reserved",
        className: "bg-amber-50 text-amber-800",
      };
    }

    if (normalized === "archived") {
      return {
        label: "Archived",
        className: "bg-stone-100 text-stone-600",
      };
    }

    if (normalized === "pending") {
      return {
        label: "Pending",
        className: "bg-orange-50 text-orange-700",
      };
    }

    return {
      label: "Active",
      className: "bg-green-50 text-green-700",
    };
  };

  const totalListings = listings.length;
  const activeListings = listings.filter(
    (bird) => bird.status === "active" || !bird.status
  ).length;
  const soldListings = listings.filter(
    (bird) => bird.status === "sold"
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f5] px-4">
        <p className="font-semibold text-[#294431]">
          {t.loadingProfile || "Loading profile..."}
        </p>
      </main>
    );
  }

  if (!user) return null;

  const initial = (
    user.name?.trim() ||
    user.email?.trim()?.charAt(0) ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#faf9f5] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="text-sm font-semibold text-[#294431] hover:underline"
        >
          ← {t.backHome || "Back to home"}
        </Link>

        {/* Profile header */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="bg-[#294431] px-6 py-8 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              SAVEL SELLING
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              {t.profileTitle || "My Profile"}
            </h1>

            <p className="mt-2 text-sm text-white/75">
              {t.profileSubtitle ||
                "Manage your account and bird listings."}
            </p>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#294431] text-3xl font-black uppercase text-white">
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="break-words text-2xl font-black text-[#243328]">
                  {user.name?.trim() ||
                    user.email?.split("@")[0] ||
                    t.user ||
                    "User"}
                </h2>

                <p className="mt-1 break-all text-sm text-stone-500">
                  {user.email}
                </p>

                <span className="mt-3 inline-flex rounded-full bg-[#edf1e8] px-3 py-1 text-xs font-bold capitalize text-[#294431]">
                  {user.role || t.member || "Member"}
                </span>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name || "");
                    setError("");
                    setSuccess("");
                    setEditing(true);
                  }}
                  className="rounded-xl bg-[#294431] px-5 py-3 font-bold text-white transition hover:bg-[#1e3324]"
                >
                  {t.editProfile || "Edit profile"}
                </button>
              )}
            </div>

            <div className="my-8 border-t border-stone-100" />

            <h3 className="text-lg font-extrabold text-[#243328]">
              {t.profileDetails || "Account details"}
            </h3>

            {!editing ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#faf9f5] p-5">
                  <p className="text-sm text-stone-500">
                    {t.fullName || "Full name"}
                  </p>
                  <p className="mt-2 break-words font-bold text-stone-800">
                    {user.name || t.notProvided || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#faf9f5] p-5">
                  <p className="text-sm text-stone-500">
                    {t.emailAddress || "Email address"}
                  </p>
                  <p className="mt-2 break-all font-bold text-stone-800">
                    {user.email || "—"}
                  </p>
                  <p className="mt-2 text-xs text-stone-500">
                    {t.emailCannotChange ||
                      "Email address cannot be changed here."}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="mt-5 space-y-5">
                <div>
                  <label
                    htmlFor="profileName"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    {t.fullName || "Full name"}
                  </label>

                  <input
                    id="profileName"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profileEmail"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    {t.emailAddress || "Email address"}
                  </label>

                  <input
                    id="profileEmail"
                    type="email"
                    value={user.email || ""}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-[#294431] px-5 py-3 font-bold text-white hover:bg-[#1e3324] disabled:opacity-60"
                  >
                    {saving
                      ? t.saving || "Saving..."
                      : t.saveChanges || "Save changes"}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setName(user.name || "");
                      setEditing(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="rounded-xl border border-stone-300 px-5 py-3 font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-60"
                  >
                    {t.cancel || "Cancel"}
                  </button>
                </div>
              </form>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"
              >
                {success}
              </p>
            )}
          </div>
        </section>

        {/* Selling summary */}
        <section className="mt-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b85e38]">
              SELLER DASHBOARD
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#243328] sm:text-3xl">
              My Selling Summary
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Overview of the birds you have listed for sale.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-stone-500">
                Total listings
              </p>
              <p className="mt-3 text-3xl font-black text-[#294431]">
                {listingsLoading ? "—" : totalListings}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-stone-500">
                Active listings
              </p>
              <p className="mt-3 text-3xl font-black text-green-700">
                {listingsLoading ? "—" : activeListings}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-stone-500">
                Sold birds
              </p>
              <p className="mt-3 text-3xl font-black text-blue-700">
                {listingsLoading ? "—" : soldListings}
              </p>
            </div>
          </div>
        </section>

        {/* My bird listings */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b85e38]">
                YOUR MARKETPLACE
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#243328] sm:text-3xl">
                My Bird Listings
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                All your listings, including active, reserved, sold and archived birds.
              </p>
            </div>

            <Link
              to="/sell-bird"
              className="rounded-xl bg-[#294431] px-5 py-3 font-bold text-white transition hover:bg-[#1e3324]"
            >
              + Sell a Bird
            </Link>
          </div>

          {listingsLoading && (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center text-stone-600 shadow-sm">
              Loading your listings...
            </div>
          )}

          {listingsError && !listingsLoading && (
            <div
              role="alert"
              className="mt-6 rounded-2xl bg-red-50 p-5 text-sm text-red-700"
            >
              {listingsError}
              <p className="mt-2 text-xs">
                Check that the GET /api/birds/mine backend route has been added.
              </p>
            </div>
          )}

          {!listingsLoading && !listingsError && listings.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
              <span className="text-5xl">🐓</span>
              <h3 className="mt-4 text-xl font-black text-[#243328]">
                No listings yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                You have not listed any birds yet. Your listings will appear here when you publish them.
              </p>
              <Link
                to="/sell-bird"
                className="mt-5 inline-flex rounded-xl bg-[#294431] px-5 py-3 font-bold text-white hover:bg-[#1e3324]"
              >
                Create your first listing
              </Link>
            </div>
          )}

          {!listingsLoading && !listingsError && listings.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((bird) => {
                const photo =
                  typeof bird.photos?.[0] === "string"
                    ? bird.photos[0]
                    : bird.photos?.[0]?.url;

                const status = getStatus(bird.status);

                return (
                  <article
                    key={bird._id}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      to={`/birds/${bird._id}`}
                      className="block"
                      aria-label={`View ${bird.title || "bird listing"}`}
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt={bird.title || "Bird listing"}
                          loading="lazy"
                          className="h-52 w-full bg-stone-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center bg-[#edf1e8] text-5xl">
                          🐓
                        </div>
                      )}
                    </Link>

                    <div className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <span className="rounded-full bg-[#edf1e8] px-3 py-1 text-xs font-bold text-[#294431]">
                          {bird.category || "Bird"}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <h3 className="mt-4 line-clamp-2 text-lg font-black text-[#243328]">
                        {bird.title || "Untitled listing"}
                      </h3>

                      <p className="mt-2 text-xl font-black text-[#b85e38]">
                        {formatPrice(bird.price)}
                      </p>

                      <p className="mt-2 text-sm text-stone-500">
                        {bird.breed || "Breed not specified"}
                      </p>

                      <p className="mt-1 text-sm text-stone-500">
                        📍 {[bird.location, bird.district]
                          .filter(Boolean)
                          .join(", ") || "Location not specified"}
                      </p>

                      <p className="mt-3 text-xs text-stone-400">
                        Listed{" "}
                        {bird.createdAt
                          ? new Date(bird.createdAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </p>

                      <Link
                        to={`/birds/${bird._id}`}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[#294431] px-4 py-3 text-sm font-bold text-[#294431] transition hover:bg-[#edf1e8]"
                      >
                        View listing →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Logout */}
        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div>
            <h3 className="font-extrabold text-stone-800">
              {t.signOut || "Sign out"}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {t.signOutDescription ||
                "Sign out of your Savel Selling account on this device."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-4 rounded-xl border border-red-200 px-5 py-3 font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60 sm:mt-0"
          >
            {loggingOut
              ? t.loggingOut || "Logging out..."
              : t.logout || "Logout"}
          </button>
        </section>
      </div>
    </main>
  );
}
