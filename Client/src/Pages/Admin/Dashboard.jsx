import React, { useState, useEffect, useMemo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Users, UserCheck, MapPin, CalendarCheck } from "lucide-react";
import DashboardLayout from "../../Components/Layout/DashboardLayout.jsx";
import PageHeader from "../../Components/common/PageHeader.jsx";
import Card from "../../Components/common/Card.jsx";
import BarChart from "../../Components/common/BarChart.jsx";
import RankedList from "../../Components/common/RankedList.jsx";
import ActivityTimeline from "../../Components/common/ActivityTimeline.jsx";
import DataTable from "../../Components/common/DataTable.jsx";
import Avatar from "../../Components/common/Avatar.jsx";
import Badge from "../../Components/common/Badge.jsx";
import { authFetch } from '../../services/authFetch';
import { useAuth } from '../../auth/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const getPlacesByCity = (places) => {
  if (!places || places.length === 0) {
    return [];
  }

  const cityCounts = places.reduce((acc, place) => {
    const city = place.city;
    if (city) {
      if (!acc[city]) {
        acc[city] = { count: 0, image: place.imageUrl };
      }
      acc[city].count++;
    }
    return acc;
  }, {});

  const citiesArray = Object.keys(cityCounts).map((city) => ({
    name: city,
    count: cityCounts[city].count,
    image: cityCounts[city].image,
  }));

  // Sort by number of stored Places and take the three largest groups.
  citiesArray.sort((a, b) => b.count - a.count);
  const topCities = citiesArray.slice(0, 3);

  if (topCities.length === 0) {
    return [];
  }

  const maxCount = topCities[0].count;

  return topCities.map((city) => ({
    ...city,
    max: maxCount,
  }));
};

function AnimatedCounter({ value, suffix = "", delay = 0 }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v);
    return suffix === "%"
      ? `${rounded}${suffix}`
      : rounded.toLocaleString() + suffix;
  });

  useEffect(() => {
    const timeout = setTimeout(() => spring.set(value), delay * 1000);
    return () => clearTimeout(timeout);
  }, [value, delay, spring]);

  return (
    <motion.span className="text-3xl font-bold text-slate-900">
      {display}
    </motion.span>
  );
}

function StatCardSkeleton() {
  return (
    <div className="relative bg-white rounded-3xl p-5 border border-slate-200 shadow-xl overflow-hidden">
      <div className="animate-pulse flex flex-col gap-4">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 bg-slate-200 rounded w-24"></div>
          <div className="h-9 w-9 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex items-end justify-between">
          <div className="h-8 bg-slate-200 rounded w-20"></div>
          <div className="h-5 bg-slate-200 rounded-full w-28"></div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [totalTourists, setTotalTourists] = useState(0);
  const [isLoadingTourists, setIsLoadingTourists] = useState(true); // Used for the tourist stat card
  const [guides, setGuides] = useState([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [timelineActivities, setTimelineActivities] = useState([]);

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoadingPlaces(true);
      try {
        const response = await authFetch(`${API_BASE_URL}/places`);
        if (!response.ok) {
          throw new Error("Failed to fetch places");
        }
        const data = await response.json();
        setPlaces(data);
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setIsLoadingPlaces(false);
      }
    };
    fetchPlaces();
  }, []);

  useEffect(() => {
    const fetchGuides = async () => {
      setIsLoadingGuides(true);
      try {
        const response = await authFetch(`${API_BASE_URL}/tourguide-profiles`);
        if (!response.ok) {
          throw new Error("Failed to fetch guides");
        }
        const data = await response.json();
        setGuides(data);
      } catch (error) {
        console.error("Error fetching guides:", error);
      } finally {
        setIsLoadingGuides(false);
      }
    };
    fetchGuides();
  }, []);

  useEffect(() => {
    // This effect fetches all booking data and processes it for the dashboard.
    const fetchBookings = async () => {
      // Set loading states for all UI elements that depend on booking data.
      setIsLoadingBookings(true);
      setIsLoadingTourists(true);
      try {
        const response = await authFetch(`${API_BASE_URL}/bookings`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings from the server.");
        }
        const rawBookings = await response.json();
        if (!Array.isArray(rawBookings)) {
          throw new Error("Booking data from server is not an array.");
        }

        const uniqueTouristIds = new Set(rawBookings.map((b) => b.touristId));
        setTotalTourists(uniqueTouristIds.size);

        const formattedBookings = rawBookings.map((booking) => ({
          id: booking.tripId,
          tourist: booking.touristName || "N/A",
          destination: booking.tripTitle || "N/A",
          date: booking.createdAt,
          status: booking.status,
          touristimg: booking.touristimg || "", // Assuming the API provides this field
          tourguideimg: booking.tourguideimg || "", // Assuming the API provides this field
        }));
        setBookings(formattedBookings);

        // 3. Format data for the "Recent Activities" Timeline.
        // We create a descriptive text from the booking details.
        const recentActivities = rawBookings
          .slice(0, 5) // Assuming API returns sorted by most recent
          .map((booking) => ({
            id: booking._id,
            type: "booking",
            text: `Booking for "${booking.tripTitle || "N/A"}" by ${
              booking.touristName || "N/A"
            } was ${booking.status.toLowerCase()}.`,
            time: new Date(booking.createdAt).toLocaleString(),
          }));
        setTimelineActivities(recentActivities);
      } catch (error) {
        console.error("Error fetching and processing bookings:", error);
        // On error, reset all booking-related data to a clean state.
        setTotalTourists(0);
        setBookings([]);
        setTimelineActivities([]);
      } finally {
        // Ensure loading indicators are turned off regardless of success or failure.
        setIsLoadingBookings(false);
        setIsLoadingTourists(false);
      }
    };
    fetchBookings();
  }, []);

  const generateBookingsChartData = (bookings) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const last7DaysData = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - (6 - index));
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return { date: dateKey, day: daysOfWeek[date.getDay()], value: 0 };
    });

    for (const booking of bookings || []) {
      const timestamp = booking.createdAt || booking.updatedAt || booking.date;
      const bookingDate = timestamp ? new Date(timestamp) : null;
      if (!bookingDate || Number.isNaN(bookingDate.getTime())) continue;
      const dateKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, "0")}-${String(bookingDate.getDate()).padStart(2, "0")}`;
      const dayData = last7DaysData.find((entry) => entry.date === dateKey);
      if (dayData) dayData.value += 1;
    }

    return last7DaysData.map(({ day, value }) => ({ day, value }));
  };

  const activeGuides = guides.filter((g) => g.verified).length;
  const totalPlaces = places.length;
  const totalBookings = bookings.length;

  const mostSearchedCities = useMemo(
    () => getPlacesByCity(places),
    [places],
  );

  const statIcons = {
    "Total Tourists": Users,
    "Active Guides": UserCheck,
    "Total Places": MapPin,
    Bookings: CalendarCheck,
  };

  const statIconColors = {
    "Total Tourists": "text-blue-500 bg-blue-50",
    "Active Guides": "text-green-500 bg-green-50",
    "Total Places": "text-orange-500 bg-orange-50",
    Bookings: "text-purple-500 bg-purple-50",
  };

  const getBadgeColor = (trend) => {
    if (trend.startsWith("+")) return "bg-green-50 text-green-600";
    if (trend.startsWith("-")) return "bg-red-50 text-red-600";
    return "bg-slate-100 text-slate-600";
  };

  const dashboardStats = [
    {
      label: "Total Tourists",
      value: totalTourists,
      isLoading: isLoadingTourists,
      icon: statIcons["Total Tourists"],
      iconColor: statIconColors["Total Tourists"],
    },
    {
      label: "Active Guides",
      value: activeGuides,
      isLoading: isLoadingGuides,
      icon: statIcons["Active Guides"],
      iconColor: statIconColors["Active Guides"],
    },
    {
      label: "Total Places",
      value: totalPlaces,
      isLoading: isLoadingPlaces,
      icon: statIcons["Total Places"],
      iconColor: statIconColors["Total Places"],
    },
    {
      label: "Bookings",
      value: totalBookings,
      isLoading: isLoadingBookings,
      icon: statIcons["Bookings"],
      iconColor: statIconColors["Bookings"],
    },
  ];

  const bookingColumns = [
    {
      key: "tourist",
      header: "Tourist",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar src={row.touristimg} alt={row.touristimg} size="xs" />
          <span>{row.tourist}</span>
        </div>
      ),
    },
    { key: "destination", header: "Destination" },
    {
      key: "date",
      header: "Date",
      render: (row) =>
        new Date(row.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge label={row.status} />,
    },
  ];

  return (
    <DashboardLayout
      sidebarProps={{ active: "/", showLogo: false, footer: "logout" }}
      topbarProps={{
        title: "Dashboard",
        showLogout: true,
        logoutVariant: "text",
      }}
    >
      <PageHeader
        title={`Welcome back, ${user?.name || 'Admin'}!`}
        description="Here's a summary of your tourism platform's activity."
      />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6"
      >
        {dashboardStats.map((s, i) =>
          s.isLoading ? (
            <StatCardSkeleton key={s.label} />
          ) : (
            <motion.div
              key={s.label}
              variants={{
                hidden: { opacity: 0, y: 28, scale: 0.94 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{
                y: -5,
                boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
              }}
              className="relative bg-white rounded-3xl p-5 border border-slate-200 shadow-xl overflow-hidden group"
            >
              <div className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {s.label}
                </span>
                <motion.div className={`p-2 rounded-lg ${s.iconColor}`}>
                  <s.icon size={18} />
                </motion.div>
              </div>
              <div className="flex items-end justify-between">
                <AnimatedCounter value={s.value} delay={0.2 + i * 0.1} />
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">Current total</span>
              </div>
            </motion.div>
          ),
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-semibold text-ink-900 mb-4">7-Day Bookings</h3>
            <BarChart data={generateBookingsChartData(bookings)} />
          </Card>
        </div>
        <div>
          <Card>
            <h3 className="font-semibold text-ink-900 mb-4">
              Places by City
            </h3>
            {isLoadingPlaces ? (
              <div className="text-center p-4">Loading...</div>
            ) : (
              <RankedList items={mostSearchedCities} unitLabel="places" />
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="p-5">
              <h3 className="font-semibold text-ink-900">Recent Bookings</h3>
            </div>
            <DataTable columns={bookingColumns} rows={bookings.slice(0, 5)} />
          </Card>
        </div>
        <div>
          <Card>
            <h3 className="font-semibold text-ink-900 mb-4">
              Recent Activities
            </h3>
            <ActivityTimeline items={timelineActivities} />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
