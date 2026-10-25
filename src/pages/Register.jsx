
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  registerUser,
  verifyEmailOtp,
  resendVerificationOtp,
  completeRegistration,
} from "../services/authService";
import { translations } from "../launages";

export default function Register() {
  const navigate = useNavigate();

  const [language] = useState(() => {
    const saved = localStorage.getItem("savel-language");

    return ["English", "Tamil", "Thanglish"].includes(saved)
      ? saved
      : "English";
  });

  const t = translations[language] || translations.English;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [registrationToken, setRegistrationToken] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Details change aana, previous OTP verification invalidate pannuvom.
    if (otpSent || otpVerified) {
      setOtpSent(false);
      setOtpVerified(false);
      setRegistrationToken("");
      setOtp("");
      setMessage("");
    }

    setError("");
  }

  function validateForm() {
    if (form.name.trim().length < 2) {
      setError(t.nameError || "Name must contain at least 2 characters.");
      return false;
    }

    if (form.password.length < 8 || form.password.length > 128) {
      setError(
        t.passwordLengthError ||
          "Password must be between 8 and 128 characters."
      );
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatch || "Passwords do not match.");
      return false;
    }

    return true;
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      setOtpSent(true);
      setOtpVerified(false);
      setRegistrationToken("");
      setOtp("");

      setMessage(
        result.message ||
          t.otpSentMessage ||
          "OTP sent to your email address. Please check your inbox."
      );
    } catch (err) {
      setError(err.message || t.registerError || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError(t.invalidOtp || "Enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyEmailOtp({
        email: form.email.trim(),
        otp: otp.trim(),
      });

      if (!result.registrationToken) {
        throw new Error(
          "Verification token was not returned by the server."
        );
      }

      setRegistrationToken(result.registrationToken);
      setOtpVerified(true);

      setMessage(
        result.message ||
          t.otpVerifiedMessage ||
          "Email verified successfully. You can now create your account."
      );
    } catch (err) {
      setError(err.message || t.otpVerifyError || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const result = await resendVerificationOtp({
        email: form.email.trim(),
      });

      setOtp("");
      setOtpSent(true);
      setOtpVerified(false);
      setRegistrationToken("");

      setMessage(
        result.message ||
          t.otpResentMessage ||
          "A new OTP has been sent to your email."
      );
    } catch (err) {
      setError(err.message || t.otpResendError || "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  }

  async function handleCreateAccount() {
    setError("");
    setMessage("");

    if (!otpVerified || !registrationToken) {
      setError(
        t.verifyEmailFirst ||
          "Please verify your email before creating your account."
      );
      return;
    }

    setLoading(true);

    try {
      await completeRegistration({ registrationToken });

      navigate("/login", {
        state: {
          message:
            t.registerSuccess ||
            "Account created successfully. Please log in.",
        },
      });
    } catch (err) {
      setError(err.message || t.registerError || "Unable to create account.");
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
        {/* Left-side branding panel */}
        <section className="hidden flex-col justify-between bg-[#294431] p-10 text-white md:flex">
          <Link to="/" className="text-2xl font-black">
            🐓 Savel Selling
          </Link>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-300">
              {t.marketplaceTagline || "Tamil Nadu Bird Marketplace"}
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight">
              {t.registerWelcome || "Join our native bird community."}
            </h1>

            <p className="mt-4 leading-7 text-white/75">
              {t.registerDescription ||
                "Create an account to explore listings and connect with local sellers."}
            </p>
          </div>

          <p className="text-sm text-white/60">
            {t.responsibleSelling || "Buy and sell responsibly."}
          </p>
        </section>

        {/* Registration form */}
        <section className="p-6 sm:p-10">
          <Link
            to="/"
            className="text-sm font-semibold text-[#294431] hover:underline"
          >
            ← {t.backHome || "Back to home"}
          </Link>

          <h2 className="mt-7 text-3xl font-black text-[#243328]">
            {t.registerTitle || "Create account"}
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            {t.registerSubtitle ||
              "Register to get started with Savel Selling."}
          </p>

          <form onSubmit={handleSendOtp} className="mt-7 space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-semibold text-stone-700"
              >
                {t.name || "Full name"}
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                disabled={otpVerified || loading}
                placeholder={t.namePlaceholder || "Enter your name"}
                className={inputClass}
              />
            </div>

            {/* Email */}
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
                disabled={otpVerified || loading}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
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
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                disabled={otpVerified || loading}
                placeholder={
                  t.passwordPlaceholder || "At least 8 characters"
                }
                className={inputClass}
              />
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-semibold text-stone-700"
              >
                {t.confirmPassword || "Confirm password"}
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                disabled={otpVerified || loading}
                placeholder={
                  t.confirmPasswordPlaceholder || "Re-enter your password"
                }
                className={inputClass}
              />
            </div>

            {/* OTP field: appears after OTP is sent */}
            {otpSent && !otpVerified && (
              <div className="space-y-3 rounded-xl border border-stone-200 bg-[#faf9f5] p-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-1 block text-sm font-semibold text-stone-700"
                  >
                    {t.emailOtp || "Email verification OTP"}
                  </label>

                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    required
                    maxLength={6}
                    placeholder={t.otpPlaceholder || "Enter 6-digit OTP"}
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className={buttonClass}
                >
                  {loading
                    ? t.verifyingOtp || "Verifying OTP..."
                    : t.verifyOtpButton || "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending || loading}
                  className="w-full rounded-xl border border-[#294431] px-4 py-3 font-bold text-[#294431] transition hover:bg-[#294431]/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resending
                    ? t.resendingOtp || "Sending OTP..."
                    : t.resendOtpButton || "Resend OTP"}
                </button>
              </div>
            )}

            {/* Status messages */}
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {message && !error && (
              <p
                role="status"
                className="rounded-xl bg-green-50 p-3 text-sm text-green-800"
              >
                {message}
              </p>
            )}

            {/* Send OTP: shown before verification */}
            {!otpSent && !otpVerified && (
              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading
                  ? t.sendingOtp || "Sending OTP..."
                  : t.sendOtpButton || "Send OTP"}
              </button>
            )}

            {/* Account creation: only after successful OTP verification */}
            {otpVerified && (
              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={loading}
                className={buttonClass}
              >
                {loading
                  ? t.creatingAccount || "Creating account..."
                  : t.registerButton || "Create Account"}
              </button>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            {t.haveAccount || "Already have an account?"}{" "}
            <Link
              to="/login"
              className="font-bold text-[#294431] hover:underline"
            >
              {t.loginButton || "Login"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
