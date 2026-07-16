import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Calendar, SlidersHorizontal, Cpu, ChevronRight, CalendarRange, Clock, ExternalLink } from 'lucide-react';

function TripPlanner() {
  const [city, setCity] = useState('cairo');
  const [budget, setBudget] = useState('standard');
  const [days, setDays] = useState(3);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------- HERO CINEMATIC ENGINE STATE ----------
  const heroRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState(0);

  const WIKI_BASE = "https://commons.wikimedia.org/wiki/Special:FilePath/";
  const wiki = (name, w = 1600) => `${WIKI_BASE}${encodeURIComponent(name)}?width=${w}`;
  const mapEmbed = (query) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  // قاعدة بيانات كاملة 7 أيام لكل المدن مع إحداثيات خرائط جوجل لكل مدينة
  const egyptDatabase = {
    cairo: {
      title: "Cairo & Giza Exploration",
      subtitle: "A tailored chronological odyssey across thousand-year-old structural epochs.",
      heroImg: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1600",
      googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.39497042503!2d31.119602781476935!3d30.059483811252044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296f8423b75!2sCairo%20Governorate%2C%20Egypt!5e0!3m2!1sen!2seg!4v1710000000000!5m2!1sen!2seg",
      itinerary: [
        { day: "Day 1", title: "Giza Plateau & Great Pyramids", img: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=600", desc: "Full exploration of Khufu, Khafre, and Menkaure coordinates alongside Sphinx Valley.", time: "08:30 AM" },
        { day: "Day 2", title: "Grand Egyptian Museum VIP", img: "https://images.unsplash.com/photo-1629721671030-a83edbb11237?q=80&w=600", desc: "Tracing royal Tutankhamun collections inside state-of-the-art exhibition layouts.", time: "10:00 AM" },
        { day: "Day 3", title: "Islamic Citadel & Sultan Hassan", img: "https://images.unsplash.com/photo-1600577916048-804c9191e36c?q=80&w=600", desc: "Analyzing massive Mamluk structural architecture and high alabaster mosque views.", time: "09:00 AM" },
        { day: "Day 4", title: "Khan El-Khalili Alleys", img: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=600", desc: "Navigating historical gold and spice markets with traditional El-Fishawy tea nodes.", time: "04:00 PM" },
        { day: "Day 5", title: "Coptic Cairo & Hanging Church", img: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?q=80&w=600", desc: "Discovering ancient Roman fortress bastions and 3rd-century basilica architectural grids.", time: "10:30 AM" },
        { day: "Day 6", title: "NMEC & Royal Mummies", img: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=600", desc: "Walking through the structural chronological display of Egypt's sovereign lineage.", time: "11:00 AM" },
        { day: "Day 7", title: "Nile Luxury Yacht Cruise", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=600", desc: "Premium farewell dinner circuit sailing past glowing Cairo urban skyscrapers.", time: "07:30 PM" }
      ]
    },
    alexandria: {
      title: "Alexandria Coastal Journey",
      subtitle: "A majestic track tracing Greco-Roman blueprints alongside the breezy Mediterranean.",
      heroImg: "https://images.unsplash.com/photo-1628135111195-20703c94f57c?q=80&w=1600",
      googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109164.71762118331!2d29.832267597265633!3d31.22411082269222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f5c49126710fd3%3A0xb4e0c4a1d347d0e4!2sAlexandria%2C%20Alexandria%20Governorate!5e0!3m2!1sen!2seg!4v1710000000000!5m2!1sen!2seg",
      itinerary: [
        { day: "Day 1", title: "Bibliotheca Alexandrina Complex", img: "https://images.unsplash.com/photo-1607510793132-723ee91e13fa?q=80&w=600", desc: "Exploring the giant tilting sun-disk structure housing millions of rare architectural files.", time: "09:30 AM" },
        { day: "Day 2", title: "Qaitbay Citadel Shore Fortress", img: "https://images.unsplash.com/photo-1551041777-575d3855ca71?q=80&w=600", desc: "Roaming sea-facing parapets constructed over the legendary Pharos Lighthouse remnants.", time: "10:00 AM" },
        { day: "Day 3", title: "Catacombs of Kom El Shoqafa", img: "https://images.unsplash.com/photo-1560243563-062bfc001d68?q=60&w=600", desc: "Descending subterranean tunnels showcasing unique Pharaonic-Roman hybrid art reliefs.", time: "09:00 AM" },
        { day: "Day 4", title: "Royal Montaza Garden Walk", img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600", desc: "Strolling through exclusive Florentine palace grounds overlooking hidden rocky coves.", time: "03:00 PM" },
        { day: "Day 5", title: "Roman Amphitheater Excavations", img: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=600", desc: "Inspecting marble spectator grids and the adjacent Villa of the Birds mosaic designs.", time: "11:00 AM" },
        { day: "Day 6", title: "Royal Jewelry Museum Halls", img: "https://images.unsplash.com/photo-1608958416715-bc45e7f80db4?q=80&w=600", desc: "Analyzing high-carat masterworks inside a magnificent aristocratic palace layout.", time: "12:00 PM" },
        { day: "Day 7", title: "Stanley Bridge Golden Hour", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600", desc: "Fine panoramic dining experience with dramatic architectural open views of the coastline.", time: "05:30 PM" }
      ]
    },
    hurghada: {
      title: "Hurghada Coral & Desert Experience",
      subtitle: "A luxury multi-terrain schedule blending marine expeditions with deep mountain safaris.",
      heroImg: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=1600",
      googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113911.33418579624!2d33.72995972827146!3d27.251415174300342!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b6167448db5db5%3A0x6b4ef82df31ec0!2sHurghada%2C%20Red%20Sea%20Governorate!5e0!3m2!1sen!2seg!4v1710000000000!5m2!1sen!2seg",
      itinerary: [
        { day: "Day 1", title: "Premium Marina Yacht Hub", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600", desc: "Arriving along the sleek modern harbor lane for sunset cocktail briefings.", time: "06:00 PM" },
        { day: "Day 2", title: "Orange Bay Private Island", img: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=600", desc: "Private speedboat transit to white-sand luxury hammocks set directly in shallow lagoons.", time: "08:30 AM" },
        { day: "Day 3", title: "Deep Sea Scuba Submerge", img: "https://images.unsplash.com/photo-1544551763-8dd44758c2dd?q=80&w=600", desc: "Two boat diving drops exploring protected coral walls with professional PADI teams.", time: "08:00 AM" },
        { day: "Day 4", title: "Sahara Desert Quad Safari", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600", desc: "Racing cross-country dunes on powerful ATVs to reach a remote star-gazing Bedouin valley.", time: "03:00 PM" },
        { day: "Day 5", title: "Sindbad Submarine Deep Node", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600", desc: "Real underwater dive to 22 meters depth to monitor pristine Red Sea maritime eco-systems.", time: "10:00 AM" },
        { day: "Day 6", title: "El Gouna Lagoon Architecture", img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=600", desc: "Day trip investigating upscale eco-resort layouts, golf courses, and marina designs.", time: "09:30 AM" },
        { day: "Day 7", title: "Grand Aquarium Tech Tour", img: "https://tripventura.com/cdn/shop/files/10_83f945b2-e248-40c5-8d90-a68d38528cb5.jpg?v=1748413384&width=1920", desc: "Walking through mega indoor shark tunnels before customized luxury farewell gala events.", time: "11:00 AM" }
      ]
    },
    dahab: {
      title: "Dahab Nomad Experience",
      subtitle: "A creative, laid-back week charting famous marine sinkholes and rocky mountain eco-grids.",
      heroImg: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600",
      googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28362.47466549232!2d34.50280918731333!3d28.500424564855584!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ee7ecb15555555%3A0x6291a58c42a59d9c!2sDahab%2C%20South%20Sinai%20Governorate!5e0!3m2!1sen!2seg!4v1710000000000!5m2!1sen!2seg",
      itinerary: [
        { day: "Day 1", title: "Lighthouse Coral Reef Check", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600", desc: "Easy beach-entry snorkeling along the vibrant artsy seaside walking promenade.", time: "10:00 AM" },
        { day: "Day 2", title: "Blue Hole Subterranean Rift", img: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=600", desc: "Witnessing the world-renowned 120m deep blue marine chasm and reef fringes.", time: "08:00 AM" },
        { day: "Day 3", title: "Ras Abu Galum Boat Safari", img: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkn5zlQoauoowjUj0man7WbMwikIUlbiFnMLnLxfa3Bv5RuXG0U1z1MgZFM-LumVrz5lPBTTVaMDqni6NAEHlUQRQ9ZVej0EYo43hNg_WjL1wcjsCOmoIucizi7nR8tr9ZYFWmB=s1360-w1360-h1020-rw", desc: "Cruising by speed-vessel to an isolated national park protected settlement node.", time: "07:30 AM" },
        { day: "Day 4", title: "Blue Lagoon Turquoise Spit", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600", desc: "Relaxing within minimalist bamboo eco-structures inside ultra-flat windsurfing lagoons.", time: "09:00 AM" },
        { day: "Day 5", title: "Wadi Gnai Granite Canyons", img: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600", desc: "Adventurous rock bouldering tour through narrow multi-colored desert stone valleys.", time: "03:00 PM" },
        { day: "Day 6", title: "Laguna Beach Sunset Session", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600", desc: "Strolling the sandy dynamic spit capturing standard panoramic Sinai mountain vistas.", time: "05:00 PM" },
        { day: "Day 7", title: "Mount Sinai Midnight Ascent", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600", desc: "Epic overnight climb to the sacred peak for a jaw-dropping mountain-top sunrise.", time: "11:00 PM" }
      ]
    },
    nuweiba: {
      title: "Nuweiba Deep Retreat",
      subtitle: "The ultimate minimalist digital-detox week along raw mountain-meets-ocean arrays.",
      heroImg: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600",
      googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56353.49129536836!2d34.62923053491871!3d28.995015091722736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ee072a44444445%3A0xd6fe6b1bcfd189bf!2sNuweiba%2C%20South%20Sinai%20Governorate!5e0!3m2!1sen!2seg!4v1710000000000!5m2!1sen!2seg",
      itinerary: [
        { day: "Day 1", title: "Maagana Bay Check-In Node", img: "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?q=80&w=600", desc: "Setting up basecamp inside high-end wooden beach cottages over looking Saudi borders.", time: "02:00 PM" },
        { day: "Day 2", title: "Colored Canyon Labyrinth", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600", desc: "Deep multi-mile hike inside stone corridors displaying vibrant oxidized mineral bands.", time: "07:00 AM" },
        { day: "Day 3", title: "Castle Zaman Stone Luxury", img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600", desc: "Premium day-pass swimming in hillside stone pools with organic slow-cooked meats.", time: "11:30 AM" },
        { day: "Day 4", title: "Ain Khudra Isolated Oasis", img: "https://images.dailynewsegypt.com/2020/06/FB_IMG_1591695286089.jpg", desc: "Off-road 4x4 expedition to a remote freshwater spring feeding huge date palm groves.", time: "08:00 AM" },
        { day: "Day 5", title: "Wishwashi Hidden Canyon Pool", img: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=600", desc: "Climbing through narrow granite crevices to cliff-jump into a emerald rainwater reservoir.", time: "09:00 AM" },
        { day: "Day 6", title: "Tarabin Beach Bedouin Night", img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=600", desc: "Traditional slow-roasted campfire dinner backed by ancient string instrument metrics.", time: "06:30 PM" },
        { day: "Day 7", title: "Ras Shaitan Coastal Farewell", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600", desc: "Sunrise deep snorkeling round intricate shallow anemone fields before check-out flows.", time: "06:00 AM" }
      ]
    },
    luxor: {
      title: "Luxor Open-Air Museum Trail",
      subtitle: "A regal week uncovering the greatest concentration of ancient monuments on Earth.",
      heroImg: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg"),
      googleMapUrl: mapEmbed("Luxor, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Karnak Temple Grand Hypostyle", img: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg", 600), desc: "Walking among 134 towering sandstone columns inside the largest religious complex ever built.", time: "08:00 AM" },
        { day: "Day 2", title: "Valley of the Kings Descent", img: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg", 600), desc: "Entering royal rock-cut tombs carved deep into the western necropolis cliffs.", time: "07:30 AM" },
        { day: "Day 3", title: "Luxor Temple by Night", img: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg", 600), desc: "Illuminated colonnades and colossal statues of Ramesses II under the desert sky.", time: "07:00 PM" },
        { day: "Day 4", title: "Hatshepsut Mortuary Terraces", img: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg", 600), desc: "Ascending the dramatic tiered terraces built into the cliffside of Deir el-Bahari.", time: "08:30 AM" },
        { day: "Day 5", title: "Hot Air Balloon Sunrise", img: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg", 600), desc: "Drifting silently above the Theban necropolis as the sun rises over the Nile Valley.", time: "05:30 AM" },
        { day: "Day 6", title: "Colossi of Memnon & Medinet Habu", img: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg", 600), desc: "Standing before the twin stone sentinels guarding the ruined memorial temple grounds.", time: "09:30 AM" },
        { day: "Day 7", title: "Nile Felucca Farewell Sail", img: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg", 600), desc: "A slow traditional sailboat glide past palm-lined banks as Luxor's temples fade into dusk.", time: "05:00 PM" }
      ]
    },
    aswan: {
      title: "Aswan Nubian Nile Escape",
      subtitle: "A tranquil southern week of granite islands, temples and timeless Nubian culture.",
      heroImg: wiki("Aswan Philae temple Nile view.jpg"),
      googleMapUrl: mapEmbed("Aswan, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Philae Temple Island Crossing", img: wiki("Aswan Philae temple Nile view.jpg", 600), desc: "Boating out to the reassembled island sanctuary dedicated to the goddess Isis.", time: "09:00 AM" },
        { day: "Day 2", title: "High Dam & Nubian Museum", img: wiki("Aswan Philae temple Nile view.jpg", 600), desc: "Understanding the modern engineering marvel alongside curated Nubian heritage exhibits.", time: "10:00 AM" },
        { day: "Day 3", title: "Nubian Village by Felucca", img: wiki("Aswan Philae temple Nile view.jpg", 600), desc: "Sailing to colorful lakeside houses for traditional tea and handmade craft markets.", time: "02:00 PM" },
        { day: "Day 4", title: "Unfinished Obelisk Quarry", img: wiki("Aswan Philae temple Nile view.jpg", 600), desc: "Examining the largest known ancient obelisk, abandoned mid-carving in granite bedrock.", time: "08:30 AM" },
        { day: "Day 5", title: "Elephantine Island Ruins", img: wiki("Aswan Philae temple Nile view.jpg", 600), desc: "Wandering ancient Nilometer chambers and ruins overlooking the river's calmest bend.", time: "09:00 AM" },
        { day: "Day 6", title: "Abu Simbel Day Excursion", img: wiki("Aswan Philae temple Nile view.jpg", 600), desc: "A dawn desert drive to Ramesses II's colossal rock-hewn temple facade near the Sudanese border.", time: "04:00 AM" },
        { day: "Day 7", title: "Sunset Felucca Nile Cruise", img: wiki("Aswan Philae temple Nile view.jpg", 600), desc: "Drifting between granite boulders and botanical islands as the sky turns amber.", time: "05:30 PM" }
      ]
    },
    sharm: {
      title: "Sharm El Sheikh Reef Riviera",
      subtitle: "A polished resort week pairing world-class reefs with Sinai's mountain interior.",
      heroImg: wiki("Sharm El Sheikh Panoramic.jpg"),
      googleMapUrl: mapEmbed("Sharm El Sheikh, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Naama Bay Promenade Arrival", img: wiki("Sharm El Sheikh Panoramic.jpg", 600), desc: "Settling into the lively palm-lined boardwalk lined with cafés and dive centers.", time: "05:00 PM" },
        { day: "Day 2", title: "Ras Mohammed National Park", img: wiki("Sharm El Sheikh Panoramic.jpg", 600), desc: "Snorkeling sheer coral drop-offs where the Gulf of Aqaba meets the Red Sea proper.", time: "08:00 AM" },
        { day: "Day 3", title: "Tiran Island Boat Dive", img: wiki("Sharm El Sheikh Panoramic.jpg", 600), desc: "Exploring four legendary reef systems in the narrow strait between continents.", time: "08:30 AM" },
        { day: "Day 4", title: "White Island Sandbar Escape", img: wiki("Sharm El Sheikh Panoramic.jpg", 600), desc: "Wading onto a pristine mid-sea sandbank for a floating lunch spread.", time: "10:00 AM" },
        { day: "Day 5", title: "St. Catherine's Monastery", img: wiki("Sharm El Sheikh Panoramic.jpg", 600), desc: "A mountain transfer to the ancient monastery resting at the base of biblical peaks.", time: "07:00 AM" },
        { day: "Day 6", title: "Soho Square Evening Circuit", img: wiki("Sharm El Sheikh Panoramic.jpg", 600), desc: "Fountain shows, boutique shopping and open-air dining beneath desert stars.", time: "07:30 PM" },
        { day: "Day 7", title: "Sunset Catamaran Farewell", img: wiki("Sharm El Sheikh Panoramic.jpg", 600), desc: "A relaxed sail along the coastline with the Sinai mountains glowing behind the bay.", time: "05:00 PM" }
      ]
    },
    siwa: {
      title: "Siwa Oasis Desert Retreat",
      subtitle: "A remote week of salt lakes, mud-brick ruins and star-drenched dunes.",
      heroImg: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg"),
      googleMapUrl: mapEmbed("Siwa Oasis, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Shali Fortress Mud-Brick Ruins", img: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg", 600), desc: "Climbing the crumbling multi-storey citadel that once sheltered the entire oasis.", time: "04:00 PM" },
        { day: "Day 2", title: "Temple of the Oracle", img: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg", 600), desc: "Standing where Alexander the Great once sought prophecy from Amun's priests.", time: "09:00 AM" },
        { day: "Day 3", title: "Great Sand Sea Dune Bashing", img: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg", 600), desc: "4x4 convoy across golden dune fields into one of the world's largest sand seas.", time: "02:00 PM" },
        { day: "Day 4", title: "Cleopatra's Spring Swim", img: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg", 600), desc: "Floating in a natural spring surrounded by centuries-old date palm groves.", time: "11:00 AM" },
        { day: "Day 5", title: "Fatnas Island Sunset Lagoon", img: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg", 600), desc: "A quiet salt-lake islet perfect for watching the desert sky ignite in color.", time: "05:30 PM" },
        { day: "Day 6", title: "Salt Lake Flotation Session", img: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg", 600), desc: "Effortless floating in mineral-rich turquoise pools ringed by white salt crusts.", time: "10:00 AM" },
        { day: "Day 7", title: "Bedouin Desert Camp Night", img: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg", 600), desc: "Overnight stargazing camp with traditional music beneath an untouched desert sky.", time: "08:00 PM" }
      ]
    },
    matrouh: {
      title: "Marsa Matrouh Riviera Escape",
      subtitle: "A breezy Mediterranean week of powder-white coves and turquoise lagoons.",
      heroImg: 'https://betamedia.experienceegypt.eg/media/experienceegypt/img/Original/2022/9/27/2022_9_27_19_40_57_462.png',
      googleMapUrl: mapEmbed("Marsa Matrouh, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Rommel's Beach Arrival", img: "https://d2kihw5e8drjh5.cloudfront.net/eyJidWNrZXQiOiJ1dGEtaW1hZ2VzIiwia2V5IjoicGxhY2VfaW1nLzc5NjYyNjM1MzhlMjRkM2Q5NjQ0ZGJjZWQ2ZTdjMzMwIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo2NDAsImhlaWdodCI6NjQwLCJmaXQiOiJpbnNpZGUifSwicm90YXRlIjpudWxsLCJ0b0Zvcm1hdCI6ICJ3ZWJwIn19", desc: "Settling onto the historic wartime shoreline now lined with beach clubs.", time: "04:00 PM" },
        { day: "Day 2", title: "Cleopatra's Bath Rock Pools", img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/e6/27/99/caption.jpg?w=1400&h=800&s=1", desc: "Swimming through natural rock formations said to be the queen's private bathing spot.", time: "10:00 AM" },
        { day: "Day 3", title: "Agiba Beach Cliffside Cove", img: "https://cdn.sanity.io/images/we0tdimr/production/d62b9324632e5988b344d07f31ec78e2353470d2-1920x1245.jpg?rect=0,83,1920,1080&w=640&h=360&q=70&auto=format", desc: "Descending dramatic limestone cliffs to a hidden turquoise inlet.", time: "11:00 AM" },
        { day: "Day 4", title: "Ubayyad Lagoon Sandbar", img: "https://gasparillaboattours.com/wp-content/uploads/2025/06/tour-sandbar-private-1024x683.jpg", desc: "A shallow, glass-clear lagoon perfect for a slow floating afternoon.", time: "01:00 PM" },
        { day: "Day 5", title: "Siwa Road Desert Detour", img: "https://www.travelistia.com/wp-content/uploads/2026/03/IMG_6429-scaled.jpg", desc: "A scenic inland drive through white-rock desert formations south of the coast.", time: "09:00 AM" },
        { day: "Day 6", title: "Rommel's Cave War Museum", img: "https://amayei.nyc3.digitaloceanspaces.com/2018/09/577839_0.jpg", desc: "Tracing WWII desert campaign history inside a coastal cave headquarters.", time: "12:00 PM" },
        { day: "Day 7", title: "Sunset Corniche Promenade", img: "https://www.asergeev.com/pictures/archives/2014/1406/jpeg/01.jpg", desc: "A relaxed farewell stroll along the bay as fishing boats return at dusk.", time: "06:00 PM" }
      ]
    },
    fayoum: {
      title: "Fayoum Oasis & Lake Escape",
      subtitle: "A gentle week of waterwheels, desert waterfalls and Lake Qarun's still horizons.",
      heroImg: wiki("MadinatFayyumWaterWheel.jpg"),
      googleMapUrl: mapEmbed("Fayoum, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Medinet Al Fayoum Waterwheels", img: wiki("MadinatFayyumWaterWheel.jpg", 600), desc: "Photographing the centuries-old wooden waterwheels still turning along the canal.", time: "10:00 AM" },
        { day: "Day 2", title: "Wadi El Rayan Waterfalls", img: wiki("MadinatFayyumWaterWheel.jpg", 600), desc: "Egypt's only desert waterfalls, framed by golden dunes and quiet lakes.", time: "08:30 AM" },
        { day: "Day 3", title: "Lake Qarun Birdwatching Sail", img: wiki("MadinatFayyumWaterWheel.jpg", 600), desc: "A calm boat ride across one of the world's oldest natural lakes.", time: "07:00 AM" },
        { day: "Day 4", title: "Wadi Al-Hitan Whale Valley", img: wiki("MadinatFayyumWaterWheel.jpg", 600), desc: "A UNESCO desert site preserving 40-million-year-old fossilized whale skeletons.", time: "09:00 AM" },
        { day: "Day 5", title: "Tunis Village Pottery Studios", img: wiki("MadinatFayyumWaterWheel.jpg", 600), desc: "Hands-on ceramics workshops in a hillside artist colony overlooking the lake.", time: "11:00 AM" },
        { day: "Day 6", title: "Qasr Qarun Temple Ruins", img: wiki("MadinatFayyumWaterWheel.jpg", 600), desc: "Exploring a well-preserved Ptolemaic temple at the desert's fertile edge.", time: "09:30 AM" },
        { day: "Day 7", title: "Sunset Dune Picnic", img: wiki("MadinatFayyumWaterWheel.jpg", 600), desc: "A quiet farewell picnic on soft sand as the lake mirrors the evening sky.", time: "05:30 PM" }
      ]
    },
    portsaid: {
      title: "Port Said Canal Gateway",
      subtitle: "A distinctive week of colonial architecture and ceaseless Suez Canal traffic.",
      heroImg: wiki("Evergreen container ship in Suez Canal (4171874814).jpg"),
      googleMapUrl: mapEmbed("Port Said, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Suez Canal Ship-Watching Pier", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Watching massive container vessels glide through the narrow canal channel.", time: "05:00 PM" },
        { day: "Day 2", title: "Port Said Military Museum", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Tracing the canal city's pivotal 20th-century conflicts and maritime history.", time: "10:00 AM" },
        { day: "Day 3", title: "Colonial Corniche Architecture Walk", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Strolling wooden balconied facades built during the canal's 19th-century boom.", time: "04:00 PM" },
        { day: "Day 4", title: "Port Fouad Ferry Crossing", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "A free harbor ferry ride offering close-up views of passing cargo giants.", time: "11:00 AM" },
        { day: "Day 5", title: "Al Salam Mosque Visit", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Admiring intricate tilework inside the city's grandest waterfront mosque.", time: "09:00 AM" },
        { day: "Day 6", title: "Duty-Free Market Circuit", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Browsing the city's famed tax-free shopping streets near the harbor.", time: "01:00 PM" },
        { day: "Day 7", title: "Lighthouse Sunset Farewell", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Watching the historic 1869 lighthouse glow as canal traffic continues below.", time: "06:00 PM" }
      ]
    },
    ismailia: {
      title: "Ismailia Garden City Escape",
      subtitle: "A leafy canal-side week of lakeside gardens and quiet colonial charm.",
      heroImg: wiki("Evergreen container ship in Suez Canal (4171874814).jpg"),
      googleMapUrl: mapEmbed("Ismailia, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Lake Timsah Promenade", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "An evening walk along the tranquil lake where the canal widens into calm water.", time: "05:30 PM" },
        { day: "Day 2", title: "Ismailia Museum Antiquities", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "A compact but rich collection tracing the canal region's ancient roots.", time: "10:00 AM" },
        { day: "Day 3", title: "De Lesseps House Heritage Tour", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Visiting the preserved residence of the canal's original French engineer.", time: "11:00 AM" },
        { day: "Day 4", title: "Garden City Tree-Lined Streets", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Cycling past elegant villas built during the canal's founding era.", time: "09:00 AM" },
        { day: "Day 5", title: "Canal-Side Fishing Excursion", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "A relaxed local boat trip watching freighters pass at close range.", time: "07:00 AM" },
        { day: "Day 6", title: "Suez Canal Authority Panorama", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "A viewpoint overlooking the canal's control point and passing convoys.", time: "12:00 PM" },
        { day: "Day 7", title: "Timsah Lakeside Farewell Dinner", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "A calm waterfront dinner as lights reflect off the still lake surface.", time: "07:00 PM" }
      ]
    },
    suez: {
      title: "Suez Canal Southern Gateway",
      subtitle: "A striking week where Africa and Asia meet across the canal's southern mouth.",
      heroImg: wiki("Evergreen container ship in Suez Canal (4171874814).jpg"),
      googleMapUrl: mapEmbed("Suez, Egypt"),
      itinerary: [
        { day: "Day 1", title: "Southern Canal Mouth Viewpoint", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Watching tankers exit into the Red Sea from the canal's historic southern gate.", time: "05:00 PM" },
        { day: "Day 2", title: "1973 War Panorama Museum", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "A striking rotunda depicting the canal crossing during the October War.", time: "10:00 AM" },
        { day: "Day 3", title: "Ain Sokhna Coastal Day Trip", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "A short drive to calm Red Sea beaches framed by dry mountain backdrops.", time: "08:30 AM" },
        { day: "Day 4", title: "Suez Canal Bridge Crossing", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Driving across the towering Al-Salam Bridge linking Africa to the Sinai.", time: "11:00 AM" },
        { day: "Day 5", title: "Old Suez Port Quarter Walk", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Wandering weathered harbor streets that once anchored global trade routes.", time: "09:00 AM" },
        { day: "Day 6", title: "Monastery of St. Anthony Excursion", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "A desert transfer to one of Christianity's oldest working monasteries.", time: "07:00 AM" },
        { day: "Day 7", title: "Gulf of Suez Sunset Farewell", img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 600), desc: "Closing the trip watching light fade over the strait where two seas connect.", time: "06:00 PM" }
      ]
    }
  };

  const currentData = egyptDatabase[city] || egyptDatabase['cairo'];

  const [layerImages, setLayerImages] = useState([currentData.heroImg, currentData.heroImg]);

  // Crossfade the hero background whenever the destination changes
  useEffect(() => {
    const inactiveIndex = activeLayer === 0 ? 1 : 0;
    setLayerImages(prev => {
      const next = [...prev];
      next[inactiveIndex] = currentData.heroImg;
      return next;
    });
    const t = setTimeout(() => setActiveLayer(inactiveIndex), 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // Mouse-driven 3D parallax tilt on the hero
  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width - 0.5) * 26;
    const py = ((e.clientY - rect.top) / rect.height - 0.5) * 26;
    setParallax({ x: px, y: py });
  };
  const handleHeroMouseLeave = () => setParallax({ x: 0, y: 0 });

  // Floating ambient particles (generated once, drift upward endlessly)
  const heroParticles = useMemo(() => Array.from({ length: 45 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 14 + 12,
    delay: Math.random() * 14,
    drift: (Math.random() - 0.5) * 120
  })), []);

  const handleGeneratePlan = (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedPlan(null);

    setTimeout(() => {
      const customizedPlan = currentData.itinerary.slice(0, parseInt(days));
      setGeneratedPlan(customizedPlan);
      setActiveDayIndex(0);
      setLoading(false);
    }, 800);
  };

  const destinations = [
    { id: 'cairo', label: 'Cairo', img: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=200' },
    { id: 'alexandria', label: 'Alexandria', img: 'https://images.unsplash.com/photo-1628135111195-20703c94f57c?q=80&w=200' },
    { id: 'luxor', label: 'Luxor', img: wiki("Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 144.jpg", 200) },
    { id: 'aswan', label: 'Aswan', img: wiki("Aswan Philae temple Nile view.jpg", 200) },
    { id: 'hurghada', label: 'Hurghada', img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=200' },
    { id: 'sharm', label: 'Sharm El Sheikh', img: wiki("Sharm El Sheikh Panoramic.jpg", 200) },
    { id: 'dahab', label: 'Dahab', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=200' },
    { id: 'nuweiba', label: 'Nuweiba', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=200' },
    { id: 'siwa', label: 'Siwa Oasis', img: wiki("Siwa Oasis, Houses in the desert, Egypt.jpg", 200) },
    { id: 'matrouh', label: 'Marsa Matrouh', img: 'https://betamedia.experienceegypt.eg/media/experienceegypt/img/Original/2022/9/27/2022_9_27_19_40_57_462.png'},
    { id: 'fayoum', label: 'Fayoum', img: wiki("MadinatFayyumWaterWheel.jpg", 200) },
    { id: 'portsaid', label: 'Port Said', img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 200) },
    { id: 'ismailia', label: 'Ismailia', img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 200) },
    { id: 'suez', label: 'Suez', img: wiki("Evergreen container ship in Suez Canal (4171874814).jpg", 200) }
  ];

  return (
    <div className="relative" style={{ backgroundColor: '#fdfcf7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* 1. CINEMATIC HERO DESIGN BLOCK */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative overflow-hidden flex flex-col justify-between pt-12"
        style={{ minHeight: '90vh' }}>

        {/* PARALLAX + KEN BURNS + CROSSFADE BACKGROUND LAYERS */}
        <div
          className="hero-parallax-wrapper"
          style={{ transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }}>
          <div
            className="hero-bg-animated"
            style={{ backgroundImage: `url(${layerImages[0]})`, opacity: activeLayer === 0 ? 1 : 0 }}
          ></div>
          <div
            className="hero-bg-animated hero-bg-animated--alt"
            style={{ backgroundImage: `url(${layerImages[1]})`, opacity: activeLayer === 1 ? 1 : 0 }}
          ></div>
        </div>

        {/* FLOATING AMBIENT PARTICLES */}
        <div className="hero-particles-layer">
          {heroParticles.map(p => (
            <span
              key={p.id}
              className="hero-particle"
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--drift': `${p.drift}px`
              }}
            ></span>
          ))}
        </div>

        <div className="absolute top-0 left-0 w-full h-full z-[2]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(15,20,25,0.95) 100%)' }}></div>

        <div className="relative text-center text-white my-auto pt-8 z-[3] max-w-7xl mx-auto px-4 w-full">
          <h1 className="text-5xl md:text-7xl font-bold mb-3 italic" style={{ letterSpacing: '-1.5px', fontFamily: "'Playfair Display', serif" }}>
            Design Your Perfect Stay
          </h1>
          <p className="text-lg opacity-75 max-w-[600px] mx-auto font-light mb-6 text-white/50">
            Tell us your duration. We formulate tailored structural digital itineraries automatically.
          </p>

          {/* GLASSMORPHISM FILTER PANEL */}
          <div className="mx-auto" style={{ maxWidth: '950px' }}>
            <form onSubmit={handleGeneratePlan}
              className="p-4 rounded-[2rem] border shadow-lg flex flex-col md:flex-row items-center gap-4"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderColor: 'rgba(255, 255, 255, 0.18)'
              }}>

              {/* Selector 1: Destination */}
              <div className="flex items-center text-left px-4 py-1 flex-1 w-full border-white/20 md:border-r border-b md:border-b-0 pb-3 md:pb-1">
                <MapPin className="text-white opacity-60 w-5 h-5 mr-2.5 shrink-0" />
                <div className="flex-1">
                  <label className="block text-white/50 font-bold tracking-wider mb-0 text-[0.65rem]">DESTINATION</label>
                  <select className="w-full bg-transparent text-white border-0 p-0 font-semibold shadow-none focus:outline-none focus:ring-0 text-sm cursor-pointer"
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setGeneratedPlan(null); }}>
                    <option value="cairo" className="text-gray-900">Cairo Region</option>
                    <option value="alexandria" className="text-gray-900">Alexandria Coast</option>
                    <option value="luxor" className="text-gray-900">Luxor Monuments</option>
                    <option value="aswan" className="text-gray-900">Aswan Nile South</option>
                    <option value="hurghada" className="text-gray-900">Hurghada Riviera</option>
                    <option value="sharm" className="text-gray-900">Sharm El Sheikh</option>
                    <option value="dahab" className="text-gray-900">Dahab Paradise</option>
                    <option value="nuweiba" className="text-gray-900">Nuweiba Camps</option>
                    <option value="siwa" className="text-gray-900">Siwa Oasis</option>
                    <option value="matrouh" className="text-gray-900">Marsa Matrouh</option>
                    <option value="fayoum" className="text-gray-900">Fayoum Lakes</option>
                    <option value="portsaid" className="text-gray-900">Port Said Canal</option>
                    <option value="ismailia" className="text-gray-900">Ismailia Garden City</option>
                    <option value="suez" className="text-gray-900">Suez Gateway</option>
                  </select>
                </div>
              </div>

              {/* Selector 2: Trip Duration Selector */}
              <div className="flex items-center text-left px-4 py-1 flex-1 w-full border-white/20 md:border-r border-b md:border-b-0 pb-3 md:pb-1">
                <Calendar className="text-white opacity-60 w-5 h-5 mr-2.5 shrink-0" />
                <div className="flex-1">
                  <label className="block text-white/50 font-bold tracking-wider mb-0 text-[0.65rem]">TRIP DURATION</label>
                  <select className="w-full bg-transparent text-white border-0 p-0 font-semibold shadow-none focus:outline-none focus:ring-0 text-sm cursor-pointer"
                    value={days}
                    onChange={(e) => { setDays(e.target.value); setGeneratedPlan(null); }}>
                    <option value="1" className="text-gray-900">1 Single Day</option>
                    <option value="2" className="text-gray-900">2 Days Escape</option>
                    <option value="3" className="text-gray-900">3 Days Standard</option>
                    <option value="4" className="text-gray-900">4 Days Mini Week</option>
                    <option value="5" className="text-gray-900">5 Days Immersion</option>
                    <option value="6" className="text-gray-900">6 Days Deep Tour</option>
                    <option value="7" className="text-gray-900">7 Days Full Epic</option>
                  </select>
                </div>
              </div>

              {/* Selector 3: Budget */}
              <div className="flex items-center text-left px-4 py-1 flex-1 w-full">
                <SlidersHorizontal className="text-white opacity-60 w-5 h-5 mr-2.5 shrink-0" />
                <div className="flex-1">
                  <label className="block text-white/50 font-bold tracking-wider mb-0 text-[0.65rem]">BUDGET TIER</label>
                  <select className="w-full bg-transparent text-white border-0 p-0 font-semibold shadow-none focus:outline-none focus:ring-0 text-sm cursor-pointer"
                    value={budget}
                    onChange={(e) => { setBudget(e.target.value); setGeneratedPlan(null); }}>
                    <option value="economy" className="text-gray-900">Economy</option>
                    <option value="standard" className="text-gray-900">Standard VIP</option>
                  </select>
                </div>
              </div>

              {/* Submit Action */}
              <button type="submit" className="text-lg rounded-full text-white font-bold px-6 py-2.5 w-full md:w-auto border-0 shadow-sm flex items-center justify-center gap-1.5"
                style={{ backgroundColor: '#ff6f3c', fontSize: '0.95rem', minWidth: '160px' }}>
                <Cpu className="w-4 h-4" /> Build Plan
              </button>

            </form>
          </div>
        </div>

        {/* INTERACTIVE THUMBNAILS CONTAINER */}
        <div className="relative pb-4 z-[3] max-w-7xl mx-auto px-4 w-full">
          <div className="flex gap-3 overflow-x-auto flex-nowrap pb-2 justify-start md:justify-center text-left hide-scrollbar">
            {destinations.map((node) => (
              <div key={node.id} className={`shrink-0 w-[40%] sm:w-[23%] md:w-[14%] filter-tab-card ${city === node.id ? 'active' : ''}`} onClick={() => { setCity(node.id); setGeneratedPlan(null); }}>
                <div className="img-thumbnail-node relative rounded-2xl overflow-hidden shadow h-[85px] bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url(${node.img})` }}>
                  <div className="card-glass-title absolute bottom-0 left-0 w-full p-1.5 text-white text-center font-bold text-xs" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>{node.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 2. CREATIVE TIMELINE GRID AND ACTIVE CONTENT CANVAS */}
      <section className="py-12 max-w-7xl mx-auto px-4">
        {loading && (
          <div className="text-center py-12">
            <div className="spinner inline-block w-10 h-10 rounded-full border-4 border-gray-200 animate-spin" style={{ borderTopColor: '#ff6f3c' }}></div>
            <p className="text-gray-500 font-semibold mt-3 text-sm tracking-wider">Compiling Your Custom {days}-Day Matrix Array...</p>
          </div>
        )}

        {generatedPlan ? (
          <div>
            <div className="text-left border-b pb-3 mb-12 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="inline-block bg-gray-900 text-white px-3 py-1.5 rounded-lg mb-2 uppercase tracking-wider text-[0.65rem]">Custom Plan Generated</span>
                <h2 className="font-extrabold text-gray-900 text-4xl m-0" style={{ letterSpacing: '-1px' }}>{currentData.title} ({generatedPlan.length} Days)</h2>
              </div>
              <span className="text-lg font-bold text-gray-600 italic">{days} Days Personalized Grid</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* LEFT COLUMN: Timeline Controllers */}
              <div className="w-full lg:w-1/3 text-left">
                <div className="timeline-scroller p-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  {generatedPlan.map((item, idx) => (
                    <div key={idx}
                      className={`flex items-center p-3 mb-2 rounded-xl timeline-node-row cursor-pointer transition-all duration-200 ${activeDayIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveDayIndex(idx)}>
                      <div className="day-index-bubble font-bold mr-3 rounded-full flex items-center justify-center w-10 h-10 shrink-0"
                        style={{ backgroundColor: activeDayIndex === idx ? '#ff6f3c' : '#f0ede4', color: activeDayIndex === idx ? 'white' : '#4a5568' }}>
                        0{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-gray-500 text-xs font-bold">{item.day} PLAN</span>
                        <strong className={`block ${activeDayIndex === idx ? 'text-gray-900' : 'text-gray-600'} text-sm truncate max-w-[200px]`}>{item.title}</strong>
                      </div>
                      <ChevronRight className="text-gray-400 opacity-50 ml-auto w-4 h-4 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: Display Canvas */}
              <div className="w-full lg:w-2/3 text-left">
                {(() => {
                  const currentDayItem = generatedPlan[activeDayIndex];
                  if (!currentDayItem) return null;
                  return (
                    <div className="border-0 rounded-[2rem] shadow-sm overflow-hidden bg-white active-canvas-card animate-fade">
                      <div className="relative overflow-hidden h-[350px]">
                        <img src={currentDayItem.img} alt={currentDayItem.title} className="w-full h-full object-cover transition-scale" />
                        <div className="absolute bottom-0 left-0 w-full p-4 flex items-end justify-between" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)' }}>
                          <span className="px-3 py-2 text-white font-bold m-0 rounded-lg uppercase text-xs" style={{ backgroundColor: '#ff6f3c' }}>{currentDayItem.day} Execution Node</span>
                          <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-yellow-400" />{currentDayItem.time}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 md:p-10">
                        <h3 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>{currentDayItem.title}</h3>
                        <p className="text-gray-500 text-lg font-light mb-0 leading-loose" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {currentDayItem.desc} This micro-itinerary coordinate has been compiled based on geospatial proximity metrics and optimal transit loops to minimize daily exhaustion indexes.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-12 bg-white rounded-[2rem] p-12 border shadow-sm">
              <CalendarRange className="text-gray-400 w-10 h-10 mb-2 mx-auto opacity-30" />
              <h4 className="font-bold text-gray-600 text-xl">Custom Itinerary Setup Void</h4>
              <p className="text-gray-500 text-sm max-w-[500px] mx-auto mb-0">Select your destination and specify exactly how many days you need inside the glassmorphism hero panel above.</p>
            </div>
          )
        )}
      </section>

      {/* 3. DYNAMIC MAP SYNC SECTION */}
      <section className="pb-12 mb-12 max-w-7xl mx-auto px-4">
        <div className="p-6 md:p-10 overflow-hidden rounded-[2rem] shadow-lg" style={{ background: 'linear-gradient(145deg, #F6F3EC 0%, #EFE9DA 100%)', border: '1px solid #E8E5DD' }}>
          <div className="flex flex-col lg:flex-row items-center text-left gap-6">
            <div className="w-full lg:w-5/12 px-3">
              <span className="inline-block px-3 py-1.5 rounded-lg mb-2 text-[0.65rem]" style={{ backgroundColor: '#161614', color: 'rgba(255,255,255,0.7)' }}>GEOSPATIAL SERVER INTERFACE</span>
              <h2 className="text-4xl font-bold mb-3" style={{ letterSpacing: '-1px', color: '#161614', fontFamily: "'Playfair Display', serif" }}>Native Mapping Sync</h2>
              <p className="text-sm mb-6 leading-loose" style={{ color: '#6E6E6A' }}>
                Track spatial patterns and coordinates live. Renders structural vector coordinates loaded straight from cloud mapping databases simultaneously with active index routes.
              </p>
              <button type="button" className="text-white font-bold px-6 py-2.5 rounded-full shadow-sm text-sm flex items-center gap-1.5" style={{ backgroundColor: '#F36926' }}>
                Maximize Coordinate Canvas <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full lg:w-7/12">
              <div className="map-iframe-container w-full rounded-3xl overflow-hidden" style={{ height: '390px', boxShadow: '0 12px 30px rgba(22,22,20,0.15)', border: '1px solid #E8E5DD' }}>
                <iframe
                  title="Dynamic Egypt Map Node"
                  src={currentData.googleMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPONENT CSS SKINS */}
      <style>{`
        .filter-tab-card { transition: all 0.3s ease; }
        .filter-tab-card:hover { transform: translateY(-4px); }
        .filter-tab-card.active .img-thumbnail-node { border: 3px solid #ff6f3c; box-shadow: 0 8px 20px rgba(255,111,60,0.3); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        .timeline-node-row { background-color: transparent; }
        .timeline-node-row:hover { background-color: #fcfbfa; }
        .timeline-node-row.active { background-color: #fdf5f0; border-left: 4px solid #ff6f3c; }

        .animate-fade { animation: canvasEntry 0.4s ease-in-out forwards; }
        @keyframes canvasEntry { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .transition-scale { transition: transform 0.6s ease; }
        .active-canvas-card:hover .transition-scale { transform: scale(1.03); }

        /* ANIMATED HERO BACKGROUND: parallax wrapper + Ken Burns + crossfade */
        .hero-parallax-wrapper {
          position: absolute;
          inset: -30px;
          z-index: 0;
          transition: transform 0.15s ease-out;
          will-change: transform;
        }
        .hero-bg-animated {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          animation: heroKenBurns 22s ease-in-out infinite alternate;
          transition: opacity 1.2s ease-in-out;
        }
        .hero-bg-animated--alt {
          animation-name: heroKenBurnsAlt;
          animation-duration: 28s;
        }
        @keyframes heroKenBurns {
          0%   { transform: scale(1.08) translate(0, 0); }
          50%  { transform: scale(1.22) translate(-2.5%, -1.5%); }
          100% { transform: scale(1.14) translate(2%, -2.5%); }
        }
        @keyframes heroKenBurnsAlt {
          0%   { transform: scale(1.14) translate(2%, 1%); }
          50%  { transform: scale(1.26) translate(-1.5%, -2%); }
          100% { transform: scale(1.1) translate(-2.5%, 1.5%); }
        }

        /* FLOATING AMBIENT PARTICLES */
        .hero-particles-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .hero-particle {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%);
          animation-name: particleFloat;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes particleFloat {
          0%   { transform: translate(0, 0) scale(0.4); opacity: 0; }
          15%  { opacity: 0.9; }
          85%  { opacity: 0.5; }
          100% { transform: translate(var(--drift), -105vh) scale(1); opacity: 0; }
        }
      `}</style>

    </div>
  );
}

export default TripPlanner;