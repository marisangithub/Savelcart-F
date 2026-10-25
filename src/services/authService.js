
const API_URL = "https://savelcart-backend.onrender.com/api/auth";

// Helper: API response handle pannum
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// 1. Send OTP and start registration
export async function registerUser({ name, email, password }) {
  return apiRequest("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// 2. Verify email OTP
export async function verifyEmailOtp({ email, otp }) {
  return apiRequest("/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

// 3. Resend OTP
export async function resendVerificationOtp({ email }) {
  return apiRequest("/resend-verification-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// 4. Complete registration after OTP verification
export async function completeRegistration({ registrationToken }) {
  return apiRequest("/complete-registration", {
    method: "POST",
    body: JSON.stringify({ registrationToken }),
  });
}

// 5. Login
export async function loginUser({ email, password }) {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// 6. Get logged-in user
export async function getCurrentUser() {
  return apiRequest("/me", {
    method: "GET",
  });
}

// 7. Update profile
export async function updateMyProfile({ name }) {
  return apiRequest("/me", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

// 8. Logout
export async function logoutUser() {
  return apiRequest("/logout", {
    method: "POST",
  });
}

// 9. Forgot password — send reset OTP
export async function forgotPassword({ email }) {
  return apiRequest("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// 10. Reset password using OTP
export async function resetPassword({ email, otp, newPassword }) {
  return apiRequest("/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  });
}
