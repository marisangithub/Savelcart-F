import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://savelcart-backend.onrender.com";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBirds: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
          credentials: "include",
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          navigate("/admin/login", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load dashboard.");
        }

        if (active) {
          setStats(data.stats);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load dashboard.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      symbol: "U",
    },
    {
      title: "Bird Listings",
      value: stats.totalBirds,
      symbol: "B",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      symbol: "O",
    },
  ];

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      navigate("/admin/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white md:flex">
      <aside className="w-full border-b border-slate-800 bg-slate-900 p-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <h1 className="text-xl font-bold">
          <span className="text-red-500">Savel</span> Admin
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Administration panel
        </p>

        <nav className="mt-8 space-y-2">
          <div className="rounded-xl bg-red-600/15 px-4 py-3 font-medium text-red-300">
            Dashboard
          </div>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 w-full rounded-xl border border-slate-700 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-slate-800"
        >
          Sign out
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <header className="mb-8">
          <p className="text-sm text-red-400">OVERVIEW</p>
          <h2 className="mt-2 text-3xl font-bold">Dashboard</h2>
          <p className="mt-2 text-slate-400">
            Welcome to your Savel Selling admin panel.
          </p>
        </header>

        {loading ? (
          <p className="text-slate-400">Loading dashboard...</p>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-900 bg-red-950/50 p-4 text-red-300"
          >
            {error}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <section
                key={card.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 font-bold text-red-400">
                    {card.symbol}
                  </span>
                </div>

                <p className="mt-5 text-4xl font-bold">
                  {card.value}
                </p>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
