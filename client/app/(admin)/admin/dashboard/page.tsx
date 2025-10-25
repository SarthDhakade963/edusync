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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-slate-600 font-medium">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage your groups and assignments</p>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Groups Yet</h3>
            <p className="text-slate-600">Create your first group to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => router.push(`./group/${group.id}`)}
              >
                <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {group.name}
                </h2>
                <div className="flex items-center text-slate-600 mb-4">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm font-medium">{group.membersCount} members</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openAssignModal(group.id);
                  }}
                  className="w-full px-4 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Assign Assignment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Assign New Assignment</h2>
              <p className="text-blue-100 text-sm mt-1">Fill in the assignment details below</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter assignment title"
                  value={assignmentData.title}
                  onChange={(e) =>
                    setAssignmentData({ ...assignmentData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter assignment description"
                  value={assignmentData.description}
                  onChange={(e) =>
                    setAssignmentData({ ...assignmentData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={assignmentData.due_date}
                  onChange={(e) =>
                    setAssignmentData({ ...assignmentData, due_date: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  OneDrive Link
                </label>
                <input
                  type="text"
                  placeholder="https://onedrive.live.com/..."
                  value={assignmentData.onedrive_link}
                  onChange={(e) =>
                    setAssignmentData({ ...assignmentData, onedrive_link: e.target.value })
                  }
                  className="placeholder-gray-400 w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
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