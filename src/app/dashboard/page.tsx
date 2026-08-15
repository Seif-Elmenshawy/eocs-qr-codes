import { connectDB } from "@/lib/mongo";
import Participant from "@/models/participant";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "got_on_the_bus", label: "Boarded bus", short: "Bus" },
  { key: "entered_uni", label: "Entered uni", short: "Arrived" },
  { key: "ate", label: "Had a meal", short: "Ate" },
  { key: "left_uni", label: "Left uni", short: "Left" },
] as const;

interface ParticipantRow {
  _id: string;
  name: string;
  id_card: string;
  email?: string;
  got_on_the_bus: boolean;
  entered_uni: boolean;
  ate: boolean;
  left_uni: boolean;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <path d="M2.5 8.5 6 12l7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  total,
  accent,
}: {
  label: string;
  value: number;
  total?: number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-2xl border border-eocs-gold/30 bg-eocs-gold/10 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
          : "rounded-2xl border border-eocs-gold/15 bg-eocs-dark/35 p-4 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
      }
    >
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-eocs-gold">
        {label}
      </p>
      <p className="mt-1.5 font-display text-3xl font-bold text-eocs-light">
        {value}
        {typeof total === "number" && (
          <span className="text-base font-medium text-eocs-light/40"> / {total}</span>
        )}
      </p>
    </div>
  );
}

function MissingList({ missing }: { missing: ParticipantRow[] }) {
  if (missing.length === 0) {
    return (
      <p className="text-sm text-eocs-light/60">
        Everyone has arrived. No missing participants.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-eocs-gold/10">
      {missing.map((p) => {
        const missingSteps = STEPS.filter((s) => !p[s.key]).map((s) => s.label);
        return (
          <li key={String(p._id)} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-eocs-light">{p.name}</p>
              <p className="text-xs text-eocs-light/50">
                {p.id_card}
                {p.email ? ` · ${p.email}` : ""}
              </p>
            </div>
            <p className="text-xs text-red-300/80">
              Missing: {missingSteps.join(", ")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default async function DashboardPage() {
  await connectDB();

  const participants = (await Participant.find().sort({ name: 1 }).lean()) as unknown as ParticipantRow[];

  const stats = {
    total: participants.length,
    got_on_the_bus: participants.filter((p) => p.got_on_the_bus).length,
    entered_uni: participants.filter((p) => p.entered_uni).length,
    ate: participants.filter((p) => p.ate).length,
    left_uni: participants.filter((p) => p.left_uni).length,
  };

  const missing = participants.filter((p) => !p.entered_uni);

  return (
    <main className="min-h-dvh px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-eocs-gold">
              EOCS · Dashboard
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wider text-eocs-light">
              Participant Overview
            </h1>
          </div>
          <Link
            href="/home"
            className="rounded-full border border-eocs-gold/25 bg-eocs-gold/5 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-eocs-gold transition hover:bg-eocs-gold/15"
          >
            Back to scanner
          </Link>
        </div>

        <div className="mx-auto mt-5 h-0.5 w-40 rounded bg-gradient-to-r from-transparent via-eocs-gold to-transparent" />

        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total" value={stats.total} />
          {STEPS.map((step) => (
            <StatCard
              key={step.key}
              label={step.label}
              value={stats[step.key]}
              total={stats.total}
            />
          ))}
          <StatCard label="Missing" value={missing.length} accent />
        </section>

        <details className="group mt-8 rounded-2xl border border-eocs-gold/15 bg-eocs-dark/35 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <div>
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-eocs-gold">
                Missing people
              </p>
              <p className="mt-1 font-display text-xl font-bold text-eocs-light">
                {missing.length} not arrived yet
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-eocs-gold/25 text-eocs-gold transition group-open:rotate-180">
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="m3 6 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </summary>
          <div className="mt-5 border-t border-eocs-gold/10 pt-4">
            <MissingList missing={missing} />
          </div>
        </details>

        <section className="mt-8 overflow-hidden rounded-2xl border border-eocs-gold/15 bg-eocs-dark/35 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-eocs-gold/15 text-[0.6rem] uppercase tracking-[0.25em] text-eocs-gold">
                  <th className="px-5 py-4 font-semibold">Name</th>
                  <th className="px-5 py-4 font-semibold">ID card</th>
                  <th className="px-5 py-4 text-center font-semibold">Boarded bus</th>
                  <th className="px-5 py-4 text-center font-semibold">Entered uni</th>
                  <th className="px-5 py-4 text-center font-semibold">Meal</th>
                  <th className="px-5 py-4 text-center font-semibold">Left uni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eocs-gold/10">
                {participants.map((p) => (
                  <tr key={String(p._id)} className="transition hover:bg-eocs-gold/5">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-eocs-light">{p.name}</p>
                      {p.email && <p className="text-xs text-eocs-light/45">{p.email}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-eocs-light/70">
                      {p.id_card}
                    </td>
                    {STEPS.map((step) => {
                      const done = p[step.key];
                      return (
                        <td key={step.key} className="px-5 py-3.5 text-center">
                          <span
                            className={
                              done
                                ? "inline-flex h-7 w-7 items-center justify-center rounded-full border border-eocs-gold bg-eocs-gold text-[#1a1412]"
                                : "inline-flex h-7 w-7 items-center justify-center rounded-full border border-eocs-gold/25 text-eocs-light/40"
                            }
                          >
                            {done ? <CheckIcon /> : <XIcon />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {participants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-eocs-light/50">
                      No participants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
