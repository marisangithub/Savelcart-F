
const API_URL = "https://savelcart-backend.onrender.com/api/birds";

// Create a bird listing with photos
export async function createBirdListing(listing, photos = []) {
  const formData = new FormData();

  // Add bird details
  Object.entries(listing).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Add selected photos
  photos.forEach((photo) => {
    if (photo instanceof File) {
      formData.append("photos", photo);
    }
  });

  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    // FormData-ku Content-Type manually set panna vendam
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to publish listing."
    );
  }

  return data;
}

// Get bird listings with search and filters
export async function getBirdListings(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.district) {
    params.set("district", filters.district);
  }

  const query = params.toString();
  const url = query ? `${API_URL}?${query}` : API_URL;

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load bird listings."
    );
  }

  return data.listings || [];
}

export async function getBirdById(id) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load bird details.");
  }

  return data.listing || data.bird || data;
}
