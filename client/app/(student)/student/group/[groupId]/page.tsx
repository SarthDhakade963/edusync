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
  isSubmitted: boolean;
}

export default function GroupPage() {
  const params = useParams();
  const groupId = params.groupId;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState("");

  // Fetch group assignments
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
    setConfirmStep(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setConfirmStep(false);
    setDriveLink("");
  };

  const submitAssignment = async () => {
    if (!driveLink || !selectedAssignmentId) return;

    try {
      setSubmitting(true);
      const res = await fetchWithToken(`/submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          assignmentId: selectedAssignmentId,
          submissionLink: driveLink,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit");

      alert("Assignment submitted successfully!");

      // Update assignment locally to show tick
      setAssignments(prev =>
        prev.map(a =>
          a.id === selectedAssignmentId ? { ...a, isSubmitted: true } : a
        )
      );

      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to submit assignment.");
    } finally {
      setSubmitting(false);
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
          {assignments.map(assignment => (
            <div
              key={assignment.id}
              className="p-4 border rounded-lg shadow hover:shadow-lg transition relative"
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

              {assignment.isSubmitted ? (
                <span className="absolute top-2 right-2 text-green-600 text-xl font-bold">✔️</span>
              ) : (
                <button
                  onClick={() => openModal(assignment.id)}
                  className="mt-2 ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Submit Assignment
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Submit Assignment</h2>

            {/* Step 1: Enter Drive Link */}
            {!confirmStep ? (
              <>
                <input
                  type="text"
                  placeholder="Paste OneDrive link here"
                  className="w-full p-2 border rounded mb-4"
                  value={driveLink}
                  onChange={e => setDriveLink(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeModal}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!driveLink.trim()) {
                        alert("Please paste your OneDrive link before proceeding.");
                        return;
                      }
                      setConfirmStep(true);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              /* Step 2: Confirmation */
              <>
                <p className="mb-4 text-gray-700">
                  Are you sure you have submitted your assignment correctly?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmStep(false)}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={submitAssignment}
                    disabled={submitting}
                    className={`px-3 py-1 rounded ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}
                  >
                    Yes, I have submitted
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
