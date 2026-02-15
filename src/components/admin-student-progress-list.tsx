"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type StudentRow = {
  id: string;
  full_name: string | null;
};

export default function AdminStudentProgressList({
  students,
}: {
  students: StudentRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) =>
      (student.full_name ?? "Unnamed student").toLowerCase().includes(q)
    );
  }, [query, students]);

  return (
    <div className="space-y-6">
      <section className="apple-card p-6 space-y-4">
        <label className="text-sm font-medium" htmlFor="student-search">
          Search students
        </label>
        <input
          id="student-search"
          name="student-search"
          className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm"
          placeholder="Search by student name..."
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="text-xs text-[color:var(--muted-foreground)]">
          Showing {filtered.length} of {students.length} students.
        </div>
      </section>

      <div className="grid gap-4">
        {filtered.map((student) => (
          <Link
            key={student.id}
            href={`/admin/users/${student.id}/progress`}
            className="apple-card p-5 flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <div className="text-sm uppercase tracking-[0.22em] text-slate-400">
                Student
              </div>
              <div className="text-lg font-semibold mt-2">
                {student.full_name || "Unnamed student"}
              </div>
            </div>
            <span className="apple-pill">View progress</span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="apple-card p-6 text-sm text-[color:var(--muted-foreground)]">
            No students match that search.
          </div>
        )}
      </div>
    </div>
  );
}
