
const API_URL = "https://savelcart-backend.onrender.com/api/orders";

export async function createOrder(orderData) {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to create order.");
  }

  return data;
}

export async function getMyOrders() {
  const response = await fetch(`${API_URL}/my-orders`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load your orders.");
  }

  return data.orders || [];
}
