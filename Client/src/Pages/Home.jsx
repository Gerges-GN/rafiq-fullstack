import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass, MapPin, Calendar, ArrowRight, ArrowUpRight, ShieldCheck,
  Route, Sparkles, Star, Quote, ChevronLeft, ChevronRight,
  PlaneTakeoff, BadgeCheck, Users2, Menu, User
} from "lucide-react";
import logo from '../../public/images/logo.png';
import Footer from "../Components/Layout/Footer";

/* =========================================================================
   RAFIQ — Home (Ultimate Mix v5)
   Headlines: Playfair Display | Body: Inter
   White base · Cloud sections · Orange #FF6A2C accents
   ========================================================================= */

/* ---------- مشهد احتياطي مضمون (أهرمات SVG) لو كل الروابط وقعت ---------- */
const FALLBACK_SCENE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffedd5"/>
        <stop offset="0.6" stop-color="#fed7aa"/>
        <stop offset="1" stop-color="#fdba74"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#sky)"/>
    <circle cx="880" cy="300" r="130" fill="#FF6A2C" opacity="0.8"/>
    <polygon points="-50,780 320,420 690,780" fill="#374151"/>
    <polygon points="420,780 800,340 1200,780" fill="#1f2937"/>
    <polygon points="200,780 560,540 920,780" fill="#4b5563" opacity="0.85"/>
    <rect y="780" width="1200" height="120" fill="#111827"/>
    <text x="50%" y="855" text-anchor="middle" font-size="34" fill="#fbbf24" font-family="Georgia, serif">Rafiq Journeys — Egypt</text>
  </svg>`);

/* ---------- صورة ذكية: أصلي ← picsum ← SVG أهرمات ---------- */
const Img = ({ src, alt = "", className = "", seed = 1 }) => (
  <img
    src={src}
    alt={alt}
    className={className}
    loading="lazy"
    onError={(e) => {
      const img = e.currentTarget;
      const step = Number(img.dataset.step || 0);
      if (step === 0) {
        img.dataset.step = 1;
        img.src = `https://picsum.photos/seed/egypt${seed}/1200/900`;
      } else {
        img.dataset.step = 2;
        img.src = FALLBACK_SCENE;
      }
    }}
  />
);

/* ---------- Reveal on scroll ---------- */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------- عدّاد بيعد لما يظهر ---------- */
function StatCount({ value, suffix = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now) => {
              const p = Math.min(1, (now - start) / 1400);
              const eased = 1 - Math.pow(1 - p, 3);
              setDisplay(Math.round(value * eased).toLocaleString());
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ---------- سطر العنوان الصغير البرتقالي ---------- */
function Eyebrow({ children, center = false }) {
  return (
    <span className={`mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#FF6A2C] ${center ? "justify-center" : ""}`}>
      {children}
      <span className="h-px w-8 bg-[#FF6A2C]" />
    </span>
  );
}

/* ========================================================================= */

const serif = { fontFamily: "'Playfair Display', serif" };

const IMG = {
  pyramids: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200&q=80&auto=format&fit=crop",
  sphinx: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=80&auto=format&fit=crop",
  giza: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1200&q=80&auto=format&fit=crop",
  karnak: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&q=80&auto=format&fit=crop",
  carvings: "https://images.unsplash.com/photo-1566371486490-560ded23b5e4?w=1200&q=80&auto=format&fit=crop",
  cairoOld: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&q=80&auto=format&fit=crop",
  dunes: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1200&q=80&auto=format&fit=crop",
  desert: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80&auto=format&fit=crop",
  sea: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80&auto=format&fit=crop",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop",
  beach2: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&q=80&auto=format&fit=crop",
  journey: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80&auto=format&fit=crop",
  dahab: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80&auto=format&fit=crop",
  mountains: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80&auto=format&fit=crop",
};

const FEATURES = [
  { icon: Route, title: "Lots of Choices", text: "Handpicked routes across Egypt from desert oases to Red Sea shores." },
  { icon: ShieldCheck, title: "Best Tour Guide", text: "Local experts who know the stories behind every temple and trail." },
  { icon: Sparkles, title: "Easy Booking", text: "Clear plans, flexible dates, and one calm place to manage your trip." },
];

const DESTINATIONS = [
  { name: "Cairo & Giza", tag: "Greater Cairo", img: IMG.pyramids, rating: "4.9", price: "$320" },
  { name: "Luxor", tag: "Upper Egypt", img: IMG.karnak, rating: "4.8", price: "$280" },
  { name: "Aswan", tag: "Nubian South", img: IMG.sphinx, rating: "4.9", price: "$260" },
  { name: "Sharm El Sheikh", tag: "Red Sea", img: IMG.sea, rating: "4.7", price: "$340" },
  { name: "Siwa Oasis", tag: "Western Desert", img: IMG.dunes, rating: "4.8", price: "$300" },
  { name: "Marsa Matrouh", tag: "Mediterranean", img: IMG.beach, rating: "4.6", price: "$250" },
];

const STOPS = [
  { no: "STOP 01", title: "Cairo", desc: "Where the pyramids meet the modern city.", img: IMG.giza },
  { no: "STOP 02", title: "Luxor", desc: "An open-air museum of temples and tombs.", img: IMG.karnak },
  { no: "STOP 03", title: "Aswan", desc: "Granite islands and Nubian riverside villages.", img: IMG.carvings },
  { no: "STOP 04", title: "Sharm El Sheikh", desc: "Coral reefs where the desert meets the sea.", img: IMG.sea },
];

const VOICES = [
  { name: "Maya Ibrahim", trip: "Travel Enthusiast", quote: "This platform made our Egypt trip feel calm, clear, and warm. The destinations were beautifully organized, and the whole journey felt personal from start to finish." },
  { name: "Omar T.", trip: "Sinai Coast, 4 days", quote: "The pacing was the whole thing nothing felt rushed, nothing felt wasted, and we never opened another app." },
  { name: "Laila R.", trip: "Cairo, 3 days", quote: "Told it we had toddlers and it quietly rebuilt the whole day around nap time. Didn't expect that." },
];

/* ========================================================================= */

export default function Home() {
  const navigate = useNavigate();

  /* navbar scrolled state */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* hero collage parallax */
  const collageRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onCollageMove = (e) => {
    const rect = collageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTilt({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 12,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 12,
    });
  };
  const onCollageLeave = () => setTilt({ x: 0, y: 0 });

  /* destinations carousel */
  const trackRef = useRef(null);
  const scrollTrack = (dir) =>
    trackRef.current?.scrollBy({ left: dir === "next" ? 400 : -400, behavior: "smooth" });

  /* testimonials auto-rotate */
  const [voiceIndex, setVoiceIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setVoiceIndex((i) => (i + 1) % VOICES.length), 5500);
    return () => clearInterval(t);
  }, []);

  /* hero collage images — نفس ترتيب الصورة المرجعية */
  const heroImgs = [
    { src: IMG.giza, seed: 1, cls: "top-4 left-0 w-[72%] h-[56%] rounded-[2rem]", depth: 1, anim: "animate-float-slow" },
    { src: IMG.karnak, seed: 2, cls: "top-0 right-0 w-[27%] h-[35%] rounded-[2rem] border-[6px] border-white", depth: -0.6, anim: "animate-float-medium" },
    { src: IMG.sphinx, seed: 3, cls: "top-[44%] right-[25%] w-[22%] h-[24%] rounded-[1.5rem] border-[6px] border-white", depth: -0.9, anim: "animate-float-fast" },
    { src: IMG.dunes, seed: 4, cls: "top-[56%] right-0 w-[27%] h-[40%] rounded-[2rem] border-[6px] border-white", depth: -0.5, anim: "animate-float-medium" },
    { src: IMG.journey, seed: 5, cls: "bottom-0 left-[14%] w-[34%] h-[36%] rounded-[2rem] border-[6px] border-white", depth: 0.7, anim: "animate-float-slow" },
  ];

  return (
    <div className="relative overflow-x-hidden bg-white text-[#14161A]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Inter:wght@300;400;500;600;700;800&display=swap"
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .animate-float-slow { animation: float 7s ease-in-out infinite; }
        .animate-float-medium { animation: float 5.5s ease-in-out infinite; }
        .animate-float-fast { animation: float 4s ease-in-out infinite; }
        .badge-float { animation: float 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-float-slow, .animate-float-medium, .animate-float-fast, .badge-float { animation: none; }
        }
      `}</style>

      {/* =====================  NAVBAR (زي الصورة بالظبط) ===================== */}
      <header
        className={`sticky top-0 z-50  transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)] border-b border-gray-100" : "bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl border-b border-gray-200 items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-2 font-bold text-xl text-gray-900 z-10">
                    <img
                      src={logo}
                      alt="Rafiq Logo"
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span>Rafiq</span>
                  </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-800 md:flex">
            {[
              { l: "Home", to: "/" },
              { l: "Destinations", to: "/explore" },
              { l: "Experiences", to: "/trip-planner" },
              { l: "Journal", to: "/journal" },
              { l: "Contact", to: "/contact" },
            ].map((n) => (
              <button key={n.l} onClick={() => navigate(n.to)} className="transition-colors hover:text-[#FF6A2C]">
                {n.l}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-3 rounded-full  py-2 pl-5 pr-2 text-sm font-medium text-[#FF6A2C] transition-transform hover:scale-[1.04]"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/trip-planner")}
              className="flex items-center gap-3 rounded-full bg-black py-2 pl-5 pr-2 text-sm font-medium text-white transition-transform hover:scale-[1.04]"
            >
              Plan Trip
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6A2C]">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================  HERO ===================== */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          {/* ===== النص ===== */}
          <Reveal>
            <Eyebrow>
              <PlaneTakeoff className="h-3.5 w-3.5" /> Chapter 1 — Come Dreaming
            </Eyebrow>
            <h1
              className="mb-6 text-[clamp(2.6rem,5.5vw,4.4rem)] leading-[1.06] tracking-tight"
              style={{ ...serif, fontWeight: 600 }}
            >
              <span className="text-[#FF6A2C]">Rafiq</span> Journeys
              <br />
              Across Egypt
            </h1>
            <p className="mb-9 max-w-[440px] text-[15px] leading-relaxed text-gray-500">
              Discover the best destinations, guides, routes, and experiences in one calm travel
              space designed for clear planning and memorable Egyptian stories.
            </p>

            {/* شريط البحث */}
            <div className="flex max-w-lg flex-col gap-3 rounded-[22px] border border-gray-100 bg-white p-2.5 shadow-[0_14px_45px_rgba(0,0,0,0.09)] sm:flex-row sm:items-center sm:rounded-full">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDEADD]">
                  <MapPin className="h-4 w-4 text-[#FF6A2C]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-gray-400">Location</p>
                  <p className="truncate text-[13px] font-medium">Where are you going?</p>
                </div>
              </div>
              <span className="hidden h-8 w-px bg-gray-100 sm:block" />
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDEADD]">
                  <Calendar className="h-4 w-4 text-[#FF6A2C]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-gray-400">Select Date</p>
                  <p className="truncate text-[13px] font-medium">03 August 2026</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/trip-planner")}
                className="shrink-0 rounded-full bg-[#FF6A2C] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e85a20]"
              >
                Get Started
              </button>
            </div>
          </Reveal>

          {/* ===== كولاج الصور + بارالاكس ===== */}
          <Reveal delay={150}>
            <div
              ref={collageRef}
              onMouseMove={onCollageMove}
              onMouseLeave={onCollageLeave}
              className="relative mx-auto h-[440px] w-full max-w-[520px] transition-transform duration-150 ease-out sm:h-[500px]"
              style={{ transform: `rotate(${tilt.x * 0.12}deg)` }}
            >
              {heroImgs.map((h, i) => (
                <div
                  key={i}
                  className={`absolute overflow-hidden shadow-xl ${h.cls}`}
                  style={{ transform: `translate(${tilt.x * h.depth}px, ${tilt.y * h.depth}px)` }}
                >
                  <div className={`h-full w-full ${h.anim}`}>
                    <Img src={h.src} seed={h.seed} alt="Egypt" className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}

              {/* بادج طاير */}
              <div className="badge-float absolute -left-2 top-[38%] z-10 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-12px_rgba(20,22,26,0.25)] sm:-left-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FDEADD]">
                  <Compass className="h-4 w-4 text-[#FF6A2C]" />
                </span>
                <div>
                  <div className="text-sm font-extrabold leading-none">27+ Destinations</div>
                  <div className="text-[10px] text-gray-500">Trusted by 15,000+ travelers</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ===== عدّادات الإحصائيات ===== */}
        <Reveal delay={200}>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-12 border-t border-gray-100 pt-10 sm:justify-between">
            {[
              { v: 27, s: "+", l: "Destinations" },
              { v: 15000, s: "+", l: "Explorers" },
              { v: 5, s: "+", l: "Years Experience" },
              { v: 98, s: "%", l: "Happy Travelers" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-3xl font-extrabold text-[#FF6A2C] sm:text-4xl" style={serif}>
                  <StatCount value={s.v} suffix={s.s} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{s.l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* =====================  ABOUT ===================== */}
      <section className="bg-[#F6F7FB] py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
          <Reveal className="order-2 lg:order-1">
            <div className="relative mx-auto grid h-[380px] w-full max-w-[440px] grid-cols-5 grid-rows-5 gap-3">
              <div className="col-span-3 row-span-3 overflow-hidden rounded-[24px] shadow-lg">
                <Img src={IMG.cairoOld} seed={10} alt="Old Cairo" className="h-full w-full object-cover" />
              </div>
              <div className="relative col-span-2 col-start-4 row-span-2 overflow-hidden rounded-[20px] shadow-lg animate-float-slow">
                <Img src={IMG.dahab} seed={11} alt="Dahab" className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold shadow">
                  <BadgeCheck className="h-3 w-3 text-[#FF6A2C]" /> Verified
                </span>
              </div>
              <div className="col-span-3 col-start-1 row-span-2 row-start-4 overflow-hidden rounded-[20px] shadow-lg">
                <Img src={IMG.desert} seed={12} alt="Siwa desert" className="h-full w-full object-cover" />
              </div>
              <div className="col-span-2 col-start-4 row-span-3 row-start-3 overflow-hidden rounded-[20px] shadow-lg">
                <Img src={IMG.carvings} seed={13} alt="Temple carvings" className="h-full w-full object-cover" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="order-1 lg:order-2">
            <Eyebrow>About</Eyebrow>
            <h2 className="mb-5 text-4xl leading-[1.15] sm:text-5xl" style={{ ...serif, fontWeight: 500 }}>
              We Recommend <span className="text-[#FF6A2C]">Beautiful</span> Destinations Every Month
            </h2>
            <p className="mb-9 max-w-[460px] leading-relaxed text-gray-500">
              Rafiq curates fresh, ground-tested routes across Egypt's governorates from Nile
              temples to Sinai reefs and paces each one so your days flow instead of rush.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-[440px]">
              {[
                { n: "2000+", l: "Our Explorers" },
                { n: "100+", l: "Destinations" },
                { n: "20+", l: "Years Experience" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1">
                  <p className="mb-1 text-2xl text-[#FF6A2C]" style={{ ...serif, fontWeight: 600 }}>{s.n}</p>
                  <p className="text-[11px] text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================  STOPS — الخط المتعرج ===================== */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <Reveal className="mb-20 text-center">
          <h2 className="text-4xl sm:text-5xl" style={{ ...serif, fontWeight: 500 }}>
            Four stops, <span className="italic text-[#FF6A2C]">one</span> winding line
          </h2>
        </Reveal>

        <div className="relative">
          <svg className="absolute left-0 top-1/2 hidden h-32 w-full -translate-y-1/2 md:block" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path d="M 50 50 Q 300 -20 500 50 T 950 50 T 1150 50" stroke="#FF6A2C" strokeWidth="2" fill="none" strokeDasharray="8 8" opacity="0.4" />
          </svg>

          <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4">
            {STOPS.map((s, i) => (
              <Reveal key={s.no} delay={i * 120} className={i % 2 === 0 ? "md:mt-0" : "md:mt-32"}>
                <div className="text-center">
                  <div className="mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md transition hover:scale-110">
                    <Img src={s.img} seed={20 + i} alt={s.title} className="h-full w-full object-cover" />
                  </div>
                  <p className="mb-2 text-xs tracking-widest text-[#FF6A2C]">{s.no}</p>
                  <h4 className="mb-2 text-2xl" style={{ ...serif, fontWeight: 500 }}>{s.title}</h4>
                  <p className="mx-auto max-w-[180px] text-sm text-gray-500">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================  FEATURES ===================== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <Reveal>
          <div className="rounded-[32px] border border-[#f3e5da] bg-[#FDF7F2] px-10 py-12 shadow-[0_10px_30px_rgba(0,0,0,0.03)] md:px-12 md:py-14">
            <div className="flex flex-col gap-12 xl:flex-row xl:items-center">
              <div className="xl:w-[42%]">
                <Eyebrow>What We Give</Eyebrow>
                <h2 className="mb-6 text-4xl leading-tight md:text-5xl" style={{ ...serif, fontWeight: 500 }}>
                  Best <span className="text-[#FF6A2C]">Features</span> For You
                </h2>
                <p className="max-w-[480px] leading-relaxed text-gray-500">
                  We provide the best features for those who want to travel comfortably with their family.
                </p>
              </div>

              <div className="xl:w-[58%]">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  {FEATURES.map((f) => (
                    <div
                      key={f.title}
                      className="group min-h-[220px] rounded-[22px] bg-white p-6 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)]"
                    >
                      <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDEADD] transition-colors duration-300 group-hover:bg-[#FF6A2C]">
                        <f.icon className="h-5 w-5 text-[#FF6A2C] transition-colors duration-300 group-hover:text-white" />
                      </span>
                      <h4 className="mb-3 text-xl font-semibold">{f.title}</h4>
                      <p className="text-[15px] leading-relaxed text-gray-500">{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =====================  TOP DESTINATIONS — كاروسيل ===================== */}
      <section id="destinations" className="bg-[#F6F7FB] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Top Destination</Eyebrow>
              <h2 className="max-w-[560px] text-4xl leading-[1.15] sm:text-5xl" style={{ ...serif, fontWeight: 500 }}>
                Let's Explore Your <span className="text-[#FF6A2C]">Dream</span> Destination Here
              </h2>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => scrollTrack("prev")} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:border-[#FF6A2C] hover:bg-[#FF6A2C] hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scrollTrack("next")} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:border-[#FF6A2C] hover:bg-[#FF6A2C] hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div ref={trackRef} className="flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {DESTINATIONS.map((d) => (
                <div
                  key={d.name}
                  onClick={() => navigate("/trip-planner")}
                  className="group relative h-[360px] w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-[24px] bg-black shadow-lg"
                >
                  <Img src={d.img} seed={30 + d.name.length} alt={d.name} className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.08]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold shadow">
                    <Star className="h-3 w-3 text-[#FF6A2C]" fill="currentColor" /> {d.rating}
                  </span>
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold">{d.tag}</span>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                    <div>
                      <h4 className="mb-1 text-xl font-bold text-white" style={serif}>{d.name}</h4>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB27A] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Plan this route <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    <span className="rounded-full border border-[#FF6A2C] bg-white/90 px-4 py-1.5 text-sm font-semibold text-[#FF6A2C]">
                      {d.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-10 text-center">
            <button onClick={() => navigate("/explore")} className="rounded-full bg-[#FF6A2C] px-8 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#e85a20]">
              View More
            </button>
          </Reveal>
        </div>
      </section>

      {/* =====================  TESTIMONIALS ===================== */}
      <section id="voices" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <Eyebrow>What They Say</Eyebrow>
            <h2 className="mb-10 max-w-[480px] text-4xl leading-[1.15] sm:text-5xl" style={{ ...serif, fontWeight: 600 }}>
              What Our Customer Say About Us
            </h2>

            <div className="relative min-h-[210px] rounded-[24px] border border-gray-100 bg-white p-7 shadow-[0_20px_45px_-30px_rgba(20,22,26,0.2)]">
              <Quote className="mb-3 h-6 w-6 text-[#FF6A2C]/50" />
              {VOICES.map((v, idx) => (
                <div key={v.name} className={`transition-all duration-500 ${idx === voiceIndex ? "block opacity-100" : "hidden opacity-0"}`}>
                  <p className="mb-5 leading-relaxed text-[#14161A]/85">"{v.quote}"</p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEADD] text-sm font-extrabold text-[#FF6A2C]">
                      {v.name[0]}
                    </span>
                    <div>
                      <div className="text-sm font-bold">{v.name}</div>
                      <div className="text-xs text-gray-500">{v.trip}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-[#FFB800]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-6 flex gap-2">
                {VOICES.map((v, idx) => (
                  <button
                    key={v.name}
                    onClick={() => setVoiceIndex(idx)}
                    aria-label={`Testimonial ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === voiceIndex ? "w-6 bg-[#FF6A2C]" : "w-1.5 bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          {/* 9 صور مصرية طايرة */}
          <Reveal delay={150}>
            <div className="grid grid-cols-3 gap-4">
              {[IMG.pyramids, IMG.carvings, IMG.dunes, IMG.sea, IMG.sphinx, IMG.beach, IMG.karnak, IMG.desert, IMG.journey].map(
                (src, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-float-slow overflow-hidden rounded-[1.5rem] bg-gray-100 shadow-sm"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  >
                    <Img src={src} seed={50 + i} alt="Egypt" className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" />
                  </div>
                )
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================  CTA ===================== */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <Reveal>
          <div className="flex flex-col items-center rounded-[32px] bg-[#FDEADD] px-8 py-16 text-center">
            <h3 className="mb-3 max-w-[640px] text-3xl leading-tight sm:text-4xl" style={{ ...serif, fontWeight: 600 }}>
              Let's Not Miss Your Route & Explore The <span className="text-[#FF6A2C]">Beauty</span> of Egypt
            </h3>
            <p className="mb-8 max-w-[420px] text-sm leading-relaxed text-gray-500">
              Tell Rafiq how many days you have the route builds itself, paced and ready.
            </p>
            <button
              onClick={() => navigate("/trip-planner")}
              className="rounded-full bg-[#FF6A2C] px-8 py-3.5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(255,106,44,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#e85a20]"
            >
              Get Started
            </button>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}