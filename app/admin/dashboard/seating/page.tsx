"use client";

import SeatingEditorPreview from "@/components/admin/SeatingEditorPreview";
import { useAdminLanguage } from "@/components/admin/AdminShell";

export default function SeatingArrangementPage() {
  const { language } = useAdminLanguage();
  const am = language === "am";

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <header className="rounded-[26px] border border-[#e9d8ce] bg-gradient-to-r from-[#fffaf6] via-[#f8e9e9] to-[#f4eadc] px-6 py-7 shadow-sm sm:px-9">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a17b62]">
          {am ? "የሰርግ አዳራሽ እቅድ" : "WEDDING RECEPTION PLANNING"}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-[#754e5c] sm:text-4xl">
          {am ? "የመቀመጫ ዝግጅት" : "Seating Arrangement"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#806e68]">
          {am
            ? "የሰርጋችሁን መድረክ፣ የዳንስ ቦታ፣ የሙዚቃ ቦታ እና የእንግዶች መቀመጫ አቀማመጥ ይመልከቱ።"
            : "Review the reception stage, royal seating, wedding party, dance floor, DJ position and both guest seating sections. This is the first visual concept for your wife's review."}
        </p>
      </header>

      <SeatingEditorPreview />
    </div>
  );
}