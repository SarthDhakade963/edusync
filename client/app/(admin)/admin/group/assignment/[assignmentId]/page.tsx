"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWithToken } from "@/lib/fetchWithToken";

interface Student {
  id: string;
  name: string;
  email: string;
  submissionLink: string;
  submissionDate: string;
  submissionStatus: string;
}

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const { assignmentId } = params as {
    assignmentId: string;
  };

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetchWithToken(
          `/assignment/${assignmentId}/student`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        console.log("Submission of all students in the group", res);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to fetch submissions");
        }
        const data = await res.json();
        setStudents(data.students);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          console.error("Unexpected error", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

  if (loading)
    return <div className="p-6 text-gray-600">Loading submissions...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (students.length === 0)
    return (
      <div className="p-6 text-gray-600">No students found in this group.</div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assignment Submissions</h1>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 border">Student Name</th>
              <th className="px-4 py-3 border">Email</th>
              <th className="px-4 py-3 border">Status</th>
              <th className="px-4 py-3 border">Submitted Date</th>
              <th className="px-4 py-3 border">OneDrive Link</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="text-center border-t hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2 border font-medium text-gray-800">
                  {student.name}
                </td>
                <td className="px-4 py-2 border text-gray-600">
                  {student.email}
                </td>
                <td
                  className={`px-4 py-2 border font-semibold ${
                    student.submissionStatus === "CONFIRMED"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {student.submissionStatus}
                </td>
                <td className="px-4 py-2 border text-gray-600">
                  {student.submissionDate === "-"
                    ? "-"
                    : new Date(student.submissionDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">
                  {student.submissionLink !== "-" ? (
                    <a
                      href={student.submissionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
