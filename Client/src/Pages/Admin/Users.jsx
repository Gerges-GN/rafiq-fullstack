import React, { useState, useEffect } from "react";
import { Eye, Trash2 } from "lucide-react";
import DashboardLayout from "../../Components/Layout/DashboardLayout.jsx";
import PageHeader from "../../Components/common/PageHeader.jsx";
import SearchInput from "../../Components/common/SearchInput.jsx";
import DataTable from "../../Components/common/DataTable.jsx";
import Badge from "../../Components/common/Badge.jsx";
import Avatar from "../../Components/common/Avatar.jsx";
import { currentAdmin } from "../../data/mockData.js";
import DeleteConfirmationModal from "../../Components/modals/DeleteConfirmationModal.jsx";
import UserDetailPanel from "../../Components/common/UserDetailPanel.jsx";
import Pagination from "../../Components/common/Pagination.jsx";
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
/**
 * @typedef {object} User
 * @property {string} userId - The unique identifier for the user.
 * @property {string} ownerName - The name of the user.
 * @property {string} [avatarUrl] - The URL for the user's avatar.
 * @property {string} location - The user's location.
 * @property {string} createdAt - The date the user joined.
 * @property {'active' | 'suspicious'} status - The status of the user account.
 */

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const prepareProfileData = (profile) => {
    if (!profile) {
      return null;
    }
    const isOwnerPopulated = profile.owner && typeof profile.owner === "object";

    const userId = isOwnerPopulated ? profile.owner._id : profile.owner;

    const ownerName =
      isOwnerPopulated && profile.owner.userName
        ? profile.owner.userName
        : profile.ownerName;
    const avatarUrl =
      isOwnerPopulated && profile.owner.avatarUrl
        ? profile.owner.avatarUrl
        : profile.avatarUrl;

    return {
      ...profile,
      id: profile._id,
      userId,
      ownerName,
      avatarUrl,
    };
  };
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profiles`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUsers(data.map(prepareProfileData));
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleUpdateUser = async (updatedUser) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/profiles/${updatedUser.userId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: updatedUser.status, // "ACTIVE" or "SUSPENDED"
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    const result = await response.json();

    setUsers((prev) =>
      prev.map((user) =>
        user.userId === updatedUser.userId
          ? { ...user, status: result.profile.status }
          : user
      )
    );

    setViewingUser((prev) =>
      prev && prev.userId === updatedUser.userId
        ? { ...prev, status: result.profile.status }
        : prev
    );

  } catch (error) {
    console.error("Failed to update status:", error);
  }
};

  const handleDeleteUser = async (profileId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/profiles/${profileId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete user");
      setUsers(users.filter((u) => u.id !== profileId));
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleUpdateUserStatus = async (profileId, status) => {
    const userToUpdate = users.find((u) => u.id === profileId);
    if (!userToUpdate) return;

    const updatedUser = {
      ...userToUpdate,
      status: status,
      isVerified: status === "active",
    };

    await handleUpdateUser(updatedUser);
  };
  const filteredUsers = users.filter(
    (user) =>
      (user.ownerName || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.location || "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
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
      key: "ownerName",
      header: "User Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatarUrl} alt={row.ownerName} size="sm" />
          <span className="font-semibold text-ink-900">{row.ownerName}</span>
        </div>
      ),
    },
    { key: "location", header: "Location" },
    {
      key: "createdAt",
      header: "Joined",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            className="text-ink-400 hover:text-red-500"
            onClick={() => setUserToDelete(row)}
          >
            <Trash2 size={16} />
          </button>
          <button
            className="text-ink-400 hover:text-[#fe6800]"
            onClick={() => setViewingUser(row)}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      sidebarProps={{ active: "/users", footer: "status", showLogo: false }}
      topbarProps={{
        title: "Dashboard - Users Mgmt",
        user: currentAdmin.users,
        showLogout: true,
        logoutVariant: "text",
      }}
    >
      <PageHeader
        title="Users Management"
        description="View and manage user accounts on the platform."
      />

      <div className="mb-6">
        <SearchInput
          placeholder="Search for user name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div
          className={`transition-all duration-300 ${viewingUser ? "lg:col-span-2" : "lg:col-span-3"}`}
        >
          <DataTable columns={columns} rows={paginatedUsers} />
          {totalPages > 1 && (
            <Pagination
              className="mt-4 justify-center"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
        {viewingUser && (
          <div className="lg:col-span-1 sticky top-6">
            <UserDetailPanel
              user={viewingUser}
              onClose={() => setViewingUser(null)}
              onAccept={() => handleUpdateUserStatus(viewingUser.id, "active")}
              onSuspend={() =>
                handleUpdateUserStatus(viewingUser.id, "suspicious")
              }
              onDelete={() => {
                setUserToDelete(viewingUser);
                setViewingUser(null);
              }}
            />
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => handleDeleteUser(userToDelete.id)}
        itemName={userToDelete?.ownerName}
      />
    </DashboardLayout>
  );
}
