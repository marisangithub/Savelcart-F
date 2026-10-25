
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { translations } from "../launages";
import {
  loginUser,
  forgotPassword,
  resetPassword,
} from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [language] = useState(() => {
    const saved = localStorage.getItem("savel-language");

    return ["English", "Tamil", "Thanglish"].includes(saved)
      ? saved
      : "English";
  });

  const t = translations[language] || translations.English;

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [resetForm, setResetForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [mode, setMode] = useState("login");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleResetChange(event) {
    const { name, value } = event.target;

    setResetForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openForgotPassword() {
    setMode("forgot");
    setError("");
    setMessage("");
    setOtpSent(false);
    setResetForm({
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  function backToLogin() {
    setMode("login");
    setError("");
    setMessage("");
    setOtpSent(false);
    setResetForm({
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendResetOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.email.trim()) {
      setError(t.emailRequired || "Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword({
        email: form.email.trim(),
      });

      setOtpSent(true);

      setMessage(
        result.message ||
          t.resetOtpSent ||
          "If an eligible account exists, a password reset OTP will be sent."
      );
    } catch (err) {
      setError(err.message || "Unable to request a password reset.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(resetForm.otp)) {
      setError(t.invalidOtp || "Enter a valid 6-digit OTP.");
      return;
    }

    if (
      resetForm.newPassword.length < 8 ||
      resetForm.newPassword.length > 128
    ) {
      setError(
        t.passwordLengthError ||
          "Password must be between 8 and 128 characters."
      );
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError(t.passwordMismatch || "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        email: form.email.trim(),
        otp: resetForm.otp,
        newPassword: resetForm.newPassword,
      });

      setMode("login");
      setOtpSent(false);
      setForm((previous) => ({
        ...previous,
        password: "",
      }));
      setResetForm({
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        result.message ||
          t.passwordResetSuccess ||
          "Password reset successfully. Please log in with your new password."
      );
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/10";

  const buttonClass =
    "w-full rounded-xl bg-[#294431] px-4 py-3 font-bold text-white transition hover:bg-[#1e3324] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f5] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        {/* Branding panel */}
        <section className="hidden flex-col justify-between bg-[#294431] p-10 text-white md:flex">
          <Link to="/" className="text-2xl font-black">
            🐓 Savel Selling
          </Link>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-300">
              {t.marketplaceTagline || "Tamil Nadu Bird Marketplace"}
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight">
              {mode === "login"
                ? t.loginWelcome ||
                  "Welcome back to our native bird community."
                : t.forgotPasswordWelcome || "Recover your account securely."}
            </h1>

            <p className="mt-4 leading-7 text-white/75">
              {mode === "login"
                ? t.loginDescription ||
                  "Sign in to manage your listings and connect with local buyers and sellers."
                : t.forgotPasswordDescription ||
                  "Verify your email and choose a new password for your account."}
            </p>
          </div>

          <p className="text-sm text-white/60">
            {t.responsibleSelling || "Buy and sell responsibly."}
          </p>
        </section>

        {/* Login / Forgot password form */}
        <section className="p-6 sm:p-10">
          <Link
            to="/"
            className="text-sm font-semibold text-[#294431] hover:underline"
          >
            ← {t.backHome || "Back to home"}
          </Link>

          <h2 className="mt-7 text-3xl font-black text-[#243328]">
            {mode === "login"
              ? t.loginTitle || "Welcome back"
              : t.forgotPasswordTitle || "Forgot password?"}
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            {mode === "login"
              ? t.loginSubtitle || "Login to your Savel Selling account."
              : t.forgotPasswordSubtitle ||
                "Enter your registered email to reset your password."}
          </p>

          {location.state?.message && mode === "login" && (
            <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">
              {location.state.message}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* Login form */}
          {mode === "login" && (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-semibold text-stone-700"
                >
                  {t.email || "Email address"}
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-semibold text-stone-700"
                >
                  {t.password || "Password"}
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={inputClass}
                />

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-sm font-bold text-[#294431] hover:underline"
                  >
                    {t.forgotPassword || "Forgot Password?"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading
                  ? t.loading || "Logging in..."
                  : t.loginButton || "Login"}
              </button>
            </form>
          )}

          {/* Forgot password: request OTP */}
          {mode === "forgot" && (
            <div className="mt-7 space-y-5">
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="resetEmail"
                    className="mb-1 block text-sm font-semibold text-stone-700"
                  >
                    {t.email || "Email address"}
                  </label>

                  <input
                    id="resetEmail"
                    type="email"
                    value={form.email}
                    onChange={(event) => {
                      setForm((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }));
                      setError("");
                      setMessage("");
                    }}
                    required
                    maxLength={254}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>

                {!otpSent && (
                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonClass}
                  >
                    {loading
                      ? t.sendingOtp || "Sending OTP..."
                      : t.sendResetOtp || "Send Reset OTP"}
                  </button>
                )}
              </form>

              {/* Show reset fields after requesting OTP */}
              {otpSent && (
                <form
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="resetOtp"
                      className="mb-1 block text-sm font-semibold text-stone-700"
                    >
                      {t.emailOtp || "Email verification OTP"}
                    </label>

                    <input
                      id="resetOtp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={resetForm.otp}
                      onChange={(event) =>
                        setResetForm((previous) => ({
                          ...previous,
                          otp: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        }))
                      }
                      required
                      maxLength={6}
                      placeholder={t.otpPlaceholder || "Enter 6-digit OTP"}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-1 block text-sm font-semibold text-stone-700"
                    >
                      {t.newPassword || "New password"}
                    </label>

                    <input
                      id="newPassword"
                      type="password"
                      value={resetForm.newPassword}
                      onChange={(event) => {
                        setResetForm((previous) => ({
                          ...previous,
                          newPassword: event.target.value,
                        }));
                        setError("");
                      }}
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder={
                        t.passwordPlaceholder || "At least 8 characters"
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmNewPassword"
                      className="mb-1 block text-sm font-semibold text-stone-700"
                    >
                      {t.confirmPassword || "Confirm new password"}
                    </label>

                    <input
                      id="confirmNewPassword"
                      type="password"
                      value={resetForm.confirmPassword}
                      onChange={(event) => {
                        setResetForm((previous) => ({
                          ...previous,
                          confirmPassword: event.target.value,
                        }));
                        setError("");
                      }}
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder={
                        t.confirmPasswordPlaceholder ||
                        "Re-enter your new password"
                      }
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonClass}
                  >
                    {loading
                      ? t.resettingPassword || "Resetting password..."
                      : t.resetPasswordButton || "Reset Password"}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={backToLogin}
                className="w-full rounded-xl border border-stone-200 px-4 py-3 font-bold text-stone-700 transition hover:bg-stone-50"
              >
                ← {t.backToLogin || "Back to Login"}
              </button>
            </div>
          )}

          {mode === "login" && (
            <p className="mt-6 text-center text-sm text-stone-600">
              {t.noAccount || "Don't have an account?"}{" "}
              <Link
                to="/register"
                className="font-bold text-[#294431] hover:underline"
              >
                {t.registerButton || "Create account"}
              </Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
