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
import AddUserModal from "../../components/modals/AddUserModal.jsx";
import EditUserModal from "../../components/modals/EditUserModal.jsx";
import DeleteConfirmationModal from "../../components/modals/DeleteConfirmationModal.jsx";
import UserDetailPanel from "../../components/common/UserDetailPanel.jsx";
import Pagination from "../../components/common/Pagination.jsx";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const prepareProfileData = (profile) => {
    if (!profile) {
      return null;
    }
    // The backend might return 'owner' as a string ID or a populated object.
    const isOwnerPopulated = profile.owner && typeof profile.owner === "object";

    // The user's ID, which is the `owner` of the profile.
    const userId = isOwnerPopulated ? profile.owner._id : profile.owner;

    // The `ownerName` and `avatarUrl` on the Profile might be stale or empty.
    // If the owner is populated, prefer the data from the owner object.
    // This assumes the populated User object has `userName` and `avatarUrl` fields.
    const ownerName = isOwnerPopulated
      ? profile.ownerName
      : profile.ownerName;
    const avatarUrl = isOwnerPopulated
      ? profile.avatarUrl
      : profile.avatarUrl;

    return {
      ...profile,
      id: profile._id, // Add id for unique key prop in DataTable
      userId,
      ownerName,
      avatarUrl,
    };
  };
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/profiles");
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

  const handleAddUser = async (newUserData) => {
    // The backend expects data to create a User and then a Profile.
    // The `owner` field on the Profile is required and will be populated from the new User.
    // We need to send all necessary fields for User creation.
    const payload = {
      userName: newUserData.ownerName, // For User model
      email: newUserData.email,
      password: newUserData.password,
      ownerName: newUserData.ownerName,
      location: newUserData.location,
    };

    try {
      const response = await fetch("http://localhost:5000/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to add user");
      const newUserProfile = await response.json();
      // The backend should return the newly created profile, populated with owner info.
      setUsers([prepareProfileData(newUserProfile), ...users]);
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    // Only send fields that are part of the Profile schema and are likely editable in the modal.
    // Also include ownerName, which might be userName on the User model.
    const {
      ownerName,
      headline,
      bio,
      location,
      website,
      avatarUrl,
      status,
      isVerified,
    } = updatedUser;
    const payload = {
      headline,
      bio,
      location,
      website,
      avatarUrl, // For TouristProfile and/or User model
      ownerName, // For TouristProfile model
      userName: ownerName, // For User model
    };

    // Add status fields only if they are provided, to support both editing and status updates.
    if (status !== undefined) payload.status = status;
    if (isVerified !== undefined) payload.isVerified = isVerified;
    try {
      const response = await fetch(`http://localhost:5000/api/profiles/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update user");
      const updatedProfileData = await response.json();
      setUsers(
        users.map((u) => {
          if (u.id === updatedUser.id) {
            // The server returns an updated profile, but it may be unpopulated.
            // We keep our populated `owner` object from the old state (`u`)
            // but ensure any changed data (like name or avatar) from the
            // server response is reflected in it for UI consistency.
            const newOwner = {
              ...u.owner,
              userName: updatedProfileData.ownerName,
              avatarUrl: updatedProfileData.avatarUrl,
            };
            const newProfile = { ...updatedProfileData, owner: newOwner };
            return prepareProfileData(newProfile);
          }
          return u;
        }),
      );
      setUserToEdit(null);
      // Also update the viewing user if they are the one being edited/updated.
      setViewingUser((prev) => {
        if (prev && prev.id === updatedUser.id) {
          const newOwner = {
            ...prev.owner,
            userName: updatedProfileData.ownerName,
            avatarUrl: updatedProfileData.avatarUrl,
          };
          const newProfile = { ...updatedProfileData, owner: newOwner };
          return prepareProfileData(newProfile);
        }
        return prev;
      });
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteUser = async (profileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/profiles/${profileId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      setUsers(users.filter((u) => u.id !== profileId));
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleUpdateUserStatus = async (profileId, status) => {
    // This pattern follows the working implementation in Guides.jsx.
    // It finds the user, creates an updated object, and calls the main update handler.
    const userToUpdate = users.find((u) => u.id === profileId);
    if (!userToUpdate) return;

    const updatedUser = {
      ...userToUpdate,
      status: status,
      isVerified: status === "active", // 'active' means verified, 'suspicious' means not.
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
            className="text-ink-400 hover:text-[#fe6800]"
            onClick={() => setUserToEdit(row)}
          >
            <Edit size={16} />
          </button>
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
        action={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add New User
          </Button>
        }
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

      <AddUserModal // These modals are fine as overlays
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />
      <EditUserModal
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        onUpdate={handleUpdateUser}
        user={userToEdit}
      />
      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => handleDeleteUser(userToDelete.id)}
        itemName={userToDelete?.ownerName}
      />
    </DashboardLayout>
  );
}
