// Centralized mock data for the dashboard demo. In a real app each of these
// would come from an API call; keeping them here makes every page a pure
// function of props/data so components stay reusable.

export const currentAdmin = {
  dashboard: {
    name: "Ahmed Mohamed",
    role: "System Admin",
    avatarUrl: "https://i.pravatar.cc/80?img=12",
  },
  guides: {
    name: "Ahmed El-Saadani",
    role: "System Administrator",
    avatarUrl: "https://i.pravatar.cc/80?img=12",
  },
  places: {
    name: "Admin Manager",
    role: "admin@tourismapp.com",
    avatarUrl: "https://i.pravatar.cc/80?img=12",
  },
  users: {
    name: "System Admin",
    role: "",
    avatarUrl: "https://i.pravatar.cc/80?img=47",
  },
};

export const bookingsChart = [
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
  { day: "Mon", value: 0 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 0 },
  { day: "Fri", value: 0 },
];

export const mostSearchedCities = [
  {
    name: "Jeddah",
    searches: 4200,
    max: 4200,
    image:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=100&h=100&fit=crop",
  },
  {
    name: "Riyadh",
    searches: 3850,
    max: 4200,
    image:
      "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=100&h=100&fit=crop",
  },
  {
    name: "Al-Ula",
    searches: 2100,
    max: 4200,
    image:
      "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=100&h=100&fit=crop",
  },
];

export const recentActivities = [
  {
    id: 1,
    type: "guide",
    text: "Mohammed Al-Otaibi joined as a new guide in Mecca.",
    time: "15 minutes ago",
  },
  {
    id: 2,
    type: "booking",
    text: 'Confirmed booking for "Thumamah Desert" for 4 people.',
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "report",
    text: "A report was submitted against a guide in Abha region.",
    time: "2 hours ago",
  },
  {
    id: 4,
    type: "review",
    text: '"Al-Tayebat Museum" received a 5-star rating.',
    time: "4 hours ago",
  },
];

export const recentBookings = [
  {
    id: "#TRV-8902",
    tourist: "Sarah Mansour",
    initials: "SM",
    destination: "Al-Ula - Elephant Rock",
    date: "May 24, 2024",
    status: "Completed",
  },
  {
    id: "#TRV-8903",
    tourist: "John Anderson",
    initials: "JA",
    destination: "Jeddah - Historic Al-Balad",
    date: "May 25, 2024",
    status: "In Progress",
  },
  {
    id: "#TRV-8904",
    tourist: "Fahd Al-Ali",
    initials: "FA",
    destination: "Riyadh - At-Turaif District",
    date: "May 25, 2024",
    status: "Confirmed",
  },
  {
    id: "#TRV-8905",
    tourist: "Khaled Abdullah",
    initials: "KA",
    destination: "NEOM - Discovery Trip",
    date: "May 26, 2024",
    status: "Cancelled",
  },
];

export const guides = [
  {
    id: 1,
    name: "Mohammed Al-Harbi",
    location: "Jeddah, Saudi Arabia",
    status: "Approved",
    rating: 4.9,
    trips: 312,
    avatar: "https://i.pravatar.cc/80?img=51",
    languages: ["Arabic", "English"],
  },
  {
    id: 2,
    name: "Noura Al-Qahtani",
    location: "AlUla, Saudi Arabia",
    status: "Pending",
    rating: null,
    trips: 0,
    avatar: "https://i.pravatar.cc/80?img=32",
    languages: ["Arabic"],
  },
  {
    id: 3,
    name: "Fahd Al-Shammari",
    location: "Hail, Saudi Arabia",
    status: "Suspended",
    rating: 4.2,
    trips: 88,
    avatar: "https://i.pravatar.cc/80?img=13",
    languages: ["Arabic", "English"],
  },
  {
    id: 4,
    name: "Salman Al-Dossari",
    location: "Tabuk, Saudi Arabia",
    status: "Approved",
    rating: 5.0,
    trips: 42,
    avatar: "https://i.pravatar.cc/80?img=14",
    languages: ["Arabic", "English", "French"],
  },
];

export const selectedGuideDetail = {
  name: "Sarah Al-Otaibi",
  title: "Certified Tour Guide - Riyadh",
  status: "Pending",
  avatar: "https://i.pravatar.cc/160?img=45",
  totalBookings: 156,
  cancellationRate: "2.4%",
  documents: [
    { id: 1, name: "National_Guide_Cert.pdf" },
    { id: 2, name: "National_ID.jpg" },
  ],
};

export const places = [
  {
    id: 1,
    name: "Hegra (Madain Salih)",
    location: "AlUla, Saudi Arabia",
    image:
      "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800&h=500&fit=crop",
    tag: "Most Visited",
    arabicContent:
      "يعتبر موقع الحِجر أول موقع سعودي يدرج في قائمة اليونسكو للتراث العالمي...",
    englishContent:
      "Hegra is the first World Heritage site in Saudi Arabia to be inscribed by UNESCO...",
    culturalTips: [
      "Modest dress required",
      "Photography allowed",
      "Book in advance",
    ],
    variant: "featured",
  },
  {
    id: 2,
    name: "Boulevard World",
    location: "Riyadh - International Entertainment City",
    image:
      "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=400&h=300&fit=crop",
    status: "Active",
    completion: 100,
    variant: "compact",
  },
  {
    id: 3,
    name: "Jeddah Al Balad",
    location: "Jeddah - Historical District",
    image:
      "https://images.unsplash.com/photo-1590059390047-72433d0b3d3b?w=400&h=300&fit=crop",
    status: "Under Review",
    completion: 65,
    variant: "compact",
  },
];

export const latestPlaceUpdates = [
  {
    id: 1,
    name: "National Museum",
    thumb:
      "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=80&h=80&fit=crop",
    modifiedBy: "Ahmed Al-Shammari",
    date: "Oct 12, 2023",
    status: "Updated",
  },
  {
    id: 2,
    name: "Edge of the World",
    thumb:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=80&h=80&fit=crop",
    modifiedBy: "Sarah Al-Ghamdi",
    date: "Oct 11, 2023",
    status: "New",
  },
];

export const tourists = [
  {
    id: 1,
    name: "Ahmed Mansour",
    email: "ahmed.m@email.com",
    joined: "Oct 12, 2023",
    location: "Riyadh, Saudi Arabia",
    status: "Active",
    spent: 2450,
    activity: 80,
    avatar: "https://i.pravatar.cc/80?img=33",
  },
  {
    id: 2,
    name: "John Doe",
    email: "john.fake@domain.com",
    joined: "Nov 5, 2023",
    location: "London, UK",
    status: "Suspicious",
    spent: 500,
    activity: 20,
    avatar: "https://i.pravatar.cc/80?img=68",
  },
  {
    id: 3,
    name: "Fatima Zahra",
    email: "fatima.z@mail.com",
    joined: "Nov 20, 2023",
    location: "Casablanca, Morocco",
    status: "Active",
    spent: 1200,
    activity: 70,
    avatar: "https://i.pravatar.cc/80?img=47",
  },
];

export const touristDetail = {
  name: "Ahmed Mansour",
  email: "ahmed.m@email.com",
  avatar: "https://i.pravatar.cc/160?img=33",
  online: true,
  joinedDate: "Oct 12, 2023",
  lastSeen: "2 hours ago",
  country: "Saudi Arabia",
  phone: "+966 50 XXX XXXX",
  activityLog: [
    {
      id: 1,
      type: "booking",
      text: "Booked a trip to AlUla",
      time: "Yesterday at 04:30 PM",
    },
    {
      id: 2,
      type: "review",
      text: "Added a rating (5 stars)",
      time: "2 days ago",
    },
    { id: 3, type: "login", text: "Logged in from Riyadh", time: "3 days ago" },
  ],
};
