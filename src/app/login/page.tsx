import { login } from "./action";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm rounded-2xl border border-eocs-gold/15 bg-eocs-dark/35 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-eocs-gold">
          EOCS · Staff Access
        </p>

        <h1 className="mt-3 text-center font-display text-xl font-bold uppercase tracking-wider text-eocs-light">
          Enter passcode
        </h1>

        <div className="mx-auto mt-4 h-0.5 w-28 rounded bg-gradient-to-r from-transparent via-eocs-gold to-transparent" />

        {error === "1" && (
          <p className="mt-5 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-center text-sm text-red-300">
            Incorrect passcode. Please try again.
          </p>
        )}

        <form action={login} className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            name="passcode"
            placeholder="Passcode"
            required
            autoFocus
            className="w-full rounded-lg border border-eocs-gold/25 bg-[#282423]/70 px-4 py-2.5 text-eocs-light placeholder:text-eocs-light/40 outline-none transition focus:border-eocs-gold focus:shadow-[0_0_0_3px_rgba(173,130,49,0.15)]"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-eocs-gold py-2.5 font-bold uppercase tracking-widest text-[#1a1412] shadow-[0_4px_16px_rgba(173,130,49,0.35)] transition hover:-translate-y-0.5 hover:bg-[#c49a3a]"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
