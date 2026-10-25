
const API_URL = "https://savelcart-backend.onrender.com/api";

export async function getMyListings() {
  const response = await fetch(`${API_URL}/birds/mine`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load your bird listings."
    );
  }

  return Array.isArray(data.listings) ? data.listings : [];
}
