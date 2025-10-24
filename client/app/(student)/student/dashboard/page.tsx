"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchWithToken } from "@/lib/fetchWithToken";

interface Group {
  id: string;
  name: string;
  description?: string;
  membersCount: number;
  isMember: boolean;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetchWithToken("/group/members", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      console.log("FETCHED GROUP : ", data);
      setGroups(data.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleInvite = async (groupId: string) => {
    const email = prompt("Enter email to invite:");
    if (!email) return;

    try {
      const res = await fetchWithToken("/invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, email }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Invite failed");

      alert("Invite sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Error sending invite");
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Group name cannot be empty");
      return;
    }

    try {
      const res = await fetchWithToken("/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create group");

      alert("Group created successfully!");
      setShowModal(false);
      setNewGroupName("");
      setNewGroupDesc("");
      fetchGroups(); // Refresh the group list
    } catch (err) {
      console.error(err);
      alert("Error creating group");
    }
  };

  if (loading) return <div>Loading groups...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Groups</h1>

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
                className="p-4 border rounded-lg shadow hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold">{group.name}</h2>
                {group.description && (
                  <p className="text-sm text-gray-500">{group.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  Members: {group.membersCount}
                </p>
                <button
                  onClick={() => handleInvite(group.id)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Invite
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
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
