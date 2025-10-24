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

  const [showModal, setShowModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [driveLink, setDriveLink] = useState("");

  const fetchGroupAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetchWithToken(`/assignment/${groupId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      setAssignments(data.assignments || []);
      setGroupName(data.assignments[0]?.group?.name || "");
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

  const openModal = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setDriveLink("");
    setShowModal(true);
  };

  const submitAssignment = async () => {
    if (!driveLink || !selectedAssignmentId) return;

    try {
      const res = await fetchWithToken(`/submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: groupId,
          assignmentId: selectedAssignmentId,
          submissionLink: driveLink,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit");

      alert("Assignment submitted successfully!");
      setShowModal(false);
      fetchGroupAssignments(); 
    } catch (err: unknown) {
      console.error(err);
    }
  };

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
                <p className="text-sm text-gray-500">
                  {assignment.description}
                </p>
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

              <button
                onClick={() => openModal(assignment.id)}
                className="mt-2 ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Submit Assignment
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Submit Assignment</h2>
            <input
              type="text"
              placeholder="Paste OneDrive link here"
              className="w-full p-2 border rounded mb-4"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitAssignment}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
