import React, { useState, useEffect } from "react";
import { Eye, Trash2 } from "lucide-react";
import DashboardLayout from "../../Components/Layout/DashboardLayout.jsx";
import PageHeader from "../../Components/common/PageHeader.jsx";
import SearchInput from "../../Components/common/SearchInput.jsx";
import DataTable from "../../Components/common/DataTable.jsx";
import Badge from "../../Components/common/Badge.jsx";
import Avatar from "../../Components/common/Avatar.jsx";
import DeleteConfirmationModal from "../../Components/modals/DeleteConfirmationModal.jsx";
import GuideDetailPanel from "../../Components/common/GuideDetailPanel.jsx";
import Pagination from "../../Components/common/Pagination.jsx";
import { authFetch } from '../../services/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function Guides() {
  const [guides, setGuides] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [guideToDelete, setGuideToDelete] = useState(null);
  const [viewingGuide, setViewingGuide] = useState(null);

  const ITEMS_PER_PAGE = 5;

  const prepareGuideForState = (guide, intendedStatus) => {
    const rawStatus = intendedStatus || guide.status || (guide.verified ? "approved" : "pending");
    const status = String(rawStatus).charAt(0).toUpperCase() + String(rawStatus).slice(1).toLowerCase();
    return {
      ...guide,
      id: guide._id,
      avatar: guide.avatar,
      status: status,
      languages: Array.isArray(guide.languages) ? guide.languages : [],
    };
  };

  useEffect(() => {
    const fetchGuidesAndData = async () => {
      try {
        const guidesResponse = await authFetch(
          `${API_BASE_URL}/tourguide-profiles/admin/all`,
        );
        if (!guidesResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const guidesData = await guidesResponse.json();

        const reviewsResponse = await authFetch(
          `${API_BASE_URL}/reviews?filter=guides`,
        );
        const reviewsData = reviewsResponse.ok
          ? await reviewsResponse.json()
          : [];

        const bookingsResponse = await authFetch(`${API_BASE_URL}/bookings`);
        const bookingsData = bookingsResponse.ok
          ? await bookingsResponse.json()
          : [];

        const reviewsByOwner = reviewsData.reduce((acc, review) => {
          if (review.tourGuideId) {
            const ownerId =
              typeof review.tourGuideId === "object" &&
              review.tourGuideId !== null
                ? review.tourGuideId._id
                : review.tourGuideId;
            if (!acc[ownerId]) {
              acc[ownerId] = [];
            }
            acc[ownerId].push(review);
          }
          return acc;
        }, {});

        const guideStats = bookingsData.reduce((acc, booking) => {
          if (booking.tourGuideId) {
            const guideId =
              typeof booking.tourGuideId === "object" &&
              booking.tourGuideId !== null
                ? booking.tourGuideId._id
                : booking.tourGuideId;
            if (!acc[guideId]) {
              acc[guideId] = { bookings: 0, completedTrips: 0 };
            }
            acc[guideId].bookings += 1;
            if (
              booking.status &&
              booking.status.toLowerCase() === "completed"
            ) {
              acc[guideId].completedTrips += 1;
            }
          }
          return acc;
        }, {});

        const guidesWithDetails = guidesData.map((guide) => {
          const ownerId =
            typeof guide.owner === "object" && guide.owner !== null
              ? guide.owner._id
              : guide.owner;
          const guideReviews = reviewsByOwner[ownerId] || [];
          const totalRating = guideReviews.reduce(
            (sum, r) => sum + r.rating,
            0,
          );
          const avgRating =
            guideReviews.length > 0 ? totalRating / guideReviews.length : 0;
          const stats = guideStats[ownerId] || {
            bookings: 0,
            completedTrips: 0,
          };

          return {
            ...guide,
            rating: avgRating.toFixed(1),
            bookings: stats.bookings,
            completedTrips: stats.completedTrips,
          };
        });

        setGuides(
          guidesWithDetails.map((guide) => prepareGuideForState(guide)),
        );
      } catch (error) {
        console.error("Failed to fetch guides and related data:", error);
      }
    };
    fetchGuidesAndData();
  }, []);

  const handleUpdateGuide = async (guideData) => {
    try {
      const payload = {
        name: guideData.name,
        avatarUrl: guideData.avatarUrl,
        bio: guideData.bio,
        city: guideData.city,
        rate: guideData.rate,
        phone: guideData.phone,
        email: guideData.email,
        languages: guideData.languages,
      };

      if (guideData.status) {
        payload.status = guideData.status.toLowerCase();
      }
      if (typeof guideData.verified === "boolean") {
        payload.verified = guideData.verified;
      }

      const response = await authFetch(
        `${API_BASE_URL}/tourguide-profiles/${guideData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Failed to update guide");
      const updatedGuideFromServer = await response.json();
      const mergedData = { ...guideData, ...updatedGuideFromServer };
      const updatedGuide = prepareGuideForState(mergedData, guideData.status);

      setGuides(
        guides.map((g) => (g.id === updatedGuide.id ? updatedGuide : g)),
      );
      setViewingGuide((prev) =>
        prev && prev.id === updatedGuide.id ? updatedGuide : prev,
      );
    } catch (error) {
      console.error("Failed to update guide:", error);
    }
  };

  const handleDeleteGuide = async (guideId) => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/tourguide-profiles/${guideId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete guide");
      setGuides(guides.filter((g) => g.id !== guideId));
      setGuideToDelete(null);
    } catch (error) {
      console.error("Failed to delete guide:", error);
    }
  };

  const handleUpdateGuideStatus = async (guideId, status) => {
    const guideToUpdate = guides.find((g) => g.id === guideId);
    if (!guideToUpdate) return;
    const updatedGuide = {
      ...guideToUpdate,
      status,
      verified: status === "Approved",
    };
    await handleUpdateGuide(updatedGuide);
  };

  const filteredGuides = guides.filter(
    (guide) =>
      (guide.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (guide.city || "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredGuides.length / ITEMS_PER_PAGE);
  const paginatedGuides = filteredGuides.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const columns = [
    {
      key: "name",
      header: "Guide Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatarUrl} alt={row.name} size="sm" />
          <span className="font-semibold text-ink-900">{row.name}</span>
        </div>
      ),
    },
    { key: "city", header: "Location" },
    {
      key: "languages",
      header: "Languages",
      render: (row) => (row.languages || []).join(", "),
    },
    {
      key: "rating",
      header: "Rating",
      render: (row) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span>{row.rating}</span>
        </div>
      ),
    },
    { key: "completedTrips", header: "Trips" },
    {
      key: "bookings",
      header: "Bookings",
      render: (row) => row.bookings || 0,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge label={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            className="text-ink-400 hover:text-red-500"
            onClick={() => setGuideToDelete(row)}
          >
            <Trash2 size={16} />
          </button>
          <button
            className="text-ink-400 hover:text-[#fe6800]"
            onClick={() => setViewingGuide(row)}
          >
            <Eye size={16} /> {/* Assuming this is for a detail view */}
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      sidebarProps={{ active: "/guides", footer: "logout", showLogo: false }}
      topbarProps={{
        title: "Dashboard - Guides Management",
        showLogout: true,
        logoutVariant: "text",
      }}
    >
      <PageHeader
        title="Tour Guides Management"
        description="Review, approve, and manage tour guides on the platform."
      />

      <div className="mb-6">
        <SearchInput
          placeholder="Search for guide name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div
          className={`transition-all duration-300 ${viewingGuide ? "lg:col-span-2" : "lg:col-span-3"}`}
        >
          <DataTable columns={columns} rows={paginatedGuides} />
          {totalPages > 1 && (
            <Pagination
              className="mt-4 justify-center"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
        {viewingGuide && (
          <div className="lg:col-span-1 sticky top-6">
            <GuideDetailPanel
              guide={viewingGuide}
              onClose={() => setViewingGuide(null)}
              onApprove={() =>
                handleUpdateGuideStatus(viewingGuide.id, "Approved")
              }
              onReject={() =>
                handleUpdateGuideStatus(viewingGuide.id, "Rejected")
              }
              onSuspend={() =>
                handleUpdateGuideStatus(viewingGuide.id, "Suspended")
              }
            />
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!guideToDelete}
        onClose={() => setGuideToDelete(null)}
        onConfirm={() => handleDeleteGuide(guideToDelete.id)}
        itemName={guideToDelete?.name}
      />
    </DashboardLayout>
  );
}
