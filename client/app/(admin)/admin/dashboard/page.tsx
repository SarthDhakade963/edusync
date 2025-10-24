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

  const handleAssign = (groupId: string) => {
    const assignmentTitle = prompt("Enter assignment title:");
    if (!assignmentTitle) return;

    // Call backend API to create assignment for this group
    fetchWithToken(`group/${groupId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: assignmentTitle }),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Assignment creation failed");
        alert("Assignment assigned successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to assign assignment");
      });
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
              onClick={() => router.push("./group/[groupId]")}
              key={group.id}
              className="p-4 border rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <p className="text-sm text-gray-500">
                Members: {group.membersCount}
              </p>
              <button
                onClick={() => handleAssign(group.id)}
                className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Assign Assignment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
