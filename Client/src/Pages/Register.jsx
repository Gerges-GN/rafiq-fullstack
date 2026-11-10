import { useState } from "react";
import { User, Mail, Lock, MapPin, Eye, EyeOff, ArrowRight, ShieldCheck, Compass, Check } from "lucide-react";
import bgImage from "../assets/nile.png";
import { useNavigate } from "react-router-dom";
import { authFetch } from '../services/authFetch';
import TouristNav from "../Components/Layout/TouristNav";
import { useAuth } from "../auth/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export function AuthPage({ initialMode = "register" }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", location: "" });
  const [accountType, setAccountType] = useState("tourist");
  const [guideProfile, setGuideProfile] = useState({ bio: "", city: "", languages: "English, Arabic", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await authFetch(`${API_BASE_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Invalid email or password.");
        const verifiedUser = await login(data.token, remember);
        if (!verifiedUser) throw new Error("Unable to verify your account. Please try again.");
        if (verifiedUser.role === "admin") navigate("/admin/dashboard");
        else if (verifiedUser.role === "tourguide") navigate("/guide/dashboard");
        else navigate("/tourist/profile");
        return;
      }

      const res = await authFetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          accountType,
          ...(accountType === "tourguide" ? {
            guideProfile: {
              ...guideProfile,
              languages: guideProfile.languages.split(",").map((language) => language.trim()).filter(Boolean),
            },
          } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "error");
      if (accountType === "tourguide") {
        setSubmitted(true);
        return;
      }
      setError("Account created. Sign in with your new account to continue.");
      setMode("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1D1D1B]">
      <TouristNav />
      <main className="mx-auto grid max-w-7xl items-stretch gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <section className="relative hidden min-h-[640px] overflow-hidden rounded-[32px] bg-[#171713] lg:block">
          <img src={bgImage} alt="The Nile at sunset" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide backdrop-blur">
              <Compass className="h-4 w-4 text-orange-300" /> Explore. Connect. Journey.
            </span>
            <h1 className="max-w-lg text-5xl font-semibold leading-tight">Find your way into Egypt.</h1>
            <p className="mt-4 max-w-md leading-relaxed text-white/75">Discover places, meet local guides, and plan a journey at your own pace.</p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-white/85">
              {["Curated places", "Local guide stories", "One simple trip planner"].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-orange-300" />{item}</span>)}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-2xl self-center rounded-[28px] border border-[#E9E5DD] bg-white p-5 shadow-[0_20px_70px_-48px_rgba(20,22,26,.28)] sm:p-8 lg:p-10">
          <div className="mb-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C94D13]">Join Rafiq</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{submitted ? "Application received" : mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{submitted ? "Your Guide application is in the review queue." : mode === "login" ? "Sign in to pick up your Egypt journey." : "Choose how you’d like to experience Egypt. You can get started in a minute."}</p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5" role="status">
              <div className="mb-2 flex items-center gap-2 font-semibold text-[#8E3B13]"><ShieldCheck className="h-5 w-5" /> Pending Admin review</div>
              <p className="text-sm leading-relaxed text-gray-600">Your account stays in Tourist mode while the Admin reviews your application. Guide tools unlock after approval.</p>
              <button type="button" onClick={() => { setSubmitted(false); setMode("login"); }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#161614] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C94D13]">Continue to sign in <ArrowRight size={16} /></button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && <fieldset>
                <legend className="mb-2 text-sm font-semibold">I’m joining as</legend>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: "tourist", label: "Tourist", detail: "Discover places and plan trips" }, { value: "tourguide", label: "Tour Guide", detail: "Apply to host local experiences" }].map((option) => (
                    <label key={option.value} className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-colors ${accountType === option.value ? "border-[#C94D13] bg-orange-50/70 ring-1 ring-[#C94D13]" : "border-gray-200 hover:border-gray-300"}`}>
                      <input className="sr-only" type="radio" name="accountType" value={option.value} checked={accountType === option.value} onChange={() => setAccountType(option.value)} />
                      <span className="text-sm font-bold">{option.label}</span>
                      <span className="mt-1 text-xs leading-relaxed text-gray-500">{option.detail}</span>
                      {accountType === option.value && <Check className="absolute right-3 top-3 h-4 w-4 text-[#C94D13]" />}
                    </label>
                  ))}
                </div>
              </fieldset>}

              {mode === "register" && <Field icon={User} label="Full name" placeholder="Your full name" value={form.name} onChange={handleChange("name")} />}
              <div className={mode === "register" ? "grid gap-4 sm:grid-cols-2" : ""}>
                <Field icon={Mail} label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange("email")} />
              </div>
              <div className={mode === "register" ? "grid gap-4 sm:grid-cols-2" : ""}>
                <div className="relative">
                  <Field icon={Lock} label="Password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={form.password} onChange={handleChange("password")} />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-[39px] rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {mode === "register" && <Field icon={MapPin} label="Your location" placeholder="City, country" value={form.location} onChange={handleChange("location")} />}
              </div>

              {mode === "register" && accountType === "tourguide" && <div className="space-y-4 rounded-2xl border border-[#E9E5DD] bg-[#FAF9F6] p-4 sm:p-5">
                <div><h3 className="text-sm font-bold">Guide application</h3><p className="mt-1 text-xs text-gray-500">A few details help the Admin review your application.</p></div>
                <label className="block text-sm font-medium">Short bio
                  <textarea required maxLength={1000} placeholder="Tell travelers about your experience and the stories you love sharing." value={guideProfile.bio} onChange={(e) => setGuideProfile((prev) => ({ ...prev, bio: e.target.value }))} className="mt-1.5 min-h-24 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-[#C94D13] focus:ring-2 focus:ring-orange-100" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field icon={MapPin} label="Operating city" placeholder="e.g., Luxor" value={guideProfile.city} onChange={(e) => setGuideProfile((prev) => ({ ...prev, city: e.target.value }))} />
                  <Field icon={Compass} label="Languages" placeholder="English, Arabic" value={guideProfile.languages} onChange={(e) => setGuideProfile((prev) => ({ ...prev, languages: e.target.value }))} />
                </div>
                <Field icon={User} label="Phone (optional)" type="tel" placeholder="Phone number" value={guideProfile.phone} onChange={(e) => setGuideProfile((prev) => ({ ...prev, phone: e.target.value }))} required={false} />
              </div>}

              {error && <p className={`rounded-xl px-4 py-3 text-sm ${error.startsWith("Account created") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`} role="alert">{error}</p>}
              {mode === "login" && <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[#C94D13]" />Remember me</label>}
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C94D13] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#A83F0F] disabled:cursor-wait disabled:opacity-60">
                {loading ? (mode === "login" ? "Signing in…" : "Creating account…") : mode === "login" ? "Sign in" : accountType === "tourguide" ? "Submit Guide application" : "Create Tourist account"}
                <ArrowRight size={17} />
              </button>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-500"><ShieldCheck size={14} />Your password is protected and never shown on your profile.</p>
              <p className="text-center text-sm text-gray-600">{mode === "login" ? "New to Rafiq?" : "Already have an account?"} <button type="button" onClick={() => { setError(""); setMode(mode === "login" ? "register" : "login"); }} className="font-semibold text-[#C94D13] hover:underline">{mode === "login" ? "Join" : "Sign in"}</button></p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default function Register() {
  return <AuthPage initialMode="register" />;
}

function Field({ icon: Icon, label, type = "text", placeholder, value, onChange, required = true }) {
  return (
    <label className="block min-w-0 text-sm font-medium">
      {label}
      <span className="relative mt-1.5 block">
      <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#C94D13] focus:ring-2 focus:ring-orange-100"
      />
      </span>
    </label>
  );
}
