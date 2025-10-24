"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWithToken } from "@/lib/fetchWithToken";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  onedrive_link: string;
}

export default function GroupPage() {
  const params = useParams();
  const groupId = params.groupId;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchGroupAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetchWithToken(`/group/${groupId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      console.log("Group Data:", data);

      setGroupName(data.group.name);
      setAssignments(data.group.assignments || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch group details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchGroupAssignments();
  }, [groupId]);

  if (loading) return <div>Loading group details...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{groupName}</h1>

      {assignments.length === 0 ? (
        <p>No assignments assigned to this group yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-4 border rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{assignment.title}</h2>
              {assignment.description && (
                <p className="text-sm text-gray-500">{assignment.description}</p>
              )}
              <p className="text-sm text-gray-500">
                Due: {new Date(assignment.due_date).toLocaleDateString()}
              </p>
              <a
                href={assignment.onedrive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Open OneDrive Link
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
