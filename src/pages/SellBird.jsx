
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { translations } from "../launages";
import { createBirdListing } from "../services/birdService";

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

const initialForm = {
  title: "",
  category: "",
  breed: "",
  age: "",
  price: "",
  description: "",
  district: "",
  location: "",
  contactNumber: "",
};

export default function SellBird() {
  const language = localStorage.getItem("savel-language") || "English";
  const t = translations[language] || translations.English;

  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, [photos]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  function handlePhotos(event) {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 5) {
      setError(t.invalidPhotos);
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalidFiles = selectedFiles.some(
      (file) =>
        !allowedTypes.includes(file.type) ||
        file.size > 5 * 1024 * 1024
    );

    if (invalidFiles) {
      setError(
        t.invalidPhotoFormat ||
          "Use JPG, PNG or WEBP photos up to 5 MB each."
      );
      event.target.value = "";
      return;
    }

    setPhotos(
      selectedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
    );

    setError("");
    setSuccess("");
    event.target.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    if (
      !form.title.trim() ||
      !form.category ||
      !form.breed ||
      !form.age.trim() ||
      !form.price ||
      !form.description.trim() ||
      !form.district ||
      !form.location.trim() ||
      !form.contactNumber.trim()
    ) {
      setError(t.requiredField);
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price <= 0) {
      setError(t.invalidPrice);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.contactNumber.trim())) {
      setError(t.invalidPhone);
      return;
    }

    if (photos.length < 1 || photos.length > 5) {
      setError(t.invalidPhotos);
      return;
    }

    setSubmitting(true);

    try {
     
await createBirdListing(
  {
    title: form.title.trim(),
    category: form.category,
    breed: form.breed,
    age: form.age.trim(),
    price,
    description: form.description.trim(),
    district: form.district,
    location: form.location.trim(),
    contactNumber: form.contactNumber.trim(),
  },
  photos.map((photo) => photo.file)
);


      setSuccess(t.listingCreated);
      setForm({ ...initialForm });
      setPhotos([]);
    } catch (err) {
      setError(
        err.message ||
          "Unable to publish your listing. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-[#294431] focus:ring-2 focus:ring-[#294431]/10";

  const labelClass =
    "mb-2 block text-sm font-bold text-stone-700";

  return (
    <main className="min-h-screen bg-[#faf9f5] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-block text-sm font-bold text-[#294431] hover:underline"
        >
          ← {t.backHome}
        </Link>

        <header className="mt-6 rounded-3xl bg-[#294431] px-6 py-8 text-white sm:px-10 sm:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            SAVEL SELLING
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {t.sellBirdTitle}
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
            {t.sellBirdSubtitle}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-7 rounded-3xl bg-white p-5 shadow-sm sm:p-8"
        >
          <section>
            <h2 className="text-lg font-extrabold text-[#243328]">
              {t.profileDetails}
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="title">
                  {t.birdName} *
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={t.birdNamePlaceholder}
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="category">
                  {t.birdCategory} *
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">{t.selectCategory}</option>
                  <option value="Rooster">{t.rooster}</option>
                  <option value="Hen">{t.hen}</option>
                  <option value="Chicks">{t.chicks}</option>
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="breed">
                  {t.birdVariety} *
                </label>

                <select
                  id="breed"
                  name="breed"
                  value={form.breed}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">
                    {t.selectBirdVariety}
                  </option>

                  <option value="Kaththi Kattu">
                    {t.kaththiKattu}
                  </option>

                  <option value="Veththukaal">
                    {t.veththukaal}
                  </option>
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="age">
                  {t.birdAge} *
                </label>

                <input
                  id="age"
                  name="age"
                  type="text"
                  value={form.age}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={t.agePlaceholder}
                  maxLength={40}
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="price">
                  {t.birdPrice} *
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  max="10000000"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. 2500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  className={labelClass}
                  htmlFor="description"
                >
                  {t.birdDescription} *
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={t.descriptionPlaceholder}
                  rows={4}
                  maxLength={1500}
                  required
                />

                <p className="mt-1 text-right text-xs text-stone-400">
                  {form.description.length}/1500
                </p>
              </div>
            </div>
          </section>

          <div className="border-t border-stone-100" />

          <section>
            <h2 className="text-lg font-extrabold text-[#243328]">
              {t.district} &amp; {t.location}
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="district">
                  {t.district} *
                </label>

                <select
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">{t.selectDistrict}</option>

                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="location">
                  {t.location} *
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={t.locationPlaceholder}
                  maxLength={100}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  className={labelClass}
                  htmlFor="contactNumber"
                >
                  {t.contactNumber} *
                </label>

                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  inputMode="numeric"
                  value={form.contactNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={t.contactPlaceholder}
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </section>

          <div className="border-t border-stone-100" />

          <section>
            <h2 className="text-lg font-extrabold text-[#243328]">
              {t.birdPhotos} *
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {t.photoHint}
            </p>

            <label
              htmlFor="photos"
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-[#faf9f5] px-5 py-8 text-center transition hover:border-[#294431]"
            >
              <span className="text-3xl" aria-hidden="true">
                📷
              </span>

              <span className="mt-2 font-bold text-[#294431]">
                {t.birdPhotos}
              </span>

              <span className="mt-1 text-xs text-stone-500">
                {t.photoFormatHint ||
                  "JPG, PNG or WEBP · Max 5 MB each"}
              </span>

              <input
                id="photos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotos}
                className="sr-only"
              />
            </label>

            {photos.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 text-sm font-bold text-stone-700">
                  {t.listingPreview} ({photos.length}/5)
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo, index) => (
                    <div
                      key={photo.preview}
                      className="overflow-hidden rounded-xl border border-stone-200"
                    >
                      <img
                        src={photo.preview}
                        alt={`${t.listingPreview} ${index + 1}`}
                        className="h-36 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <p className="rounded-xl bg-[#f2f4ee] p-4 text-sm leading-6 text-stone-600">
            {t.formNote}
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-800"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#294431] px-6 py-4 font-extrabold text-white transition hover:bg-[#1e3324] focus:outline-none focus:ring-2 focus:ring-[#294431] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? t.creatingListing || "Publishing..."
              : t.publishListing}
          </button>
        </form>
      </div>
    </main>
  );
}
