"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const groupId = params.groupId;

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

      const assignmentsData = data.assignments || [];
      setAssignments(assignmentsData);
      setGroupName(data.assignments[0]?.group?.name || "");

      await fetchAllSubmissionStatuses(assignmentsData);
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

      setAssignments((prev) =>
        prev.map((a) =>
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

  const fetchAllSubmissionStatuses = async (assignmentsList: Assignment[]) => {
    try {
      const updatedAssignments = await Promise.all(
        assignmentsList.map(async (assignment) => {
          try {
            const res = await fetchWithToken(`/submission/${assignment.id}`, {
              method: "GET",
              credentials: "include",
            });
            const data = await res.json();

            if (res.ok && data.submissionStatus === "CONFIRMED") {
              return { ...assignment, isSubmitted: true };
            }
            return { ...assignment, isSubmitted: false };
          } catch {
            return { ...assignment, isSubmitted: false };
          }
        })
      );
      setAssignments(updatedAssignments);
    } catch (err) {
      console.error("Failed to fetch submission statuses:", err);
    }
  };
  
  const submittedCount = assignments.filter((a) => a.isSubmitted).length;
  const pendingCount = assignments.length - submittedCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-xl transition-colors duration-200 group"
          >
            <svg
              className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900">{groupName}</h1>
            <p className="text-slate-600 mt-1">
              {assignments.length} assignment
              {assignments.length !== 1 ? "s" : ""} • {submittedCount} submitted
            </p>
          </div>
        </div>

        {assignments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {assignments.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Submitted
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {submittedCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {pendingCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-linear-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Assignments Yet
            </h3>
            <p className="text-slate-600 mb-6">
              This group doesn&apos;t have any assignments yet.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 relative"
              >
                {assignment.isSubmitted && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submitted
                  </div>
                )}

                <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                  {assignment.title}
                </h2>
                {assignment.description && (
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-slate-600 mb-4 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">
                    Due:{" "}
                    {new Date(assignment.due_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="space-y-2">
                  <a
                    href={assignment.onedrive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Open Assignment
                  </a>

                  {!assignment.isSubmitted && (
                    <button
                      onClick={() => openModal(assignment.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Submit Assignment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-5 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                {!confirmStep ? "Submit Assignment" : "Confirm Submission"}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {!confirmStep
                  ? "Paste your OneDrive link below"
                  : "Please verify your submission"}
              </p>
            </div>

            <div className="p-6">
              {!confirmStep ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      OneDrive Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://onedrive.live.com/..."
                      className="placeholder-gray-400 w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-blue-800">
                        Make sure your OneDrive link is publicly accessible or
                        shared with your instructor.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-amber-900 mb-1">
                          Please confirm before submitting
                        </p>
                        <p className="text-sm text-amber-800">
                          Have you verified that your assignment file is
                          correctly uploaded and accessible?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-600 break-all">
                      <span className="font-semibold text-slate-900">
                        Link:
                      </span>{" "}
                      {driveLink}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={
                  !confirmStep ? closeModal : () => setConfirmStep(false)
                }
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200"
                disabled={submitting}
              >
                {!confirmStep ? "Cancel" : "Go Back"}
              </button>
              <button
                onClick={
                  !confirmStep
                    ? () => {
                        if (!driveLink.trim()) {
                          alert(
                            "Please paste your OneDrive link before proceeding."
                          );
                          return;
                        }
                        setConfirmStep(true);
                      }
                    : submitAssignment
                }
                disabled={submitting}
                className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                  submitting
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-linear-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : !confirmStep ? (
                  "Next"
                ) : (
                  "Yes, Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
