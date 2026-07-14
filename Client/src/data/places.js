const places = [
  // =========================
  // Cairo
  // =========================
  {
    id: "cairo-1",
    name: "The Egyptian Museum",
    governorate: "Cairo",
    category: "Museum",
    description:
      "The Egyptian Museum houses one of the world's largest collections of ancient Egyptian artifacts, including the treasures of Tutankhamun.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/48/Museum_of_Egyptian_Antiquities_-_Cairo.jpg",
    rating: 4.8,
    coordinates: {
      lat: 30.0478,
      lng: 31.2336,
    },
  },
  {
    id: "cairo-2",
    name: "Cairo Citadel",
    governorate: "Cairo",
    category: "Historical Site",
    description:
      "A medieval Islamic fortress built by Saladin, offering panoramic views of Cairo.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Cairo_Citadel_Panoramio.jpg",
    rating: 4.7,
    coordinates: {
      lat: 30.0299,
      lng: 31.2615,
    },
  },
  {
    id: "cairo-3",
    name: "Khan El Khalili",
    governorate: "Cairo",
    category: "Market",
    description:
      "A historic bazaar dating back to the 14th century, famous for traditional crafts, souvenirs, cafés, and local culture.",
    image: "/images/cairo/khan-el-khalili.jpg",
    rating: 4.8,
    coordinates: {
      lat: 30.0478,
      lng: 31.2625,
    },
  },
  {
    id: "cairo-4",
    name: "Al-Azhar Park",
    governorate: "Cairo",
    category: "Park",
    description:
      "One of Cairo's largest urban parks, offering beautiful gardens, restaurants, and panoramic city views.",
    image: "/images/cairo/al-azhar-park.jpg",
    rating: 4.8,
    coordinates: {
      lat: 30.0404,
      lng: 31.2686,
    },
  },
  {
    id: "cairo-5",
    name: "Mosque of Muhammad Ali",
    governorate: "Cairo",
    category: "Mosque",
    description:
      "An iconic Ottoman-style mosque inside the Cairo Citadel, famous for its grand architecture and city views.",
    image: "/images/cairo/mohamed-ali-mosque.jpg",
    rating: 4.9,
    coordinates: {
      lat: 30.0287,
      lng: 31.2599,
    },
  },

  // =========================
  // Giza
  // =========================
  {
    id: "giza-1",
    name: "Great Pyramid of Giza",
    governorate: "Giza",
    category: "Pyramid",
    description:
      "The oldest and largest of the three pyramids and the only surviving Wonder of the Ancient World.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e3/Great_Pyramid_of_Giza_from_the_south_side.jpg",
    rating: 5.0,
    coordinates: {
      lat: 29.9792,
      lng: 31.1342,
    },
  },
  {
    id: "giza-2",
    name: "The Great Sphinx",
    governorate: "Giza",
    category: "Historical Site",
    description:
      "The famous limestone statue with the body of a lion and the head of a pharaoh.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Great_Sphinx_of_Giza_-_20081123a.jpg",
    rating: 4.9,
    coordinates: {
      lat: 29.9753,
      lng: 31.1376,
    },
  },
  {
    id: "giza-3",
    name: "Grand Egyptian Museum",
    governorate: "Giza",
    category: "Museum",
    description:
      "The world's largest archaeological museum dedicated to a single civilization, showcasing thousands of ancient Egyptian treasures.",
    image: "/images/giza/grand-egyptian-museum.jpg",
    rating: 4.9,
    coordinates: {
      lat: 29.9945,
      lng: 31.1199,
    },
  },
  {
    id: "giza-4",
    name: "Saqqara Necropolis",
    governorate: "Giza",
    category: "Archaeological Site",
    description:
      "Home to the famous Step Pyramid of Djoser and one of Egypt's most important ancient burial grounds.",
    image: "/images/giza/saqqara.jpg",
    rating: 4.9,
    coordinates: {
      lat: 29.8711,
      lng: 31.2165,
    },
  },
  {
    id: "giza-5",
    name: "Dahshur Pyramids",
    governorate: "Giza",
    category: "Pyramid",
    description:
      "An ancient royal necropolis featuring the Bent Pyramid and the Red Pyramid, among Egypt's oldest pyramids.",
    image: "/images/giza/dahshur.jpg",
    rating: 4.8,
    coordinates: {
      lat: 29.7996,
      lng: 31.2055,
    },
  },

  // =========================
  // Alexandria
  // =========================
  {
    id: "alex-1",
    name: "Bibliotheca Alexandrina",
    governorate: "Alexandria",
    category: "Library",
    description:
      "A modern library and cultural center inspired by the ancient Library of Alexandria.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Bibliotheca_Alexandrina_Exterior.jpg",
    rating: 4.8,
    coordinates: {
      lat: 31.2089,
      lng: 29.9092,
    },
  },
  {
    id: "alex-2",
    name: "Citadel of Qaitbay",
    governorate: "Alexandria",
    category: "Fortress",
    description:
      "A 15th-century defensive fortress built on the site of the ancient Lighthouse of Alexandria.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/52/Citadel_of_Qaitbay_at_dusk.jpg",
    rating: 4.8,
    coordinates: {
      lat: 31.2136,
      lng: 29.8853,
    },
  },
  {
    id: "alex-3",
    name: "Montaza Palace Gardens",
    governorate: "Alexandria",
    category: "Garden",
    description:
      "A royal park overlooking the Mediterranean Sea with beautiful gardens, beaches, and historic palaces.",
    image: "/images/alexandria/montaza.jpg",
    rating: 4.8,
    coordinates: {
      lat: 31.2882,
      lng: 30.0165,
    },
  },
  {
    id: "alex-4",
    name: "Pompey's Pillar",
    governorate: "Alexandria",
    category: "Historical Site",
    description:
      "A massive Roman triumphal column standing nearly 27 meters tall, one of Alexandria's most famous monuments.",
    image: "/images/alexandria/pompeys-pillar.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.1826,
      lng: 29.8961,
    },
  },
  {
    id: "alex-5",
    name: "Catacombs of Kom El Shoqafa",
    governorate: "Alexandria",
    category: "Historical Site",
    description:
      "A fascinating underground necropolis blending Egyptian, Greek, and Roman architectural styles.",
    image: "/images/alexandria/kom-el-shoqafa.jpg",
    rating: 4.8,
    coordinates: {
      lat: 31.1789,
      lng: 29.8937,
    },
  },

  // =========================
  // Luxor
  // =========================
  {
    id: "luxor-1",
    name: "Karnak Temple",
    governorate: "Luxor",
    category: "Temple",
    description:
      "One of the largest religious temple complexes ever built in ancient Egypt.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Karnak_Temples.jpg",
    rating: 4.9,
    coordinates: {
      lat: 25.7188,
      lng: 32.6573,
    },
  },
  {
    id: "luxor-2",
    name: "Valley of the Kings",
    governorate: "Luxor",
    category: "Historical Site",
    description:
      "The royal burial ground of New Kingdom pharaohs, including the tomb of Tutankhamun.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/Valley_of_the_Kings_KV_2011.jpg",
    rating: 5.0,
    coordinates: {
      lat: 25.7402,
      lng: 32.6014,
    },
  },
  {
    id: "luxor-3",
    name: "Luxor Temple",
    governorate: "Luxor",
    category: "Temple",
    description:
      "A magnificent ancient Egyptian temple located on the east bank of the Nile, especially beautiful when illuminated at night.",
    image: "/images/luxor/luxor-temple.jpg",
    rating: 4.9,
    coordinates: {
      lat: 25.6996,
      lng: 32.6396,
    },
  },
  {
    id: "luxor-4",
    name: "Mortuary Temple of Hatshepsut",
    governorate: "Luxor",
    category: "Temple",
    description:
      "An impressive temple built for Queen Hatshepsut, carved into the cliffs of Deir el-Bahari.",
    image: "/images/luxor/hatshepsut-temple.jpg",
    rating: 4.9,
    coordinates: {
      lat: 25.7382,
      lng: 32.6068,
    },
  },
  {
    id: "luxor-5",
    name: "Colossi of Memnon",
    governorate: "Luxor",
    category: "Historical Site",
    description:
      "Two gigantic stone statues of Pharaoh Amenhotep III standing at the entrance of his mortuary temple.",
    image: "/images/luxor/colossi-of-memnon.jpg",
    rating: 4.7,
    coordinates: {
      lat: 25.7206,
      lng: 32.6107,
    },
  },

  // =========================
  // Aswan
  // =========================
  {
    id: "aswan-1",
    name: "Philae Temple",
    governorate: "Aswan",
    category: "Temple",
    description:
      "A beautiful temple dedicated to the goddess Isis, located on Agilkia Island.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Philae_Temple_Aswan.jpg",
    rating: 4.9,
    coordinates: {
      lat: 24.0258,
      lng: 32.8848,
    },
  },
  {
    id: "aswan-2",
    name: "Abu Simbel Temples",
    governorate: "Aswan",
    category: "Temple",
    description:
      "Two massive rock-cut temples built by Pharaoh Ramesses II and relocated to avoid flooding.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Abu_Simbel_Temples_by_Danny_Ayres.jpg",
    rating: 5.0,
    coordinates: {
      lat: 22.3372,
      lng: 31.6258,
    },
  },
  {
    id: "aswan-3",
    name: "Aswan High Dam",
    governorate: "Aswan",
    category: "Landmark",
    description:
      "One of the greatest engineering achievements of the 20th century, controlling the flow of the Nile River.",
    image: "/images/aswan/high-dam.jpg",
    rating: 4.7,
    coordinates: {
      lat: 23.9705,
      lng: 32.8778,
    },
  },
  {
    id: "aswan-4",
    name: "Unfinished Obelisk",
    governorate: "Aswan",
    category: "Historical Site",
    description:
      "An enormous unfinished granite obelisk that provides insight into ancient Egyptian stone-working techniques.",
    image: "/images/aswan/unfinished-obelisk.jpg",
    rating: 4.6,
    coordinates: {
      lat: 24.0765,
      lng: 32.8998,
    },
  },
  {
    id: "aswan-5",
    name: "Nubian Village",
    governorate: "Aswan",
    category: "Village",
    description:
      "A colorful riverside village famous for Nubian culture, traditional houses, local crafts, and warm hospitality.",
    image: "/images/aswan/nubian-village.jpg",
    rating: 4.8,
    coordinates: {
      lat: 24.0872,
      lng: 32.8873,
    },
  },

  // =========================
  // Red Sea
  // =========================
  {
    id: "redsea-1",
    name: "Giftun Island",
    governorate: "Red Sea",
    category: "Island",
    description:
      "A popular island near Hurghada known for crystal-clear water, coral reefs, and snorkeling.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/ea/Giftun_Island_Hurghada.jpg",
    rating: 4.9,
    coordinates: {
      lat: 27.227,
      lng: 33.921,
    },
  },
  {
    id: "redsea-2",
    name: "Hurghada Marina",
    governorate: "Red Sea",
    category: "Marina",
    description:
      "A lively waterfront destination with restaurants, cafes, shopping, and yacht cruises.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/91/Hurghada_Marina_Boulevard.jpg",
    rating: 4.7,
    coordinates: {
      lat: 27.231,
      lng: 33.845,
    },
  },
  {
    id: "redsea-3",
    name: "Orange Bay",
    governorate: "Red Sea",
    category: "Beach",
    description:
      "A stunning island destination with white sandy beaches, crystal-clear water, and excellent snorkeling opportunities.",
    image: "/images/redsea/orange-bay.jpg",
    rating: 4.9,
    coordinates: {
      lat: 27.3065,
      lng: 33.9454,
    },
  },
  {
    id: "redsea-4",
    name: "Mahmya Island",
    governorate: "Red Sea",
    category: "Island",
    description:
      "A protected island in the Giftun National Park, known for pristine beaches and vibrant coral reefs.",
    image: "/images/redsea/mahmya-island.jpg",
    rating: 4.9,
    coordinates: {
      lat: 27.2168,
      lng: 33.9268,
    },
  },
  {
    id: "redsea-5",
    name: "El Gouna",
    governorate: "Red Sea",
    category: "Resort",
    description:
      "A luxury resort town featuring lagoons, marinas, golf courses, diving centers, and world-class hotels.",
    image: "/images/redsea/el-gouna.jpg",
    rating: 4.8,
    coordinates: {
      lat: 27.3942,
      lng: 33.6782,
    },
  },

  // =========================
  // South Sinai
  // =========================
  {
    id: "southsinai-1",
    name: "Saint Catherine's Monastery",
    governorate: "South Sinai",
    category: "Monastery",
    description:
      "One of the world's oldest working Christian monasteries and a UNESCO World Heritage Site.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/43/Saint_Catherine_Monastery_Sinai_Egypt.jpg",
    rating: 4.9,
    coordinates: {
      lat: 28.5556,
      lng: 33.9756,
    },
  },
  {
    id: "southsinai-2",
    name: "Mount Sinai",
    governorate: "South Sinai",
    category: "Mountain",
    description:
      "A famous mountain believed to be the place where Moses received the Ten Commandments.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Mount_Sinai_Egypt_2009.jpg",
    rating: 4.9,
    coordinates: {
      lat: 28.5397,
      lng: 33.975,
    },
  },
  {
    id: "southsinai-3",
    name: "Blue Hole",
    governorate: "South Sinai",
    category: "Diving Site",
    description:
      "One of the world's most famous diving locations, known for its crystal-clear waters and spectacular coral reefs.",
    image: "/images/south-sinai/blue-hole.jpg",
    rating: 4.9,
    coordinates: {
      lat: 28.5723,
      lng: 34.5373,
    },
  },
  {
    id: "southsinai-4",
    name: "Ras Mohammed National Park",
    governorate: "South Sinai",
    category: "National Park",
    description:
      "Egypt's first national park, famous for vibrant coral reefs, marine life, mangroves, and scenic coastal landscapes.",
    image: "/images/south-sinai/ras-mohammed.jpg",
    rating: 5.0,
    coordinates: {
      lat: 27.7236,
      lng: 34.2581,
    },
  },
  {
    id: "southsinai-5",
    name: "Naama Bay",
    governorate: "South Sinai",
    category: "Beach",
    description:
      "The heart of Sharm El Sheikh, offering sandy beaches, luxury resorts, restaurants, shopping, and nightlife.",
    image: "/images/south-sinai/naama-bay.jpg",
    rating: 4.8,
    coordinates: {
      lat: 27.9158,
      lng: 34.3299,
    },
  },

  // =========================
  // North Sinai
  // =========================
  {
    id: "northsinai-1",
    name: "Arish Beach",
    governorate: "North Sinai",
    category: "Beach",
    description:
      "A peaceful Mediterranean beach famous for its soft white sand and clear blue water.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
    rating: 4.6,
    coordinates: {
      lat: 31.1313,
      lng: 33.7984,
    },
  },
  {
    id: "northsinai-2",
    name: "Zaranik Protected Area",
    governorate: "North Sinai",
    category: "Nature Reserve",
    description:
      "An internationally recognized wetland reserve that attracts thousands of migratory birds.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/99/Flamingos_Zaranik_Egypt.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.0905,
      lng: 33.9807,
    },
  },
  {
    id: "northsinai-3",
    name: "El Arish Palm Beach",
    governorate: "North Sinai",
    category: "Beach",
    description:
      "A beautiful beach lined with palm trees and known for its calm Mediterranean atmosphere.",
    image: "/images/north-sinai/palm-beach.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.1255,
      lng: 33.8104,
    },
  },
  {
    id: "northsinai-4",
    name: "Bardawil Lake",
    governorate: "North Sinai",
    category: "Lake",
    description:
      "A large saltwater lagoon famous for its rich biodiversity, migratory birds, and high-quality fish.",
    image: "/images/north-sinai/bardawil-lake.jpg",
    rating: 4.7,
    coordinates: {
      lat: 31.1302,
      lng: 33.2369,
    },
  },
  {
    id: "northsinai-5",
    name: "Arish Port",
    governorate: "North Sinai",
    category: "Harbor",
    description:
      "A historic Mediterranean port offering beautiful sea views and an important gateway to North Sinai.",
    image: "/images/north-sinai/arish-port.jpg",
    rating: 4.3,
    coordinates: {
      lat: 31.1388,
      lng: 33.8046,
    },
  },

  // =========================
  // Port Said
  // =========================
  {
    id: "portsaid-1",
    name: "Port Said Lighthouse",
    governorate: "Port Said",
    category: "Landmark",
    description:
      "One of the earliest reinforced concrete lighthouses in the world overlooking the Mediterranean.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Old_Lighthouse_of_Port_Said.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.2668,
      lng: 32.3054,
    },
  },
  {
    id: "portsaid-2",
    name: "Suez Canal Entrance",
    governorate: "Port Said",
    category: "Historical Site",
    description:
      "The northern entrance of the famous Suez Canal, one of the world's busiest shipping routes.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/04/Suez_Canal_Port_Said.jpg",
    rating: 4.8,
    coordinates: {
      lat: 31.2653,
      lng: 32.3019,
    },
  },
  {
    id: "portsaid-3",
    name: "Port Said Military Museum",
    governorate: "Port Said",
    category: "Museum",
    description:
      "A museum highlighting Egypt's military history with exhibits related to the Suez Crisis and modern conflicts.",
    image: "/images/portsaid/military-museum.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.2605,
      lng: 32.3025,
    },
  },
  {
    id: "portsaid-4",
    name: "Ferial Garden",
    governorate: "Port Said",
    category: "Park",
    description:
      "A beautiful public garden overlooking the Suez Canal with green spaces and family-friendly attractions.",
    image: "/images/portsaid/ferial-garden.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.2558,
      lng: 32.2998,
    },
  },
  {
    id: "portsaid-5",
    name: "Port Fouad",
    governorate: "Port Said",
    category: "Historical District",
    description:
      "A charming district featuring French-inspired architecture and scenic streets overlooking the Suez Canal.",
    image: "/images/portsaid/port-fouad.jpg",
    rating: 4.7,
    coordinates: {
      lat: 31.2626,
      lng: 32.3194,
    },
  },

  // =========================
  // Ismailia
  // =========================
  {
    id: "ismailia-1",
    name: "Lake Timsah",
    governorate: "Ismailia",
    category: "Lake",
    description:
      "A beautiful lake surrounded by parks and waterfront promenades in the heart of Ismailia.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/69/Lake_Timsah_Ismailia.jpg",
    rating: 4.7,
    coordinates: {
      lat: 30.5866,
      lng: 32.2654,
    },
  },
  {
    id: "ismailia-2",
    name: "Ismailia Museum",
    governorate: "Ismailia",
    category: "Museum",
    description:
      "An archaeological museum displaying artifacts from ancient Egypt and the Suez Canal region.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Ismailia_Museum_Entrance.jpg",
    rating: 4.5,
    coordinates: {
      lat: 30.5965,
      lng: 32.2717,
    },
  },
  {
    id: "ismailia-3",
    name: "Temsah Promenade",
    governorate: "Ismailia",
    category: "Waterfront",
    description:
      "A scenic promenade along Lake Timsah featuring cafés, walking paths, and relaxing waterfront views.",
    image: "/images/ismailia/temsah-promenade.jpg",
    rating: 4.7,
    coordinates: {
      lat: 30.5908,
      lng: 32.2686,
    },
  },
  {
    id: "ismailia-4",
    name: "Nimra 6 Museum",
    governorate: "Ismailia",
    category: "Museum",
    description:
      "A museum preserving military equipment and historical exhibits from the October War.",
    image: "/images/ismailia/nimra6-museum.jpg",
    rating: 4.6,
    coordinates: {
      lat: 30.6047,
      lng: 32.2729,
    },
  },
  {
    id: "ismailia-5",
    name: "Faid Beach",
    governorate: "Ismailia",
    category: "Beach",
    description:
      "A peaceful lakeside destination popular for swimming, fishing, and family outings.",
    image: "/images/ismailia/faid-beach.jpg",
    rating: 4.5,
    coordinates: {
      lat: 30.3403,
      lng: 32.3071,
    },
  },

  // =========================
  // Suez
  // =========================
  {
    id: "suez-1",
    name: "Suez National Museum",
    governorate: "Suez",
    category: "Museum",
    description:
      "A museum showcasing the history of Suez from ancient Egypt to the modern era.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Suez_National_Museum.jpg",
    rating: 4.5,
    coordinates: {
      lat: 29.9668,
      lng: 32.5498,
    },
  },
  {
    id: "suez-2",
    name: "Ain Sokhna",
    governorate: "Suez",
    category: "Beach",
    description:
      "A popular Red Sea destination famous for beaches, resorts, and water sports.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4b/Ain_Sokhna_Red_Sea_Coast.jpg",
    rating: 4.8,
    coordinates: {
      lat: 29.6004,
      lng: 32.3465,
    },
  },
  {
    id: "suez-3",
    name: "Suez Corniche",
    governorate: "Suez",
    category: "Waterfront",
    description:
      "A beautiful seaside promenade overlooking the Gulf of Suez with cafés and family attractions.",
    image: "/images/suez/corniche.jpg",
    rating: 4.6,
    coordinates: {
      lat: 29.9738,
      lng: 32.5537,
    },
  },
  {
    id: "suez-4",
    name: "Moses Springs",
    governorate: "Suez",
    category: "Historical Site",
    description:
      "A historic location traditionally associated with the journey of Prophet Moses during the Exodus.",
    image: "/images/suez/moses-springs.jpg",
    rating: 4.5,
    coordinates: {
      lat: 29.8046,
      lng: 32.5227,
    },
  },
  {
    id: "suez-5",
    name: "Attaka Mountain",
    governorate: "Suez",
    category: "Mountain",
    description:
      "A scenic mountain overlooking Ain Sokhna, popular for hiking and panoramic Red Sea views.",
    image: "/images/suez/attaka-mountain.jpg",
    rating: 4.7,
    coordinates: {
      lat: 29.7205,
      lng: 32.3469,
    },
  },

  // =========================
  // Fayoum
  // =========================
  {
    id: "fayoum-1",
    name: "Wadi El Rayan",
    governorate: "Fayoum",
    category: "Nature Reserve",
    description:
      "A protected area known for Egypt's largest waterfalls, lakes, and desert landscapes.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Wadi_El_Rayan_Waterfalls.jpg",
    rating: 4.9,
    coordinates: {
      lat: 29.2055,
      lng: 30.4586,
    },
  },
  {
    id: "fayoum-2",
    name: "Lake Qarun",
    governorate: "Fayoum",
    category: "Lake",
    description:
      "One of the oldest natural lakes in the world and a favorite destination for bird watching.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/32/Lake_Qarun_Fayoum.jpg",
    rating: 4.7,
    coordinates: {
      lat: 29.517,
      lng: 30.617,
    },
  },
  {
    id: "fayoum-3",
    name: "Wadi Al Hitan",
    governorate: "Fayoum",
    category: "UNESCO Site",
    description:
      "A UNESCO World Heritage Site famous for fossilized whale skeletons dating back over 40 million years.",
    image: "/images/fayoum/wadi-al-hitan.jpg",
    rating: 5.0,
    coordinates: {
      lat: 29.2712,
      lng: 30.1839,
    },
  },
  {
    id: "fayoum-4",
    name: "Magic Lake",
    governorate: "Fayoum",
    category: "Lake",
    description:
      "A picturesque lake surrounded by desert dunes, popular for sandboarding and camping.",
    image: "/images/fayoum/magic-lake.jpg",
    rating: 4.9,
    coordinates: {
      lat: 29.2868,
      lng: 30.4415,
    },
  },
  {
    id: "fayoum-5",
    name: "Tunis Village",
    governorate: "Fayoum",
    category: "Village",
    description:
      "A charming artistic village known for pottery workshops, eco-lodges, and traditional handicrafts.",
    image: "/images/fayoum/tunis-village.jpg",
    rating: 4.8,
    coordinates: {
      lat: 29.4339,
      lng: 30.6245,
    },
  },

  // =========================
  // Beni Suef
  // =========================
  {
    id: "benisuef-1",
    name: "Meidum Pyramid",
    governorate: "Beni Suef",
    category: "Pyramid",
    description:
      "An early pyramid built during Egypt's Old Kingdom and considered a milestone in pyramid construction.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/13/Meidum_Pyramid_Egypt.jpg",
    rating: 4.7,
    coordinates: {
      lat: 29.3906,
      lng: 31.1579,
    },
  },
  {
    id: "benisuef-2",
    name: "Beni Suef Nile Corniche",
    governorate: "Beni Suef",
    category: "Waterfront",
    description:
      "A scenic promenade along the Nile River offering relaxing views and local cafés.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/dd/Nile_at_Beni_Suef.jpg",
    rating: 4.4,
    coordinates: {
      lat: 29.0661,
      lng: 31.0994,
    },
  },
  {
    id: "benisuef-3",
    name: "Beni Suef Museum",
    governorate: "Beni Suef",
    category: "Museum",
    description:
      "A regional museum displaying archaeological artifacts from ancient Egypt and local history.",
    image: "/images/beni-suef/museum.jpg",
    rating: 4.4,
    coordinates: {
      lat: 29.0756,
      lng: 31.0999,
    },
  },
  {
    id: "benisuef-4",
    name: "Gebel El Nour",
    governorate: "Beni Suef",
    category: "Nature",
    description:
      "A scenic mountain area offering panoramic views and opportunities for outdoor exploration.",
    image: "/images/beni-suef/gebel-el-nour.jpg",
    rating: 4.3,
    coordinates: {
      lat: 29.1521,
      lng: 31.1326,
    },
  },
  {
    id: "benisuef-5",
    name: "Ehnasia Archaeological Site",
    governorate: "Beni Suef",
    category: "Archaeological Site",
    description:
      "The ancient city of Heracleopolis Magna, home to temples, tombs, and significant archaeological discoveries.",
    image: "/images/beni-suef/ehnasia.jpg",
    rating: 4.6,
    coordinates: {
      lat: 28.9257,
      lng: 30.9269,
    },
  },

  // =========================
  // Minya
  // =========================
  {
    id: "minya-1",
    name: "Tell El Amarna",
    governorate: "Minya",
    category: "Archaeological Site",
    description:
      "The ancient capital established by Pharaoh Akhenaten during the Amarna Period.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/ce/Amarna_Boundary_Stela_U.jpg",
    rating: 4.8,
    coordinates: {
      lat: 27.646,
      lng: 30.893,
    },
  },
  {
    id: "minya-2",
    name: "Beni Hassan Tombs",
    governorate: "Minya",
    category: "Historical Site",
    description:
      "Rock-cut tombs dating back to the Middle Kingdom, famous for colorful wall paintings.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3f/Beni_Hassan_Tombs_Exterior.jpg",
    rating: 4.7,
    coordinates: {
      lat: 27.936,
      lng: 30.873,
    },
  },
  {
    id: "minya-3",
    name: "Tuna El Gebel",
    governorate: "Minya",
    category: "Archaeological Site",
    description:
      "A vast archaeological necropolis featuring the tomb of Petosiris, catacombs, and sacred animal burials.",
    image: "/images/minya/tuna-el-gebel.jpg",
    rating: 4.8,
    coordinates: {
      lat: 27.7868,
      lng: 30.7354,
    },
  },
  {
    id: "minya-4",
    name: "Frazer Tombs",
    governorate: "Minya",
    category: "Historical Site",
    description:
      "A collection of rock-cut tombs dating back to the Old Kingdom overlooking the Nile Valley.",
    image: "/images/minya/frazer-tombs.jpg",
    rating: 4.6,
    coordinates: {
      lat: 28.1205,
      lng: 30.7489,
    },
  },
  {
    id: "minya-5",
    name: "Minya Nile Corniche",
    governorate: "Minya",
    category: "Waterfront",
    description:
      "A relaxing promenade along the Nile with cafés, restaurants, and panoramic river views.",
    image: "/images/minya/corniche.jpg",
    rating: 4.5,
    coordinates: {
      lat: 28.1099,
      lng: 30.7503,
    },
  },

  // =========================
  // Assiut
  // =========================
  {
    id: "assiut-1",
    name: "Al Muharraq Monastery",
    governorate: "Assiut",
    category: "Monastery",
    description:
      "One of Egypt's most important Coptic monasteries and a major pilgrimage destination.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/1d/Al-Muharraq_Monastery_Church.jpg",
    rating: 4.8,
    coordinates: {
      lat: 27.163,
      lng: 30.739,
    },
  },
  {
    id: "assiut-2",
    name: "Assiut Nile Corniche",
    governorate: "Assiut",
    category: "Waterfront",
    description:
      "A popular riverside promenade overlooking the Nile with restaurants and parks.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/ea/Nile_at_Asyut.jpg",
    rating: 4.5,
    coordinates: {
      lat: 27.1809,
      lng: 31.1837,
    },
  },
  {
    id: "assiut-3",
    name: "Assiut Barrage",
    governorate: "Assiut",
    category: "Landmark",
    description:
      "A historic barrage across the Nile offering beautiful scenery and an important engineering landmark.",
    image: "/images/assiut/assiut-barrage.jpg",
    rating: 4.6,
    coordinates: {
      lat: 27.1806,
      lng: 31.1715,
    },
  },
  {
    id: "assiut-4",
    name: "Dronka Monastery",
    governorate: "Assiut",
    category: "Monastery",
    description:
      "A famous Coptic monastery built into the mountains and visited by thousands of pilgrims every year.",
    image: "/images/assiut/dronka-monastery.jpg",
    rating: 4.8,
    coordinates: {
      lat: 27.1069,
      lng: 31.1248,
    },
  },
  {
    id: "assiut-5",
    name: "Assiut Museum",
    governorate: "Assiut",
    category: "Museum",
    description:
      "A regional museum displaying archaeological artifacts representing the history of Upper Egypt.",
    image: "/images/assiut/museum.jpg",
    rating: 4.4,
    coordinates: {
      lat: 27.1834,
      lng: 31.1829,
    },
  },

  // =========================
  // Sohag
  // =========================
  {
    id: "sohag-1",
    name: "Abydos Temple",
    governorate: "Sohag",
    category: "Temple",
    description:
      "A magnificent temple dedicated to Seti I, famous for its detailed carvings and the Abydos King List.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/05/Abydos_Temple_of_Seti_I_Facade.jpg",
    rating: 4.9,
    coordinates: {
      lat: 26.184,
      lng: 31.921,
    },
  },
  {
    id: "sohag-2",
    name: "White Monastery",
    governorate: "Sohag",
    category: "Monastery",
    description:
      "An ancient Coptic monastery known for its impressive limestone architecture.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/ea/White_Monastery_Sohag.jpg",
    rating: 4.7,
    coordinates: {
      lat: 26.562,
      lng: 31.745,
    },
  },
  {
    id: "sohag-3",
    name: "Red Monastery",
    governorate: "Sohag",
    category: "Monastery",
    description:
      "One of Egypt's oldest monasteries, famous for its beautifully preserved early Christian wall paintings.",
    image: "/images/sohag/red-monastery.jpg",
    rating: 4.8,
    coordinates: {
      lat: 26.5486,
      lng: 31.7421,
    },
  },
  {
    id: "sohag-4",
    name: "Sohag National Museum",
    governorate: "Sohag",
    category: "Museum",
    description:
      "A modern museum presenting the rich archaeological heritage of Sohag and Upper Egypt.",
    image: "/images/sohag/national-museum.jpg",
    rating: 4.7,
    coordinates: {
      lat: 26.5584,
      lng: 31.6964,
    },
  },
  {
    id: "sohag-5",
    name: "Akhmim Open Air Museum",
    governorate: "Sohag",
    category: "Museum",
    description:
      "An archaeological site displaying impressive statues and monuments discovered in ancient Akhmim.",
    image: "/images/sohag/akhmim-museum.jpg",
    rating: 4.5,
    coordinates: {
      lat: 26.5621,
      lng: 31.7459,
    },
  },

  // =========================
  // Qena
  // =========================
  {
    id: "qena-1",
    name: "Dendera Temple Complex",
    governorate: "Qena",
    category: "Temple",
    description:
      "One of Egypt's best-preserved temple complexes, dedicated to the goddess Hathor and famous for its colorful astronomical ceiling.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/30/Dendera_Temple_Facade.jpg",
    rating: 4.9,
    coordinates: {
      lat: 26.1417,
      lng: 32.6703,
    },
  },
  {
    id: "qena-2",
    name: "Qena Corniche",
    governorate: "Qena",
    category: "Waterfront",
    description:
      "A peaceful Nile promenade with cafés, restaurants, and scenic river views.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5a/Nile_River_at_Qena.jpg",
    rating: 4.5,
    coordinates: {
      lat: 26.1551,
      lng: 32.716,
    },
  },
  {
    id: "qena-3",
    name: "Naqada Archaeological Site",
    governorate: "Qena",
    category: "Archaeological Site",
    description:
      "An ancient settlement that gave its name to the Naqada culture, one of Egypt's earliest civilizations.",
    image: "/images/qena/naqada.jpg",
    rating: 4.6,
    coordinates: {
      lat: 25.9142,
      lng: 32.7254,
    },
  },
  {
    id: "qena-4",
    name: "Qena National Museum",
    governorate: "Qena",
    category: "Museum",
    description:
      "A regional museum displaying artifacts from the Pharaonic, Greco-Roman, Coptic, and Islamic periods.",
    image: "/images/qena/national-museum.jpg",
    rating: 4.5,
    coordinates: {
      lat: 26.1598,
      lng: 32.7184,
    },
  },
  {
    id: "qena-5",
    name: "Nag Hammadi Barrage",
    governorate: "Qena",
    category: "Landmark",
    description:
      "A major hydraulic structure across the Nile offering scenic views and an important part of Egypt's irrigation system.",
    image: "/images/qena/nag-hammadi-barrage.jpg",
    rating: 4.4,
    coordinates: {
      lat: 26.0502,
      lng: 32.2426,
    },
  },

  // =========================
  // Qalyubia
  // =========================
  {
    id: "qalyubia-1",
    name: "Qanater Khayriya",
    governorate: "Qalyubia",
    category: "Park",
    description:
      "A historic barrage surrounded by beautiful gardens, picnic areas, and Nile branches.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bd/El_Qanater_El_Khayreya_Barrage.jpg",
    rating: 4.7,
    coordinates: {
      lat: 30.1926,
      lng: 31.1337,
    },
  },
  {
    id: "qalyubia-2",
    name: "Shubra El Kheima Corniche",
    governorate: "Qalyubia",
    category: "Waterfront",
    description:
      "A riverside promenade overlooking the Nile with walking areas and local restaurants.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/ee/Nile_near_Shubra_El_Kheima.jpg",
    rating: 4.3,
    coordinates: {
      lat: 30.1285,
      lng: 31.242,
    },
  },
  {
    id: "qalyubia-3",
    name: "Atiq Mosque",
    governorate: "Qalyubia",
    category: "Mosque",
    description:
      "One of the oldest mosques in Qalyubia, known for its historical Islamic architecture.",
    image: "/images/qalyubia/atiq-mosque.jpg",
    rating: 4.5,
    coordinates: {
      lat: 30.1798,
      lng: 31.2053,
    },
  },
  {
    id: "qalyubia-4",
    name: "Benha Nile Corniche",
    governorate: "Qalyubia",
    category: "Waterfront",
    description:
      "A popular promenade overlooking the Nile with cafés, restaurants, and family entertainment.",
    image: "/images/qalyubia/benha-corniche.jpg",
    rating: 4.6,
    coordinates: {
      lat: 30.4665,
      lng: 31.1842,
    },
  },
  {
    id: "qalyubia-5",
    name: "Benha Public Garden",
    governorate: "Qalyubia",
    category: "Park",
    description:
      "A peaceful public park offering green spaces, playgrounds, and recreational facilities.",
    image: "/images/qalyubia/public-garden.jpg",
    rating: 4.4,
    coordinates: {
      lat: 30.4657,
      lng: 31.1864,
    },
  },

  // =========================
  // Sharqia
  // =========================
  {
    id: "sharqia-1",
    name: "Tell Basta",
    governorate: "Sharqia",
    category: "Archaeological Site",
    description:
      "The ancient city of Bubastis, dedicated to the cat goddess Bastet and home to remarkable archaeological remains.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/Tell_Basta_Bubastis.jpg",
    rating: 4.6,
    coordinates: {
      lat: 30.5875,
      lng: 31.5037,
    },
  },
  {
    id: "sharqia-2",
    name: "Zagazig Museum",
    governorate: "Sharqia",
    category: "Museum",
    description:
      "A regional museum displaying artifacts from different periods of Egyptian history.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Sharkia_National_Museum_Zagazig.jpg",
    rating: 4.4,
    coordinates: {
      lat: 30.587,
      lng: 31.501,
    },
  },
  {
    id: "sharqia-3",
    name: "San El Hagar",
    governorate: "Sharqia",
    category: "Archaeological Site",
    description:
      "The ancient city of Tanis, famous for royal tombs, temples, and remarkable archaeological discoveries.",
    image: "/images/sharqia/san-el-hagar.jpg",
    rating: 4.8,
    coordinates: {
      lat: 30.9635,
      lng: 31.8827,
    },
  },
  {
    id: "sharqia-4",
    name: "Al Qanayat Gardens",
    governorate: "Sharqia",
    category: "Park",
    description:
      "A relaxing green park ideal for families and outdoor activities.",
    image: "/images/sharqia/al-qanayat.jpg",
    rating: 4.4,
    coordinates: {
      lat: 30.5994,
      lng: 31.5193,
    },
  },
  {
    id: "sharqia-5",
    name: "Zagazig University Botanical Garden",
    governorate: "Sharqia",
    category: "Garden",
    description:
      "A botanical garden featuring a wide variety of plants used for education and recreation.",
    image: "/images/sharqia/botanical-garden.jpg",
    rating: 4.3,
    coordinates: {
      lat: 30.5879,
      lng: 31.5005,
    },
  },

  // =========================
  // Dakahlia
  // =========================
  {
    id: "dakahlia-1",
    name: "Mansoura Nile Corniche",
    governorate: "Dakahlia",
    category: "Waterfront",
    description:
      "A lively promenade along the Damietta branch of the Nile with cafés and family attractions.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bf/Mansoura_Nile_View.jpg",
    rating: 4.7,
    coordinates: {
      lat: 31.0364,
      lng: 31.3807,
    },
  },
  {
    id: "dakahlia-2",
    name: "Dar Ibn Luqman Museum",
    governorate: "Dakahlia",
    category: "Museum",
    description:
      "A historic house museum associated with the capture of King Louis IX during the Seventh Crusade.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/Dar_Ibn_Luqman_Mansoura.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.039,
      lng: 31.378,
    },
  },
  {
    id: "dakahlia-3",
    name: "Gamasa Beach",
    governorate: "Dakahlia",
    category: "Beach",
    description:
      "A popular Mediterranean beach destination attracting visitors during the summer season.",
    image: "/images/dakahlia/gamasa-beach.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.4412,
      lng: 31.5741,
    },
  },
  {
    id: "dakahlia-4",
    name: "Mansoura National Museum",
    governorate: "Dakahlia",
    category: "Museum",
    description:
      "A museum preserving historical artifacts and documenting the cultural heritage of Dakahlia.",
    image: "/images/dakahlia/national-museum.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.0382,
      lng: 31.3775,
    },
  },
  {
    id: "dakahlia-5",
    name: "Talkha Corniche",
    governorate: "Dakahlia",
    category: "Waterfront",
    description:
      "A scenic Nile promenade offering relaxing views across the river toward Mansoura.",
    image: "/images/dakahlia/talkha-corniche.jpg",
    rating: 4.4,
    coordinates: {
      lat: 31.0564,
      lng: 31.3738,
    },
  },

  // =========================
  // Gharbia
  // =========================
  {
    id: "gharbia-1",
    name: "Ahmed El Badawi Mosque",
    governorate: "Gharbia",
    category: "Mosque",
    description:
      "One of Egypt's most important Islamic landmarks and a major destination for religious tourism.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/53/El_Sayed_El_Badawi_Mosque_Tanta.jpg",
    rating: 4.9,
    coordinates: {
      lat: 30.7865,
      lng: 31.0019,
    },
  },
  {
    id: "gharbia-2",
    name: "Tanta Museum",
    governorate: "Gharbia",
    category: "Museum",
    description:
      "A museum showcasing archaeological discoveries from the Nile Delta and surrounding regions.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/de/Tanta_Museum_Egypt.jpg",
    rating: 4.5,
    coordinates: {
      lat: 30.7878,
      lng: 31.0026,
    },
  },
  {
    id: "gharbia-3",
    name: "Tanta Cultural Center",
    governorate: "Gharbia",
    category: "Cultural Center",
    description:
      "A venue hosting concerts, exhibitions, theatrical performances, and cultural events.",
    image: "/images/gharbia/cultural-center.jpg",
    rating: 4.4,
    coordinates: {
      lat: 30.7894,
      lng: 31.0008,
    },
  },
  {
    id: "gharbia-4",
    name: "Andalus Garden",
    governorate: "Gharbia",
    category: "Park",
    description:
      "A beautiful public garden with walking paths, fountains, and family-friendly recreation areas.",
    image: "/images/gharbia/andalus-garden.jpg",
    rating: 4.5,
    coordinates: {
      lat: 30.7842,
      lng: 30.9997,
    },
  },
  {
    id: "gharbia-5",
    name: "Tanta Railway Museum",
    governorate: "Gharbia",
    category: "Museum",
    description:
      "A museum highlighting the history of rail transportation in the Nile Delta region.",
    image: "/images/gharbia/railway-museum.jpg",
    rating: 4.3,
    coordinates: {
      lat: 30.7903,
      lng: 31.0015,
    },
  },

  // =========================
  // Monufia
  // =========================
  {
    id: "monufia-1",
    name: "Shebin El Kom Cultural Palace",
    governorate: "Monufia",
    category: "Cultural Center",
    description:
      "A cultural venue hosting exhibitions, performances, and local artistic events.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d4/Shebin_El_Kom_Street.jpg",
    rating: 4.3,
    coordinates: {
      lat: 30.5549,
      lng: 31.0094,
    },
  },
  {
    id: "monufia-2",
    name: "Monufia Nile Promenade",
    governorate: "Monufia",
    category: "Waterfront",
    description:
      "A relaxing riverside destination popular for evening walks and family gatherings.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/Nile_branch_Delta.jpg",
    rating: 4.2,
    coordinates: {
      lat: 30.554,
      lng: 31.01,
    },
  },
  {
    id: "monufia-3",
    name: "Monufia Museum",
    governorate: "Monufia",
    category: "Museum",
    description:
      "A local museum showcasing the history, culture, and archaeological heritage of Monufia Governorate.",
    image: "/images/monufia/museum.jpg",
    rating: 4.3,
    coordinates: {
      lat: 30.5548,
      lng: 31.0122,
    },
  },
  {
    id: "monufia-4",
    name: "Ashmoun Gardens",
    governorate: "Monufia",
    category: "Park",
    description:
      "A family-friendly public park with green spaces, walking paths, and recreational areas.",
    image: "/images/monufia/ashmoun-gardens.jpg",
    rating: 4.2,
    coordinates: {
      lat: 30.2975,
      lng: 30.9758,
    },
  },
  {
    id: "monufia-5",
    name: "Shibin El Kom Corniche",
    governorate: "Monufia",
    category: "Waterfront",
    description:
      "A pleasant riverside promenade popular for evening walks and cafés.",
    image: "/images/monufia/corniche.jpg",
    rating: 4.3,
    coordinates: {
      lat: 30.5542,
      lng: 31.0084,
    },
  },

  // =========================
  // Beheira
  // =========================
  {
    id: "beheira-1",
    name: "Rosetta Citadel",
    governorate: "Beheira",
    category: "Fortress",
    description:
      "A historic Ottoman fortress near Rosetta, close to the place where the Rosetta Stone was discovered.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/44/Citadel_of_Qaitbay_Rosetta.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.3998,
      lng: 30.4165,
    },
  },
  {
    id: "beheira-2",
    name: "Rosetta Historic Houses",
    governorate: "Beheira",
    category: "Historical Site",
    description:
      "A collection of beautifully preserved Ottoman-era houses reflecting traditional Egyptian architecture.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/06/Amasiali_House_Rosetta.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.404,
      lng: 30.417,
    },
  },
  {
    id: "beheira-3",
    name: "Wadi El Natrun Monasteries",
    governorate: "Beheira",
    category: "Monastery",
    description:
      "A group of historic Coptic monasteries considered among the oldest Christian monastic communities in the world.",
    image: "/images/beheira/wadi-el-natrun.jpg",
    rating: 4.9,
    coordinates: {
      lat: 30.3648,
      lng: 30.5302,
    },
  },
  {
    id: "beheira-4",
    name: "Edku Lake",
    governorate: "Beheira",
    category: "Lake",
    description:
      "A large coastal lake known for fishing, birdlife, and beautiful natural scenery.",
    image: "/images/beheira/edku-lake.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.2968,
      lng: 30.2096,
    },
  },
  {
    id: "beheira-5",
    name: "Rosetta Corniche",
    governorate: "Beheira",
    category: "Waterfront",
    description:
      "A scenic promenade overlooking the Nile where it approaches the Mediterranean Sea.",
    image: "/images/beheira/rosetta-corniche.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.3994,
      lng: 30.4178,
    },
  },

  // =========================
  // Kafr El Sheikh
  // =========================
  {
    id: "kafrelsheikh-1",
    name: "Burullus Lake",
    governorate: "Kafr El Sheikh",
    category: "Nature Reserve",
    description:
      "A protected wetland famous for migratory birds, fishing villages, and biodiversity.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3f/Lake_Burullus_Egypt.jpg",
    rating: 4.8,
    coordinates: {
      lat: 31.483,
      lng: 30.85,
    },
  },
  {
    id: "kafrelsheikh-2",
    name: "Baltim Beach",
    governorate: "Kafr El Sheikh",
    category: "Beach",
    description:
      "A popular Mediterranean beach destination known for its clean shoreline and summer resorts.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Baltim_Resort_Coastline.jpg",
    rating: 4.7,
    coordinates: {
      lat: 31.563,
      lng: 31.093,
    },
  },
  {
    id: "kafrelsheikh-3",
    name: "Kafr El Sheikh Museum",
    governorate: "Kafr El Sheikh",
    category: "Museum",
    description:
      "A modern museum displaying archaeological discoveries from the Nile Delta and ancient Buto.",
    image: "/images/kafr-el-sheikh/museum.jpg",
    rating: 4.7,
    coordinates: {
      lat: 31.1108,
      lng: 30.9397,
    },
  },
  {
    id: "kafrelsheikh-4",
    name: "Buto Archaeological Site",
    governorate: "Kafr El Sheikh",
    category: "Archaeological Site",
    description:
      "The ancient city of Buto, one of Egypt's oldest settlements and an important archaeological site.",
    image: "/images/kafr-el-sheikh/buto.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.2007,
      lng: 30.8193,
    },
  },
  {
    id: "kafrelsheikh-5",
    name: "Desouk Nile Corniche",
    governorate: "Kafr El Sheikh",
    category: "Waterfront",
    description:
      "A peaceful riverside promenade overlooking the Nile with cafés and gardens.",
    image: "/images/kafr-el-sheikh/desouk-corniche.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.1327,
      lng: 30.6458,
    },
  },

  // =========================
  // Damietta
  // =========================
  {
    id: "damietta-1",
    name: "Ras El Bar",
    governorate: "Damietta",
    category: "Beach",
    description:
      "A famous seaside resort where the Nile meets the Mediterranean Sea.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Ras_El_Bar_Meeting_Point.jpg",
    rating: 4.8,
    coordinates: {
      lat: 31.509,
      lng: 31.842,
    },
  },
  {
    id: "damietta-2",
    name: "Damietta Corniche",
    governorate: "Damietta",
    category: "Waterfront",
    description:
      "A scenic promenade along the Damietta branch of the Nile with cafés and gardens.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/fb/Damietta_Nile_Corniche.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.4175,
      lng: 31.8144,
    },
  },
  {
    id: "damietta-3",
    name: "Ezbet El Borg",
    governorate: "Damietta",
    category: "Harbor",
    description:
      "A famous fishing town known for traditional boat building and fresh seafood markets.",
    image: "/images/damietta/ezbet-el-borg.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.5097,
      lng: 31.8475,
    },
  },
  {
    id: "damietta-4",
    name: "Damietta Lighthouse",
    governorate: "Damietta",
    category: "Landmark",
    description:
      "A historic lighthouse overlooking the Mediterranean coastline near Ras El Bar.",
    image: "/images/damietta/lighthouse.jpg",
    rating: 4.4,
    coordinates: {
      lat: 31.5156,
      lng: 31.8502,
    },
  },
  {
    id: "damietta-5",
    name: "New Damietta Beach",
    governorate: "Damietta",
    category: "Beach",
    description:
      "A modern beach destination featuring clean shores, cafés, and recreational facilities.",
    image: "/images/damietta/new-damietta-beach.jpg",
    rating: 4.7,
    coordinates: {
      lat: 31.4469,
      lng: 31.6951,
    },
  },

  // =========================
  // Matrouh
  // =========================
  {
    id: "matrouh-1",
    name: "Cleopatra Beach",
    governorate: "Matrouh",
    category: "Beach",
    description:
      "One of Egypt's most beautiful beaches, famous for crystal-clear turquoise water and white sand.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/07/Cleopatra_Beach_Marsa_Matrouh.jpg",
    rating: 5.0,
    coordinates: {
      lat: 31.354,
      lng: 27.216,
    },
  },
  {
    id: "matrouh-2",
    name: "Rommel Cave Museum",
    governorate: "Matrouh",
    category: "Museum",
    description:
      "A historic cave used by Field Marshal Erwin Rommel during World War II, now converted into a museum.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f9/Rommel_Cave_Marsa_Matrouh.jpg",
    rating: 4.6,
    coordinates: {
      lat: 31.352,
      lng: 27.233,
    },
  },
  {
    id: "matrouh-3",
    name: "Agiba Beach",
    governorate: "Matrouh",
    category: "Beach",
    description:
      "A breathtaking beach surrounded by limestone cliffs and turquoise Mediterranean waters.",
    image: "/images/matrouh/agiba-beach.jpg",
    rating: 5.0,
    coordinates: {
      lat: 31.3032,
      lng: 27.2378,
    },
  },
  {
    id: "matrouh-4",
    name: "Al Obayed Beach",
    governorate: "Matrouh",
    category: "Beach",
    description:
      "A quiet sandy beach known for its crystal-clear waters and relaxing atmosphere.",
    image: "/images/matrouh/al-obayed-beach.jpg",
    rating: 4.9,
    coordinates: {
      lat: 31.2897,
      lng: 27.1178,
    },
  },
  {
    id: "matrouh-5",
    name: "Salt Cave",
    governorate: "Matrouh",
    category: "Nature",
    description:
      "A unique natural attraction offering a relaxing environment created from pure rock salt.",
    image: "/images/matrouh/salt-cave.jpg",
    rating: 4.5,
    coordinates: {
      lat: 31.3528,
      lng: 27.2336,
    },
  },

  // =========================
  // New Valley
  // =========================
  {
    id: "newvalley-1",
    name: "White Desert National Park",
    governorate: "New Valley",
    category: "Nature Reserve",
    description:
      "A spectacular desert landscape famous for its unique white chalk rock formations.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/White_Desert_Egypt_Formations.jpg",
    rating: 5.0,
    coordinates: {
      lat: 27.258,
      lng: 28.268,
    },
  },
  {
    id: "newvalley-2",
    name: "Kharga Oasis",
    governorate: "New Valley",
    category: "Oasis",
    description:
      "The largest oasis in Egypt's Western Desert, known for ancient temples, springs, and palm groves.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/87/Hibis_Temple_Kharga_Oasis.jpg",
    rating: 4.7,
    coordinates: {
      lat: 25.451,
      lng: 30.546,
    },
  },
  {
    id: "newvalley-3",
    name: "Dakhla Oasis",
    governorate: "New Valley",
    category: "Oasis",
    description:
      "A beautiful oasis filled with palm groves, hot springs, mud-brick villages, and historic monuments.",
    image: "/images/new-valley/dakhla-oasis.jpg",
    rating: 4.9,
    coordinates: {
      lat: 25.4873,
      lng: 28.9802,
    },
  },
  {
    id: "newvalley-4",
    name: "Mut Village",
    governorate: "New Valley",
    category: "Village",
    description:
      "The historic capital of Dakhla Oasis, famous for traditional mud-brick architecture.",
    image: "/images/new-valley/mut-village.jpg",
    rating: 4.6,
    coordinates: {
      lat: 25.4914,
      lng: 28.9798,
    },
  },
  {
    id: "newvalley-5",
    name: "Temple of Hibis",
    governorate: "New Valley",
    category: "Temple",
    description:
      "The largest and best-preserved Persian-period temple in Egypt, located in Kharga Oasis.",
    image: "/images/new-valley/hibis-temple.jpg",
    rating: 4.8,
    coordinates: {
      lat: 25.4664,
      lng: 30.5468,
    },
  },
];

export default places;
