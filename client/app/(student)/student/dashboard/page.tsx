"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { useRouter } from "next/navigation";
import { FiBell } from "react-icons/fi";

interface Group {
  ownerId: string | undefined;
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isOwner: boolean;
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

  const [activeInviteGroup, setActiveInviteGroup] = useState<string | null>(
    null
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  const bellRef = useRef<HTMLDivElement>(null);
  const inviteDialogRef = useRef<HTMLDivElement>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetchWithToken("/group/members", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      const userId = session?.user?.id;

      const groupsWithOwnership = (data.groups || []).map((group: Group) => ({
        ...group,
        isOwner: group.ownerId === userId,
      }));

      setGroups(groupsWithOwnership);

      setGroups(data.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
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

      setShowModal(false);
      setNewGroupName("");
      setNewGroupDesc("");
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

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

      const data = await res.json();

      console.log("Send Invite", data.message);

      if (res.status === 404) {
        setInviteError("Email not found");
        return;
      }

      if (res.status === 403) {
        setInviteError(
          data.message || "Only the group owner can send invitations"
        );
        return;
      }

      if (!res.ok) {
        setInviteError(data.message || "Invite failed");
        return;
      }

      setActiveInviteGroup(null);
      setInviteEmail("");
      setInviteError("");
    } catch (err) {
      console.error(err);
      setInviteError("Error sending invite");
    }
  };

  const respondToInvite = async (
    inviteId: string,
    action: "ACCEPTED" | "DECLINED"
  ) => {
    try {
      const res = await fetchWithToken(`/invitation/${inviteId}/respond`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept: action === "ACCEPTED" }),
      });

      if (!res.ok) throw new Error(`${action} failed`);

      setInvitations((prev) => prev.filter((inv) => inv.id !== inviteId));

      fetchGroups();
    } catch (err) {
      console.error(err);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">My Groups</h1>
            <p className="text-slate-600 mt-1">
              {groups.length} group{groups.length !== 1 ? "s" : ""} joined
            </p>
          </div>

          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowInvites((prev) => !prev)}
              className="relative p-3 rounded-xl hover:bg-white transition-all duration-200 group"
            >
              <FiBell
                size={24}
                className="text-slate-600 group-hover:text-blue-600 transition-colors"
              />
              {invitations.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-linear-to-r from-red-500 to-red-600 rounded-full animate-pulse">
                  {invitations.length}
                </span>
              )}
            </button>

            {showInvites && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-linear-to-r from-blue-600 to-blue-700 px-5 py-4">
                  <h3 className="text-white font-bold text-lg">Invitations</h3>
                  <p className="text-blue-100 text-sm">
                    {invitations.length} pending invitation
                    {invitations.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {invitations.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-8 h-8 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-600 font-medium">
                        All caught up!
                      </p>
                      <p className="text-slate-500 text-sm">
                        No pending invitations
                      </p>
                    </div>
                  ) : (
                    invitations.map((invite) => (
                      <div
                        key={invite.id}
                        className="border-b border-slate-100 last:border-b-0 p-5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">
                              {invite.group.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              Invited by{" "}
                              <span className="font-medium">
                                {invite.invitor.name}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-4 py-2 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                            onClick={() =>
                              respondToInvite(invite.id, "ACCEPTED")
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium text-sm"
                            onClick={() =>
                              respondToInvite(invite.id, "DECLINED")
                            }
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-linear-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Groups Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first group to get started or wait for an invitation
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Group
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Group
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => router.push(`./group/${group.id}`)}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative"
                >
                  <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {group.name}
                  </h2>
                  {group.description && (
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center text-slate-600 mb-4">
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      {group.memberCount} members
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!group.isOwner) return;
                      setActiveInviteGroup(
                        activeInviteGroup === group.id ? null : group.id
                      );
                      setInviteEmail("");
                      setInviteError("");
                    }}
                    className={`w-full px-4 py-2.5 text-white font-medium rounded-xl flex items-center justify-center gap-2
                        ${
                          group.isOwner
                            ? "bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-sm hover:shadow-md cursor-pointer"
                            : "bg-gray-300 cursor-not-allowed"
                        }`}
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Invite Member
                  </button>

                  {activeInviteGroup === group.id && (
                    <div
                      ref={inviteDialogRef}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Invite to {group.name}
                      </h4>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-sm"
                      />
                      {inviteError && (
                        <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
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
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {inviteError}
                        </p>
                      )}
                      <button
                        onClick={() => handleSendInvite(group.id)}
                        className="mt-3 w-full px-4 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Send Invitation
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-5 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                Create New Group
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Start collaborating with your team
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Enter group description (optional)"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all resize-none"
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
                onClick={handleAddGroup}
                className="flex-1 px-6 py-3 bg-linear-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
