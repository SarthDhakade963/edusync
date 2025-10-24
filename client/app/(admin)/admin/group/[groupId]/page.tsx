"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { useRouter } from "next/navigation";

interface Assignment {
  id: string;
  title: string;
  description: string;
}

export default function GroupPage() {
  const params = useParams();
  const groupId = params.groupId;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const res = await fetchWithToken(`/assignment`, {
          credentials: "include",
        });
        const data = await res.json();

        // Assuming backend sends assignments array with totalSubmissions field
        setAssignments(data.assignments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [groupId]);

  if (loading) return <div>Loading assignments...</div>;

  if (assignments.length === 0)
    return <div>No assignments assigned to this group yet.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assignments for Group</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <div
            onClick={() => router.push(`./assignment/${assignment.id}`)}
            key={assignment.id}
            className="p-4 border rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold">{assignment.title}</h2>
            <p>{assignment.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
