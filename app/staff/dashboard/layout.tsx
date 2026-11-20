
import type { ReactNode } from "react";


import { CoupleWatermarks } from "@/components/CoupleWatermarks";
import StaffQrScanner from "@/components/staff/StaffQrScanner";

function StaffAtmosphere() {
  return (
    <div className="staff-atmosphere" aria-hidden="true">
      <svg
        className="staff-atmosphere-lines"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M-150 260 C180 40 390 520 720 300 S1190 80 1600 350" />
        <path d="M-180 390 C160 150 440 650 790 410 S1260 190 1630 470" />
        <path d="M-160 600 C220 350 450 830 850 590 S1250 420 1600 680" />
        <path d="M-100 820 C250 580 500 1000 900 770 S1280 650 1600 900" />
        <circle cx="78%" cy="30%" r="180" />
        <circle cx="78%" cy="30%" r="245" />
      </svg>

      <div className="staff-floating-hearts">
        <span>♡</span>
        <span>♥</span>
        <span>♡</span>
        <span>♥</span>
        <span>♡</span>
        <span>♥</span>
        <span>♡</span>
      </div>
    </div>
  );
}

export default function StaffDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="staff-dashboard-layout">
      <div className="staff-dashboard-base" aria-hidden="true" />

      <StaffAtmosphere />

      <CoupleWatermarks />

      <div className="staff-dashboard-content">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-8">
          <StaffQrScanner />
        </div>

        {children}
      </div>
    </div>
  );
}
