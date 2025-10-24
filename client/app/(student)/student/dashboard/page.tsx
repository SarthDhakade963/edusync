"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";

interface Group {
  id: string;
  name: string;
  description?: string;
  membersCount: number;
  isMember: boolean;
}

interface User {
  name: string;
  email: string;
}

interface Invitation {
  group: Group;
  invitor: User;
  id: string;
  groupName: string;
  inviterName: string;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInvites, setShowInvites] = useState(false);

  // Invite dialog state
  const [activeInviteGroup, setActiveInviteGroup] = useState<string | null>(
    null
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  // Refs for outside click detection
  const bellRef = useRef<HTMLDivElement>(null);
  const inviteDialogRef = useRef<HTMLDivElement>(null);

  // Fetch groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetchWithToken("/group/members", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending invitations
  const fetchInvitations = async () => {
    try {
      const res = await fetchWithToken("/invitation", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      console.log("Invitation list", data);

      setInvitations(data.invitations || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchInvitations();

    const handleClickOutside = (e: MouseEvent) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target as Node) &&
        inviteDialogRef.current &&
        !inviteDialogRef.current.contains(e.target as Node)
      ) {
        setActiveInviteGroup(null);
        setInviteEmail("");
        setInviteError("");
        setShowInvites(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create group
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Group name cannot be empty");
      return;
    }

    try {
      const res = await fetchWithToken("/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create group");

      alert("Group created successfully!");
      setShowModal(false);
      setNewGroupName("");
      setNewGroupDesc("");
      fetchGroups();
    } catch (err) {
      console.error(err);
      alert("Error creating group");
    }
  };

  // Send invite
  const handleSendInvite = async (groupId: string) => {
    if (!inviteEmail.trim()) return;
    setInviteError("");

    try {
      const res = await fetchWithToken("/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, toUserEmail: inviteEmail }),
        credentials: "include",
      });

      if (res.status === 404) {
        setInviteError("Email not found");
        return;
      }

      if (!res.ok) throw new Error("Invite failed");

      alert("Invite sent successfully!");
      setActiveInviteGroup(null);
      setInviteEmail("");
      setInviteError("");
    } catch (err) {
      console.error(err);
      setInviteError("Error sending invite");
    }
  };

  // Respond to invitation
  const respondToInvite = async (
    inviteId: string,
    action: "ACCEPTED" | "DECLINED"
  ) => {
    try {
      const res = await fetchWithToken(`/invitation/${inviteId}/respond`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept: action === "ACCEPTED" }), // <-- matches backend
      });

      if (!res.ok) throw new Error(`${action} failed`);

      setInvitations((prev) => prev.filter((inv) => inv.id !== inviteId));

      alert(`Invitation ${action.toLowerCase()}ed successfully!`);
    } catch (err) {
      console.error(err);
      alert(`Error: Unable to ${action} invitation`);
    }
  };

  if (loading) return <div>Loading groups...</div>;

  return (
    <div className="p-6 relative">
      {/* Header and bell */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Groups</h1>

        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowInvites((prev) => !prev)}
            className="relative p-2 rounded-full hover:bg-gray-200 transition"
          >
            <FiBell size={24} />
            {invitations.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {invitations.length}
              </span>
            )}
          </button>

          {showInvites && (
            <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow-lg z-50">
              {invitations.length === 0 ? (
                <p className="p-4 text-gray-600">No pending invitations</p>
              ) : (
                invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-col border-b last:border-b-0 p-3"
                  >
                    <p className="text-sm font-semibold">
                      Group: {invite.group.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Invited by {invite.invitor.name}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        onClick={() => respondToInvite(invite.id, "ACCEPTED")}
                      >
                        Accept
                      </button>
                      <button
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        onClick={() => respondToInvite(invite.id, "DECLINED")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Group list */}
      {groups.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-gray-600 mb-4">
            You are not a member of any group yet.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            + Create Group
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              + Add Group
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`./group/${group.id}`)}
                className="p-4 border rounded-lg shadow hover:shadow-lg transition cursor-pointer relative"
              >
                <h2 className="text-lg font-semibold">{group.name}</h2>
                {group.description && (
                  <p className="text-sm text-gray-500">{group.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  Members: {group.membersCount}
                </p>

                {/* Invite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInviteGroup(
                      activeInviteGroup === group.id ? null : group.id
                    );
                    setInviteEmail("");
                    setInviteError("");
                  }}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Invite
                </button>

                {/* Invite dialog */}
                {activeInviteGroup === group.id && (
                  <div
                    ref={inviteDialogRef}
                    onClick={(e) => e.stopPropagation()} // Stop card click
                    className="absolute top-full left-0 mt-2 w-64 bg-white border rounded shadow p-3 z-50"
                  >
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {inviteError && (
                      <p className="text-red-600 text-xs mt-1">{inviteError}</p>
                    )}
                    <button
                      onClick={() => handleSendInvite(group.id)}
                      className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition w-full text-sm"
                    >
                      Send Invite
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full px-4 py-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="Group description"
              className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGroup}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
