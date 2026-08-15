"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

type ScanStatus = "idle" | "redirecting" | "unrecognized" | "error";

function extractId(raw: string): string | null {
  const value = raw.trim();
  const urlMatch = value.match(/\/data\/([^/?#]+)/i);
  if (urlMatch) return urlMatch[1];
  if (/^[a-f0-9]{24}$/i.test(value)) return value;
  const anyId = value.match(/\b[a-f0-9]{24}\b/i);
  if (anyId) return anyId[0];
  return null;
}

export default function QrScanPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [lastValue, setLastValue] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      const value = detectedCodes[0]?.rawValue;
      if (!value || timerRef.current) return;

      const id = extractId(value);
      if (!id) {
        setLastValue(value);
        setStatus("unrecognized");
        return;
      }

      setStatus("redirecting");
      timerRef.current = setTimeout(() => {
        router.push(`/data/${id}`);
      }, 1000);
    },
    [router]
  );

  const handleError = useCallback(() => {
    setStatus("error");
  }, []);

  const retry = useCallback(() => {
    setStatus("idle");
    setLastValue(null);
    setCameraKey((k) => k + 1);
  }, []);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-eocs-gold/15 bg-eocs-dark/35 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-eocs-gold">
          EOCS · Check-in Scanner
        </p>

        <h1 className="mt-3 text-center font-display text-xl font-bold uppercase tracking-wider text-eocs-light">
          Scan QR Code
        </h1>

        <div className="mx-auto mt-4 h-0.5 w-28 rounded bg-gradient-to-r from-transparent via-eocs-gold to-transparent" />

        <p className="mt-5 text-center text-sm leading-relaxed text-eocs-light/60">
          Point the camera at the participant&apos;s QR code to open their
          check-in page.
        </p>

        <div className="relative mt-6 aspect-square w-full overflow-hidden rounded-2xl border border-eocs-gold/40 bg-black/60 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
          {status === "error" ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-sm text-eocs-light/70">
                Couldn&apos;t access the camera. Check your browser permissions.
              </p>
              <button
                onClick={retry}
                className="rounded-full bg-eocs-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1a1412] shadow-[0_4px_16px_rgba(173,130,49,0.35)] transition hover:-translate-y-0.5 hover:bg-[#c49a3a]"
              >
                Retry camera
              </button>
            </div>
          ) : (
            <Scanner
              key={cameraKey}
              onScan={handleScan}
              onError={handleError}
              sound
              paused={status === "redirecting"}
              allowMultiple={false}
              components={{ finder: true, torch: false, zoom: false, onOff: false }}
              classNames={{
                container: "h-full w-full",
                video: "h-full w-full object-cover",
              }}
            />
          )}

          <span className="pointer-events-none absolute left-3 top-3 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-eocs-gold/80" />
          <span className="pointer-events-none absolute right-3 top-3 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-eocs-gold/80" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-eocs-gold/80" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-eocs-gold/80" />
        </div>

        <p className="mt-5 text-center text-sm">
          {status === "redirecting" ? (
            <span className="font-semibold uppercase tracking-widest text-eocs-gold">
              Participant found · Redirecting…
            </span>
          ) : status === "unrecognized" ? (
            <span className="text-red-300">
              Unrecognized QR code. Please try again.
              {lastValue && (
                <span className="mt-2 block break-all text-xs text-red-200/70">
                  Decoded: {lastValue}
                </span>
              )}
            </span>
          ) : (
            <span className="text-eocs-light/50">Ready to scan</span>
          )}
        </p>
      </div>
    </main>
  );
}
