import { useState } from "react";
import { User, Mail, Lock, MapPin, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import bgImage from "../assets/nile.png"; // ضع الصورة في src/assets وعدّل المسار لو مختلف
import { useNavigate } from "react-router-dom";

const ROLES = [
  { key: "tourist", label: "Tourist", icon: User },
  { key: "tourguide", label: "Tour Guide", icon: User },
];
const API_BASE_URL = "/api";
export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("tourist");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "error");
      // TODO: وجّه المستخدم بعد نجاح التسجيل (login أو dashboard)
      console.log("Registered:", data);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-6 py-12 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
    <div className="absolute inset-0 bg-gray-900/50" />
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left: Brand + Copy */}
        <div className="relative self-stretch flex flex-col justify-start pt-8 pb-10 px-8 overflow-hidden rounded-3xl">
          {/* cream panel behind the text, fading out at the bottom so the photo shows through */}
        {/* <div
  className="absolute inset-0 -z-10"
  // style={{
  //   background:
  //     "linear-gradient(180deg, #F6EEE 0%, #F6EEE2 55%, rgba(246,238,226,0.85) 70%, rgba(246,238,226,-6) 100%)",
  // }}
/> */}

          {/* faint hieroglyph-style pattern, right side of the cream panel only */}
          <div className="absolute top-0 right-0 h-2/3 w-28 -z-10 flex flex-col items-center justify-start gap-7 pt-10 opacity-25 text-orange-900">
            {/* ankh */}
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="10" cy="6" r="5" /><line x1="10" y1="11" x2="10" y2="26" /><line x1="2" y1="16" x2="18" y2="16" />
            </svg>
            {/* wavy water lines */}
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M0 3 Q6 0 12 3 T24 3" /><path d="M0 8 Q6 5 12 8 T24 8" /><path d="M0 13 Q6 10 12 13 T24 13" />
            </svg>
            {/* eye of horus (simplified) */}
            <svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 8 Q12 1 23 8 Q12 15 1 8Z" /><circle cx="12" cy="8" r="2.6" fill="currentColor" stroke="none" />
              <path d="M8 12 L6 17 M12 13 L12 17" />
            </svg>
            {/* bird / falcon */}
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10 C6 2, 16 2, 20 10 C16 8, 12 12, 11 18 C10 12, 6 8, 2 10Z" />
            </svg>
            {/* pillar / djed */}
            <svg width="16" height="26" viewBox="0 0 16 26" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="8" y1="1" x2="8" y2="25" />
              <line x1="2" y1="6" x2="14" y2="6" /><line x1="2" y1="11" x2="14" y2="11" /><line x1="2" y1="16" x2="14" y2="16" />
            </svg>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="19" cy="26" r="16" fill="none" stroke="#f97316" strokeWidth="2.5" />
              <circle cx="33" cy="26" r="16" fill="none" stroke="#f97316" strokeWidth="2.5" />
              <path d="M13 30 L19 18 L25 30 Z" fill="#f97316" />
              <circle cx="33" cy="26" r="3" fill="#f97316" />
              <path d="M33 20 L33 32 M27 26 L39 26" stroke="#f97316" strokeWidth="1.5" />
            </svg>
            <span className="text-3xl font-bold tracking-wide text-white">Rafiq</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <p className="text-orange-500 font-semibold tracking-widest text-sm">
              EXPLORE. CONNECT. JOURNEY.
            </p>
            <span className="h-px w-6 bg-orange-400/70" />
            <span className="text-orange-500 text-xs">◉</span>
            <span className="h-px w-6 bg-orange-400/70" />
          </div>

          <h1 className="text-5xl font-extrabold leading-tight mb-4 text-white">
            Start your journey with{" "}
            <span className="text-orange-500">Rafiq</span>
          </h1>

          <p className="text-lg text-white max-w-md">
            Discover the beauty of Egypt, connect with guides, and create
            unforgettable memories.
          </p>
        </div>

        {/* Right: Form Card */}
        <div className="bg-slate-900/95 backdrop-blur rounded-2xl border border-orange-500/20 shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <svg width="72" height="34" viewBox="0 0 120 56" className="mb-3">
              <circle cx="60" cy="18" r="9" fill="#f97316" />
              <path
                d="M60 18 C50 4, 30 2, 14 10 C8 13, 4 17, 2 22 C18 17, 34 18, 48 25 C34 24, 20 27, 8 34 C24 30, 40 30, 60 24"
                fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round"
              />
              <path
                d="M60 18 C70 4, 90 2, 106 10 C112 13, 116 17, 118 22 C102 17, 86 18, 72 25 C86 24, 100 27, 112 34 C96 30, 80 30, 60 24"
                fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-800 p-1 rounded-lg">
            {ROLES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${
                  role === key
                    ? "bg-slate-950 text-orange-400 border border-orange-500"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User} placeholder="Enter your full name" value={form.name} onChange={handleChange("name")} />
            <Field icon={Mail} type="email" placeholder="Enter your email address" value={form.email} onChange={handleChange("email")} />
            <div className="relative">
              <Field
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Field icon={MapPin} placeholder="Enter your location (e.g., Cairo, Egypt)" value={form.location} onChange={handleChange("location")} />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? "جارٍ الإنشاء..." : "Create Account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-slate-700 flex-1" />
            <span className="text-slate-400 text-sm">or</span>
            <div className="h-px bg-slate-700 flex-1" />
          </div>

          <p className="text-center text-slate-300 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-orange-400 font-medium hover:underline">
              Sign in
            </a>
          </p>

          <p className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-4">
            <ShieldCheck size={14} />
            Your data is safe with us. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type = "text", placeholder, value, onChange }) {
  return (
    <div className="relative">
      <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full bg-slate-800 border border-slate-700 focus:border-orange-500 rounded-lg py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-colors"
      />
    </div>
  );
}
