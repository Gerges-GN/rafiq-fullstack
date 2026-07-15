import React, { useState, useEffect } from "react";
import { Plus, Eye } from "lucide-react";
import DashboardLayout from "../../Components/Layout/DashboardLayout.jsx";
import PageHeader from "../../Components/common/PageHeader.jsx";
import Button from "../../Components/common/Button.jsx";
import SearchInput from "../../Components/common/SearchInput.jsx";
import FilterDropdown from "../../Components/common/FilterDropdown.jsx";
import PlaceCard from "../../Components/common/PlaceCard.jsx";
import AddPlaceCard from "../../Components/common/AddPlaceCard.jsx";
import Card from "../../Components/common/Card.jsx";
import DataTable from "../../Components/common/DataTable.jsx";
import Badge from "../../Components/common/Badge.jsx";
import { currentAdmin } from "../../data/mockData.js";
import AddPlaceModal from "../../Components/modals/AddPlaceModal.jsx";
import PlaceDetailModal from "../../Components/common/PlaceDetailModal.jsx";
import EditPlaceModal from "../../Components/modals/EditPlaceModal.jsx";
import DeleteConfirmationModal from "../../Components/modals/DeleteConfirmationModal.jsx";
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
const getPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set();

  for (let i = 1; i <= 5; i++) {
    pages.add(i);
  }

  pages.add(totalPages - 1);
  pages.add(totalPages);

  for (let i = -1; i <= 1; i++) {
    const page = currentPage + i;
    if (page > 0 && page <= totalPages) {
      pages.add(page);
    }
  }

  const sortedPages = Array.from(pages).sort((a, b) => a - b);

  const result = [];
  let lastPage = 0;
  for (const page of sortedPages) {
    if (lastPage !== 0 && page - lastPage > 1) {
      result.push("...");
    }
    result.push(page);
    lastPage = page;
  }

  return result;
};

const getLatestUpdates = (places) => {
  const sortedPlaces = [...places].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB - dateA;
  });

  return sortedPlaces.slice(0, 5).map((place) => {
    const createdAt = new Date(place.createdAt);
    const updatedAt = new Date(place.updatedAt);
    const isNew = Math.abs(updatedAt - createdAt) < 60000;
    return {
      id: place.id,
      name: place.name,
      modifiedBy: currentAdmin.places.name,
      date: updatedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: isNew ? "New" : "Updated",
    };
  });
};

const ITEMS_PER_PAGE = 5;

export default function Places() {
  const [allPlaces, setAllPlaces] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [placeToEdit, setPlaceToEdit] = useState(null);
  const [placeToDelete, setPlaceToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/places`);
        if (!response.ok) {
          throw new Error("Failed to load tourist places.");
        }
        let data = await response.json();
        data = data.map((p) => ({
          ...p,
          id: p._id,
          location: p.city,
          image: p.imageUrl,
          googleMapEmbed: p.imageUrl,
        }));
        setAllPlaces(data);
      } catch (err) {
        console.error("Failed to fetch places:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const cities = [
    "All Cities",
    ...[...new Set(allPlaces.map((p) => p.location))].sort(),
  ];

  const categories = [
    "All Categories",
    ...[...new Set(allPlaces.map((p) => p.category))].sort(),
  ];

  const handleCardClick = (place) => {
    setSelectedPlace(place);
  };

  const handleCloseModal = () => {
    setSelectedPlace(null);
  };

  const handleAddPlace = async (newPlaceData) => {
    setError(null);
    try {
      const payload = {
        name: newPlaceData.name,
        description: newPlaceData.description,
        imageUrl: newPlaceData.image,
        category: newPlaceData.category,
        city: newPlaceData.location,
      };
      const response = await fetch(`${API_BASE_URL}/places/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to add place (status: ${response.status})`,
        );
      }

      const newPlace = await response.json();
      if (!newPlace || !newPlace._id) {
        throw new Error("Invalid response from server after adding place.");
      }

      const newPlaceForState = {
        ...newPlace,
        id: newPlace._id,
        location: newPlace.city,
        image: newPlace.imageUrl,
        googleMapEmbed: newPlace.imageUrl,
      };

      setAllPlaces((prevPlaces) => [newPlaceForState, ...prevPlaces]);
      setCurrentPage(1);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error adding place:", err);
      setError(err.message);
    }
  };

  const handleUpdatePlace = async (updatedPlace) => {
    setError(null);
    try {
      if (!updatedPlace || !updatedPlace.id) {
        throw new Error("Cannot update place without an ID.");
      }

      const payload = {
        name: updatedPlace.name,
        city: updatedPlace.location,
        category: updatedPlace.category,
        imageUrl: updatedPlace.image,
        description: updatedPlace.description,
      };

      const response = await fetch(`${API_BASE_URL}/places/${updatedPlace.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update place (status: ${response.status})`,
        );
      }

      const returnedPlace = await response.json();
      if (!returnedPlace || !returnedPlace._id) {
        throw new Error("Invalid response from server after updating place.");
      }

      const updatedPlaceForState = {
        ...returnedPlace,
        id: returnedPlace._id,
        location: returnedPlace.city,
        image: returnedPlace.imageUrl,
        googleMapEmbed: returnedPlace.imageUrl,
      };

      setAllPlaces((prevPlaces) =>
        prevPlaces.map((p) =>
          p.id === updatedPlaceForState.id ? updatedPlaceForState : p,
        ),
      );
      setPlaceToEdit(null);
    } catch (err) {
      console.error("Error updating place:", err);
      setError(err.message);
    }
  };

  const handleDeletePlace = async (placeId) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to delete place (status: ${response.status})`,
        );
      }

      setAllPlaces((prevPlaces) => prevPlaces.filter((p) => p.id !== placeId));
      setPlaceToDelete(null);
    } catch (err) {
      console.error("Error deleting place:", err);
      setError(err.message);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Place",
      render: (row) => (
        <div className="flex items-center">
          <span className="font-semibold text-ink-900">{row.name}</span>
        </div>
      ),
    },
    { key: "modifiedBy", header: "Modified By" },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge label={row.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const place = allPlaces.find((p) => p.id === row.id);
        return (
          <button
            className="text-ink-400 hover:text-[#fe6800]"
            onClick={() => place && handleCardClick(place)}
            aria-label={`View details for ${row.name}`}
          >
            <Eye size={16} />
          </button>
        );
      },
    },
  ];

  const filteredPlaces = allPlaces.filter((place) => {
    const searchLower = search.toLowerCase();
    const nameMatch = (place.name || "").toLowerCase().includes(searchLower);
    const locationMatch = (place.location || "")
      .toLowerCase()
      .includes(searchLower);
    const categorySearchMatch = (place.category || "")
      .toLowerCase()
      .includes(searchLower);
    const cityMatch =
      selectedCity === "All Cities" || place.location === selectedCity;
    const categoryMatch =
      selectedCategory === "All Categories" ||
      place.category === selectedCategory;

    return (
      (nameMatch || locationMatch || categorySearchMatch) &&
      cityMatch &&
      categoryMatch
    );
  });

  const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlaces = filteredPlaces.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const latestUpdates = getLatestUpdates(allPlaces);
  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <DashboardLayout
      sidebarProps={{ showLogo: false, footer: "logout", active: "/places" }}
      topbarProps={{
        title: "Dashboard - Tourism Mgmt",
        user: currentAdmin.places,
        showLogout: true,
        logoutVariant: "text",
      }}
    >
      <PageHeader
        title="Tourist Places Management"
        description="Add and update tourist locations in the system, including names, descriptions, and images for visitors."
        action={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New Place
          </Button>
        }
      />

      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <span className="font-medium">Error!</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-5">
            <h4 className="text-sm font-medium text-ink-500">Total Places</h4>
            <p className="text-3xl font-semibold text-ink-900 mt-1">
              {isLoading ? "..." : allPlaces.length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h4 className="text-sm font-medium text-ink-500">Unique Cities</h4>
            <p className="text-3xl font-semibold text-ink-900 mt-1">
              {isLoading ? "..." : cities.length > 0 ? cities.length - 1 : 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h4 className="text-sm font-medium text-ink-500">Categories</h4>
            <p className="text-3xl font-semibold text-ink-900 mt-1">
              {isLoading
                ? "..."
                : categories.length > 0
                  ? categories.length - 1
                  : 0}
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchInput
          placeholder="Search for name, city, or category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <FilterDropdown
          options={cities}
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setCurrentPage(1);
          }}
        />
        <FilterDropdown
          options={categories}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="text-center p-10">Loading places...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {paginatedPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              variant="default"
              name={place.name}
              location={place.location}
              description={place.description}
              image={place.image}
              onClick={() => handleCardClick(place)}
              onEdit={() => setPlaceToEdit(place)}
              onDelete={() => setPlaceToDelete(place)}
            />
          ))}
          <AddPlaceCard
            key="add-place-card"
            title="Add a New Place to the Platform"
            description="Expand our database and provide travelers with more amazing destinations in Egypt."
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 mb-6">
          <nav aria-label="Pagination">
            <ul className="flex items-center -space-x-px h-10 text-base">
              <li>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="w-3 h-3 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 1 1 5l4 4"
                    />
                  </svg>
                </button>
              </li>
              {paginationItems.map((item, index) => (
                <li key={index}>
                  {typeof item === "number" ? (
                    <button
                      onClick={() => setCurrentPage(item)}
                      className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 ${
                        currentPage === item
                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-white"
                          : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                      ...
                    </span>
                  )}
                </li>
              ))}
              <li>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="w-3 h-3 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink-900">Latest Updates</h3>
          <button className="text-sm font-semibold text-[#fe6800]">
            View All
          </button>
        </div>
        <DataTable columns={columns} rows={latestUpdates} />
      </Card>
      <PlaceDetailModal
        isOpen={!!selectedPlace}
        onClose={handleCloseModal}
        place={selectedPlace}
      />
      <AddPlaceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPlace}
      />
      <EditPlaceModal
        isOpen={!!placeToEdit}
        onClose={() => setPlaceToEdit(null)}
        onUpdate={handleUpdatePlace}
        place={placeToEdit}
      />
      <DeleteConfirmationModal
        isOpen={!!placeToDelete}
        onClose={() => setPlaceToDelete(null)}
        onConfirm={() => handleDeletePlace(placeToDelete.id)}
        itemName={placeToDelete?.name}
      />
    </DashboardLayout>
  );
}
