import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaLocationDot,
  FaEnvelope,
  FaPhone,
  FaEarthAfrica,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#071320] text-white">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/images/pattern.png')] bg-repeat"></div>

      <div className="relative px-8 lg:px-20 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ================= Left Section ================= */}

          <div>

            {/* Logo */}

            <div className="flex items-center gap-4 mb-6">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500 shadow-lg">
                <FaEarthAfrica className="h-7 w-7 text-white" />
              </div>

              <div>
                <h2 className="text-4xl font-bold font-serif">
                  Rafiq
                </h2>

                <p className="text-sm text-orange-400">
                  Explore Egypt
                </p>
              </div>

            </div>

            {/* Description */}

            <p className="text-gray-400 leading-7">
              Discover Egypt's timeless beauty with trusted local guides,
              unforgettable adventures, and memories that last forever.
            </p>

            {/* Social Icons */}

            <div className="flex gap-3 mt-7">

              {[FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn].map(
                (Icon, index) => (
                  <button
                    key={index}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:bg-orange-500 hover:border-orange-500 hover:scale-105"
                  >
                    <Icon size={16} />
                  </button>
                )
              )}

            </div>

          </div>

          {/* ================= Quick Links ================= */}

          <div>

            <h3 className="mb-5 text-xl font-semibold">
              Quick Links
            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>
                <a href="/" className="hover:text-orange-400 transition">
                  Home
                </a>
              </li>

              <li>
                <a href="/places" className="hover:text-orange-400 transition">
                  Explore Places
                </a>
              </li>

              <li>
                <a href="/guides" className="hover:text-orange-400 transition">
                  Tour Guides
                </a>
              </li>

              <li>
                <a href="/community" className="hover:text-orange-400 transition">
                  Community
                </a>
              </li>

            </ul>

          </div>

          {/* ================= Explore ================= */}

          <div>

            <h3 className="mb-5 text-xl font-semibold">
              Explore Egypt
            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>Pyramids of Giza</li>

              <li>Luxor & Aswan</li>

              <li>Siwa Oasis</li>

              <li>Red Sea Adventures</li>

              <li>Nile Cruises</li>

            </ul>

          </div>

          {/* ================= Contact ================= */}

          <div>

            <h3 className="mb-5 text-xl font-semibold">
              Contact Us
            </h3>

            <div className="space-y-5 text-gray-400">

              <div className="flex items-center gap-3">
                <FaLocationDot className="text-orange-500 text-lg" />
                <span>Cairo, Egypt</span>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="text-orange-500 text-lg" />
                <span>support@rafiq.com</span>
              </div>

              <div className="flex items-center gap-3">
                <FaPhone className="text-orange-500 text-lg" />
                <span>+20 100 123 4567</span>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col lg:flex-row items-center justify-between gap-4">

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Rafiq. All Rights Reserved.
          </p>

          <div className="flex gap-8">

            <a
              href="#"
              className="text-sm text-gray-400 hover:text-orange-400 transition"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="text-sm text-gray-400 hover:text-orange-400 transition"
            >
              Terms & Conditions
            </a>

            <a
              href="#"
              className="text-sm text-gray-400 hover:text-orange-400 transition"
            >
              Cookies
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;