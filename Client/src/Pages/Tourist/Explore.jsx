import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ---------- CONFIG ----------
// Matches your actual Mongo schema: name, city, category ("Touristic" | "Historical"), imageUrl, description
const CATEGORIES = ["All", "Touristic", "Historical"];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800"; // generic Egypt fallback
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
const API_URL = `${API_BASE_URL}/places`;

const HERO_IMAGES = [
  "https://media.bookmundi.com/tour/egypt-alexandria-to-aswan-1281316-1767183707.jpg?format=auto&quality=60&width=1772",
  "https://media.bookmundi.com/tour/egypt-alexandria-to-aswan-1281299-1767183677.jpeg?format=auto&quality=60&width=1772",
  "https://media.bookmundi.com/tour/egypt-alexandria-to-aswan-1281311-1767183701.jpg?format=auto&quality=60&width=1772",
  "https://media.bookmundi.com/tour/egypt-alexandria-to-aswan-1281321-1767183717.jpg?format=auto&quality=60&width=1772",
  "https://img.magnific.com/premium-photo/pyramids-night-view-from-giza-buildings-egypt_400112-687.jpg",
];

// Normalizes whatever the API returns into the shape the UI uses.
// Your backend returns: { _id, name, city, category, imageUrl, description, createdAt, updatedAt }
function normalizePlace(raw) {
  return {
    id: raw._id ?? raw.id ?? raw.name,
    name: raw.name ?? "Unknown",
    city: raw.city ?? "",
    category: raw.category ?? "Touristic",
    desc: raw.description ?? "",
    imageUrl: raw.imageUrl && /^https?:\/\//i.test(raw.imageUrl) ? raw.imageUrl : FALLBACK_IMAGE,
  };
}

export default function Explore() {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("route_favs");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const trackRef = useRef(null);

  // ---------- API STATE ----------
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPlaces() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL, { method: "GET" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        // Supports API returning a raw array or { places: [...] } / { data: [...] }
        const list = Array.isArray(data) ? data : data.places ?? data.data ?? [];
        if (!cancelled) {
          setPlaces(list.map(normalizePlace));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load destinations");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlaces();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("route_favs", JSON.stringify([...favorites]));
  }, [favorites]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return places.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q))
    );
  }, [category, query, places]);

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir === "next" ? 520 : -520, behavior: "smooth" });
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goToPlanner = () => {
    window.scrollTo(0, 0);
    navigate("/trip-planner");
  };

  return (
    <div className="min-h-screen text-[#161614] pb-10 px-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
      />

      <header
        onMouseEnter={() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length)}
        className="relative mx-auto mt-6 h-[540px] sm:h-[640px] max-w-[1320px] overflow-hidden rounded-[40px] bg-[#0b0b0a] shadow-[0_30px_70px_-20px_rgba(22,22,20,0.15)]"
      >
        <img
          src={HERO_IMAGES[heroIndex]}
          alt="Egypt"
          className="absolute inset-0 h-full w-full scale-[1.01] object-cover opacity-85 transition-opacity duration-500"
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/10 via-black/35 to-black/85" />

        <div className="absolute top-40 right-12 z-[5] hidden sm:block rounded-3xl border border-white/50 bg-white/90 px-6 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-md">
          <div className="mb-1 text-[0.85rem] tracking-[2px] text-[#E2A856]">★★★★★</div>
          <div className="text-[1.25rem] font-bold">4.9 / 5</div>
          <div className="text-[0.68rem] font-semibold tracking-wide text-[#6E6E6A]">From 15,000+ Global Travelers</div>
        </div>

        <div className="relative z-[5] mt-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <span className="mb-4 text-xs font-bold uppercase tracking-[4px] text-[#F36926]">Curated Journeys Across Egypt</span>
          <h1
            className="mb-5 max-w-[850px] text-5xl font-medium leading-[1.15] sm:text-[4.2rem]"
            style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 4px 15px rgba(0,0,0,0.4)" }}
          >
            Discover every corner<br />of the Nile's story
          </h1>
          <p
            className="mb-9 max-w-[560px] text-[0.98rem] leading-relaxed text-white/90"
            style={{
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
              wordSpacing: "4px",
            }}
          >
            From hidden majestic desert oases to the brilliant sapphire waters of the
            Red Sea explore all 27 architectural governorates perfectly crafted for you.
          </p>
        </div>
      </header>

      {/* SEARCH */}
      <div className="relative z-20 mx-auto -mt-10 max-w-[840px] px-4">
        <div className="flex items-center gap-4 rounded-full border border-[#E8E5DD] bg-white py-2.5 pl-7 pr-2.5 shadow-[0_20px_50px_-15px_rgba(22,22,20,0.12)] transition-colors focus-within:border-[#F36926]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E6E6A" strokeWidth="2.5">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a place or city..."
            className="flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-[#6E6E6A]/70"
          />
          <span className="hidden whitespace-nowrap rounded-full bg-[#F6F3EC] px-6 py-3 text-[0.72rem] font-bold tracking-wide text-[#6E6E6A] sm:block">
            🇪🇬 Egypt Places
          </span>
        </div>
      </div>

      {/* EXPLORE */}
      <section className="mx-auto my-[90px] max-w-[1280px]">
        <div className="mb-11 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 block text-sm font-bold uppercase tracking-[3px] text-[#6E6E6A]">— Beyond Ordinary Traveling —</span>
            <h2
              className="mb-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-[3.6rem]"
              style={{ fontFamily: "'Playfair Display', serif", color: "#F36926" }}
            >
              Book your trip<br />to any place
            </h2>
            <p className="max-w-[580px] text-base leading-relaxed text-[#161614]/85">
              Filter by category or search by name — Touristic and Historical spots across Egypt.
            </p>
          </div>
          <span className="self-start rounded-full bg-[#161614] px-6 py-3 text-[0.78rem] font-semibold tracking-wide text-white">
            {loading ? "Loading..." : `${filtered.length} Destinations Active`}
          </span>
        </div>

        {/* FILTER CHIPS */}
        <div className="mb-11 flex flex-wrap gap-2.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-[22px] py-2.5 text-[0.8rem] font-semibold transition-all duration-200 ${c === category
                  ? "border-[#F36926] bg-[#F36926] text-white shadow-[0_8px_20px_rgba(243,105,38,0.35)]"
                  : "border-[#E8E5DD] bg-white text-[#6E6E6A] hover:border-[#F36926] hover:text-[#F36926]"
                }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* CARDS */}
        <div className="relative">
          <div className="mb-6 flex justify-end gap-2.5 sm:absolute sm:-top-[100px] sm:right-0 sm:mb-0">
            <button
              onClick={() => scroll("prev")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E5DD] bg-white text-[#161614] transition-all hover:border-[#F36926] hover:bg-[#F36926] hover:text-white"
              aria-label="Scroll left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={() => scroll("next")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E5DD] bg-white text-[#161614] transition-all hover:border-[#F36926] hover:bg-[#F36926] hover:text-white"
              aria-label="Scroll right"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="w-full rounded-[40px] border border-dashed border-[#E8E5DD] bg-white p-20 text-center">
              <h4 className="text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Loading destinations...</h4>
              <p className="mt-2 text-sm text-[#6E6E6A]">Please wait a moment.</p>
            </div>
          ) : error ? (
            <div className="w-full rounded-[40px] border border-dashed border-red-300 bg-white p-20 text-center">
              <h4 className="text-xl text-red-600" style={{ fontFamily: "'Playfair Display', serif" }}>Couldn't load data</h4>
              <p className="mt-2 text-sm text-[#6E6E6A]">{error}. Make sure the server is running at {API_URL}</p>
            </div>
          ) : filtered.length > 0 ? (
            <div ref={trackRef} className="flex gap-6 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filtered.map((place) => {
                const isFav = favorites.has(place.id);
                return (
                  <div
                    key={place.id}
                    className="group relative h-[390px] w-[236px] shrink-0 overflow-hidden rounded-[20px] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_-15px_rgba(243,105,38,0.25)]"
                  >
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                      className="absolute inset-0 h-full w-full scale-[1.01] object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/90" />

                    <div className="absolute inset-x-0 top-[18px] flex justify-between px-[18px]">
                      <span className="rounded-full bg-white/95 px-3.5 py-1.5 text-[0.65rem] font-bold">{place.category}</span>
                      <button
                        onClick={() => toggleFavorite(place.id)}
                        aria-label="Favorite"
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[#F36926] shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform hover:scale-110"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-5 py-7 text-center">
                      <span className="mb-1 text-[0.62rem] font-bold uppercase tracking-[2px] text-[#E2A856]">{place.city}</span>
                      <h4 className="mb-2 text-[1.6rem] font-semibold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {place.name}
                      </h4>
                      <p className="mb-4 line-clamp-2 px-2 text-[0.7rem] font-light leading-[1.4] text-white/72">{place.desc}</p>
                      <button
                        onClick={goToPlanner}
                        className="rounded-full bg-[#F36926] px-6 py-2 text-[0.72rem] font-bold text-white transition-colors hover:bg-[#d95c1c]"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full rounded-[40px] border border-dashed border-[#E8E5DD] bg-white p-20 text-center">
              <h4 className="text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>No places found</h4>
              <p className="mt-2 text-sm text-[#6E6E6A]">Try resetting your category filter or search query.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative mx-auto my-[100px] max-w-[1280px] overflow-hidden rounded-[40px] bg-cover bg-center px-10 py-[90px] text-center text-white shadow-[0_25px_55px_-15px_rgba(243,105,38,0.35)]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 55%), linear-gradient(135deg, rgba(241, 237, 235, 0.3) 0%, rgba(225, 217, 213, 0.4) 100%), url('https://img.magnific.com/premium-photo/pyramids-night-view-from-giza-buildings-egypt_400112-687.jpg')",
          backgroundAttachment: "fixed",
        }}
      >
        <h3 className="mb-3.5 text-4xl font-medium sm:text-[3.2rem]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Ready for your Egyptian story?
        </h3>
        <p className="mx-auto mb-9 max-w-[540px] text-base leading-relaxed text-white/85">
          Tell us where your heart desires to wander, and our local experts will craft a tailored itinerary around it.
        </p>
        <button
          onClick={goToPlanner}
          className="rounded-full bg-white px-10 py-3.5 text-[0.9rem] font-bold text-[#C7450B] shadow-[0_10px_25px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5"
        >
          Plan My Trip
        </button>
      </section>
    </div>
  );
}