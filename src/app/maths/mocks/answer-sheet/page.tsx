import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/get-user";
import PrintButton from "./print-button";

export default async function AnswerSheetPage() {
  const session = await getUser();
  if (!session) redirect("/login");

  return (
    <main className="space-y-6 print:space-y-0">
      <div className="print:hidden">
        <Link className="apple-subtle inline-flex" href="/maths/mocks">
          ← Back to mocks
        </Link>
      </div>

      <section className="apple-card p-8 print:p-0 print:shadow-none print:border-none">
        <div className="flex items-start justify-between gap-4 print:mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Answer sheet
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mt-2">
              Functional Skills Maths
            </h1>
            <p className="apple-subtle mt-2">
              Use this sheet to record answers during mock exams.
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b py-2">
              <div className="w-10 text-sm text-slate-500">Q{i + 1}</div>
              <div className="flex-1 border-b border-dashed border-slate-300 py-2" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <div className="text-sm font-semibold">Candidate details</div>
            <div className="mt-3 space-y-3 text-sm">
              <div className="border-b border-dashed py-2">Name</div>
              <div className="border-b border-dashed py-2">Date</div>
              <div className="border-b border-dashed py-2">Exam title</div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-sm font-semibold">Working notes</div>
            <div className="mt-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b border-dashed py-2" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
