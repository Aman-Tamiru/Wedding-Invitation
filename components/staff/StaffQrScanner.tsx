
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

type ScanStatus = "idle" | "starting" | "scanning" | "success" | "error";

export default function StaffQrScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState(
    "Position the guest's invitation QR code inside the frame."
  );
  const [guestName, setGuestName] = useState("");

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
    } catch {
      // Camera may already have stopped.
    }

    scannerRef.current = null;
  }

  async function startScanner() {
    setStatus("starting");
    setMessage("Requesting access to your back camera...");
    setGuestName("");
    processingRef.current = false;

    try {
      await stopScanner();

      const scanner = new Html5Qrcode("staff-qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 12,
          qrbox: { width: 230, height: 230 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;

          setMessage("Invitation captured. Verifying guest...");

          try {
            await stopScanner();

            const response = await fetch("/api/staff/checkin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ qr_token: decodedText }),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(
                result.error || result.message || "Check-in could not be completed."
              );
            }

            setGuestName(
              result.guest?.full_name ||
              result.guest?.name ||
              result.full_name ||
              "Guest"
            );

            setMessage(result.message || "Guest successfully checked in.");
            setStatus("success");
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to verify this invitation."
            );
            setStatus("error");
          }
        },
        () => {}
      );

      setStatus("scanning");
      setMessage("Camera active. Hold the invitation steady inside the frame.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Camera access failed. Check browser permissions."
      );
      await stopScanner();
    }
  }

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/75 bg-white/55 p-5 shadow-[0_20px_60px_rgba(105,72,76,0.10)] backdrop-blur-2xl sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#ead5d9]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#e9dcc8]/40 blur-3xl" />

      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#a17b62]">
              <span className="text-lg">✧</span>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em]">
                Wedding entrance
              </p>
            </div>
            <h2 className="font-serif text-2xl text-[#805767] sm:text-3xl">
              Invitation QR Scanner
            </h2>
            <p className="mt-2 text-sm text-[#927e73]">
              Welcome each guest with a quick invitation scan.
            </p>
          </div>

          <span className="rounded-full border border-[#e8d8cc] bg-white/60 px-4 py-2 text-xs text-[#805767]">
            ◉ Back camera
          </span>
        </div>

        <div className="relative mx-auto max-w-[470px] overflow-hidden rounded-[26px] border border-[#d9c5bb] bg-[#211b20] p-2 shadow-[0_15px_40px_rgba(40,25,35,0.18)]">
          <div
            id="staff-qr-reader"
            className="min-h-[280px] overflow-hidden rounded-[19px]"
          />

          {status === "idle" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-white">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl">
                ◈
              </div>
              <p className="font-serif text-xl">Ready to welcome your guests</p>
              <p className="mt-2 text-xs text-white/65">
                Your camera preview will appear here
              </p>
            </div>
          )}

          {(status === "scanning" || status === "starting") && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-[230px] w-[230px] rounded-2xl border-2 border-[#e7c994] shadow-[0_0_0_999px_rgba(20,15,20,0.16)]">
                <span className="absolute -left-1 -top-1 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-[#f4d7a5]" />
                <span className="absolute -right-1 -top-1 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-[#f4d7a5]" />
                <span className="absolute -bottom-1 -left-1 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-[#f4d7a5]" />
                <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-[#f4d7a5]" />
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto mt-5 max-w-[470px]">
          <div className="flex items-start gap-2 text-sm leading-6 text-[#806b66]">
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                status === "scanning" || status === "success"
                  ? "bg-emerald-500"
                  : status === "error"
                    ? "bg-red-400"
                    : "bg-[#c5a46d]"
              }`}
            />
            {message}
          </div>

          {status === "success" && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/85 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                Check-in confirmed
              </p>
              <p className="mt-1 font-serif text-2xl text-emerald-900">
                {guestName}
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {status !== "scanning" && status !== "starting" ? (
              <button
                type="button"
                onClick={() => void startScanner()}
                className="flex-1 rounded-full bg-[#805767] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#805767]/20 transition hover:bg-[#704958]"
              >
                {status === "success" ? "Scan Next Guest" : "Open Back Camera"}
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await stopScanner();
                  setStatus("idle");
                  setMessage("Camera stopped. You can start another scan.");
                }}
                className="flex-1 rounded-full border border-[#dfcfc5] bg-white/75 px-6 py-3.5 text-sm font-semibold text-[#805767]"
              >
                Stop Camera
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] leading-5 text-[#a08d83]">
            Camera permission is required. Only authorized wedding staff should
            scan guest invitations.
          </p>
        </div>
      </div>
    </section>
  );
}
