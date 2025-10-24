"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  membersCount: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    due_date: "",
    onedrive_link: "",
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetchWithToken("/group/all", {
          credentials: "include",
        });
        const data = await res.json();
        setGroups(data.groups);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const openAssignModal = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedGroupId) return;

    try {
      const res = await fetchWithToken(`/assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...assignmentData, groupId: selectedGroupId }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Assignment creation failed");

      alert("Assignment assigned successfully!");
      setShowModal(false);
      setAssignmentData({ title: "", description: "", due_date: "", onedrive_link: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to assign assignment");
    }
  };

  if (loading) return <div>Loading groups...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {groups.length === 0 ? (
        <p>No groups available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-4 border rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => router.push(`./group/${group.id}`)} // click card => open group page
            >
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <p className="text-sm text-gray-500">
                Members: {group.membersCount}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent card click
                  openAssignModal(group.id);
                }}
                className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Assign Assignment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Assign Assignment</h2>
            <input
              type="text"
              placeholder="Title"
              value={assignmentData.title}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, title: e.target.value })
              }
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={assignmentData.description}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, description: e.target.value })
              }
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="date"
              placeholder="Due Date"
              value={assignmentData.due_date}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, due_date: e.target.value })
              }
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="OneDrive Link"
              value={assignmentData.onedrive_link}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, onedrive_link: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
