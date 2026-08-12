"use client";

import { useFormStatus } from "react-dom";
import { updateStatus } from "./actions";

type StepKey = "got_on_the_bus" | "entered_uni" | "ate" | "left_uni";

interface CheckInPanelProps {
  participant: {
    id: string;
    name: string;
    gotOnTheBus: boolean;
    enteredUni: boolean;
    ate: boolean;
    leftUni: boolean;
  };
}

type BoolProps = Pick<CheckInPanelProps["participant"], "gotOnTheBus" | "enteredUni" | "ate" | "leftUni">;

const STEPS: {
  key: StepKey;
  prop: keyof BoolProps;
  number: string;
  label: string;
  detail: string;
}[] = [
  {
    key: "got_on_the_bus",
    prop: "gotOnTheBus",
    number: "01",
    label: "Boarded the bus",
    detail: "Riding from pick-up point to the venue",
  },
  {
    key: "entered_uni",
    prop: "enteredUni",
    number: "02",
    label: "Entered university",
    detail: "Checked in at the campus gate",
  },
  {
    key: "ate",
    prop: "ate",
    number: "03",
    label: "Had a meal",
    detail: "Meal break during the event",
  },
  {
    key: "left_uni",
    prop: "leftUni",
    number: "04",
    label: "Left university",
    detail: "Departed after the competition",
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path d="M2.5 8.5 6 12l7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubmitButton({ done }: { done: boolean }) {
  const { pending } = useFormStatus();

  if (done) {
    return (
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-full border border-eocs-gold/30 bg-eocs-gold/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-eocs-gold transition hover:bg-eocs-gold/15 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Undo"}
      </button>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-full bg-eocs-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1a1412] shadow-[0_4px_16px_rgba(173,130,49,0.35)] transition hover:-translate-y-0.5 hover:bg-[#c49a3a] disabled:opacity-60"
    >
      {pending ? "Saving…" : "Mark done"}
    </button>
  );
}

export default function CheckInPanel({ participant }: CheckInPanelProps) {
  const steps = STEPS.map((step) => ({
    ...step,
    done: participant[step.prop],
  }));
  const doneCount = steps.filter((step) => step.done).length;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-eocs-gold/15 bg-eocs-dark/35 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-eocs-gold">
          EOCS · Participant Check-in
        </p>

        <header className="mt-4 text-center">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-eocs-light">
            {participant.name}
          </h1>
          <span className="mt-2 inline-block rounded-full border border-eocs-gold/25 bg-eocs-gold/10 px-3 py-1 text-xs font-medium tracking-wide text-eocs-gold">
            {participant.name}
          </span>
        </header>

        <div className="mx-auto mt-5 h-0.5 w-40 rounded bg-gradient-to-r from-transparent via-eocs-gold to-transparent" />

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-eocs-light/60">
            <span className="font-medium uppercase tracking-widest">Check-in progress</span>
            <span>
              {doneCount} / {steps.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-eocs-gold to-[#e4d5bd] transition-all duration-500"
              style={{ width: `${(doneCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <ol className="relative mt-8 space-y-6">
          <div className="absolute bottom-5 left-5 top-5 w-px bg-gradient-to-b from-eocs-gold/70 via-eocs-gold/25 to-eocs-gold/70" />
          {steps.map((step) => (
            <li key={step.key} className="relative">
              <form
                action={updateStatus}
                className="flex items-center gap-4 rounded-xl border border-eocs-gold/10 bg-eocs-dark/40 p-4 transition hover:border-eocs-gold/35"
              >
                <input type="hidden" name="id" value={participant.id} />
                <input type="hidden" name="field" value={step.key} />
                <input type="hidden" name="value" value={String(!step.done)} />

                <span
                  className={
                    step.done
                      ? "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-eocs-gold bg-eocs-gold text-[#1a1412] shadow-[0_0_16px_rgba(173,130,49,0.45)]"
                      : "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-eocs-gold/25 bg-eocs-gold/10"
                  }
                >
                  {step.done ? (
                    <CheckIcon />
                  ) : (
                    <span className="font-display text-xs font-bold text-eocs-gold">
                      {step.number}
                    </span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-eocs-light">{step.label}</p>
                  <p className="mt-0.5 text-xs text-eocs-light/50">{step.detail}</p>
                </div>

                <SubmitButton done={step.done} />
              </form>
            </li>
          ))}
        </ol>

        <a
          href="/home"
          className="mt-8 block text-center text-xs uppercase tracking-widest text-eocs-light/40 transition hover:text-eocs-gold"
        >
          Back to scanner
        </a>
      </div>
    </main>
  );
}
