import React, { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import Button from "../../components/common/Button.jsx";
import SearchInput from "../../components/common/SearchInput.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import Badge from "../../components/common/Badge.jsx";
import Avatar from "../../components/common/Avatar.jsx";
import { currentAdmin } from "../../data/mockData.js";
import AddGuideModal from "../../components/modals/AddGuideModal.jsx";
import EditGuideModal from "../../components/modals/EditGuideModal.jsx";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal.jsx";
import GuideDetailPanel from "../../components/common/GuideDetailPanel.jsx";
import Pagination from "../../components/common/Pagination.jsx";

export default function Guides() {
  const [guides, setGuides] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guideToEdit, setGuideToEdit] = useState(null);
  const [guideToDelete, setGuideToDelete] = useState(null);
  const [viewingGuide, setViewingGuide] = useState(null);

  const ITEMS_PER_PAGE = 5;

  const prepareGuideForState = (guide, intendedStatus) => {
    const status =
      intendedStatus ||
      guide.status ||
      (guide.verified ? "Approved" : "Pending");
    return {
      ...guide,
      id: guide._id,
      status: status,
      languages: Array.isArray(guide.languages) ? guide.languages : [],
    };
  };

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tourguide-profiles");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setGuides(data.map((guide) => prepareGuideForState(guide)));
      } catch (error) {
        console.error("Failed to fetch guides:", error);
      }
    };
    fetchGuides();
  }, []);

  const handleAddGuide = async (newGuideData) => {
    try {
      const payload = {
        name: newGuideData.name,
        city: newGuideData.city,
        avatar: newGuideData.avatar,
        languages: newGuideData.languages,
        owner: [...Array(24)]
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
      };

      const response = await fetch("http://localhost:5000/api/tourguide-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to add guide");

      const createdGuide = await response.json();
      const newGuide = prepareGuideForState(createdGuide);
      setGuides([newGuide, ...guides]);
    } catch (error) {
      console.error("Failed to add guide:", error);
    }
  };

  const handleUpdateGuide = async (guideData) => {
    try {
      const payload = {
        name: guideData.name,
        avatar: guideData.avatar,
        bio: guideData.bio,
        city: guideData.city,
        rate: guideData.rate,
        phone: guideData.phone,
        email: guideData.email,
        languages: guideData.languages,
        status: guideData.status,
      };

      if (typeof guideData.verified === "boolean") {
        payload.verified = guideData.verified;
      }

      const response = await fetch(`http://localhost:5000/api/tourguide-profiles/${guideData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update guide");
      const updatedGuideResponse = await response.json();
      const updatedGuide = prepareGuideForState(
        updatedGuideResponse,
        guideData.status,
      );

      setGuides(
        guides.map((g) => (g.id === updatedGuide.id ? updatedGuide : g)),
      );
      setGuideToEdit(null);
      setViewingGuide((prev) =>
        prev && prev.id === updatedGuide.id ? updatedGuide : prev,
      );
    } catch (error) {
      console.error("Failed to update guide:", error);
    }
  };

  const handleDeleteGuide = async (guideId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tourguide-profiles/${guideId}`, {
        method: "DELETE",
      });
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
          <Avatar src={row.avatar} alt={row.name} size="sm" />
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
            className="text-ink-400 hover:text-[#fe6800]"
            onClick={() => setGuideToEdit(row)}
          >
            <Edit size={16} />
          </button>
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
      sidebarProps={{ active: "/guides", footer: "status", showLogo: false }}
      topbarProps={{
        title: "Dashboard - Guides Mgmt",
        user: currentAdmin.users,
        showLogout: true,
        logoutVariant: "text",
      }}
    >
      <PageHeader
        title="Tour Guides Management"
        description="Review, approve, and manage tour guides on the platform."
        action={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Guide
          </Button>
        }
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
              onSuspend={() =>
                handleUpdateGuideStatus(viewingGuide.id, "Suspended")
              }
            />
          </div>
        )}
      </div>

      <AddGuideModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddGuide}
      />
      <EditGuideModal
        isOpen={!!guideToEdit}
        onClose={() => setGuideToEdit(null)}
        onUpdate={handleUpdateGuide}
        guide={guideToEdit}
      />
      <DeleteConfirmationModal
        isOpen={!!guideToDelete}
        onClose={() => setGuideToDelete(null)}
        onConfirm={() => handleDeleteGuide(guideToDelete.id)}
        itemName={guideToDelete?.name}
      />
    </DashboardLayout>
  );
}
