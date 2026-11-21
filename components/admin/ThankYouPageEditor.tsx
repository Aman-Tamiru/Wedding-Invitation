
"use client";

import { useState } from "react";
import GuestInvitationExperience, {
  ThankYouContent,
} from "@/components/guest/GuestInvitationExperience";

const initialContent: ThankYouContent = {
  eyebrowEn: "A MESSAGE FROM OUR HEARTS",
  eyebrowAm: "ከልባችን የተላከ መልዕክት",
  headingEn: "With All Our Love & Gratitude",
  headingAm: "በሙሉ ፍቅርና ምስጋናችን",
  messageEn:
    "Thank you for celebrating our special day with us. Your presence, love and blessings made our wedding unforgettable. With heartfelt gratitude, we thank you and your families for being part of our beginning.",
  messageAm:
    "በዚህ ልዩ ቀናችን ከእኛ ጋር ስለተካፈላችሁ እናመሰግናለን። መገኘታችሁ፣ ፍቅራችሁና በረከታችሁ የሠርጋችንን ቀን የማይረሳ አድርጎታል።",
  signatureEn: "With love, Betslot & Amanuel",
  signatureAm: "ከፍቅር ጋር፣ ቤትስሎት እና አማኑኤል",
  familyEn: "AND OUR FAMILIES",
  familyAm: "ከቤተሰቦቻችን ጋር",
  fontFamily: "Georgia",
  headingSize: 30,
  bodySize: 15,
  paperColor: "#fffaf3",
  textColor: "#59494a",
  accentColor: "#805767",
  alignment: "center",
};

const fieldClass =
  "w-full rounded-xl border border-[#e6d9d0] bg-white px-4 py-3 text-sm text-[#634d50] outline-none focus:border-[#a77d86]";

export default function ThankYouPageEditor() {
  const [content, setContent] = useState<ThankYouContent>(initialContent);
  const [notice, setNotice] = useState("");

  function update<K extends keyof ThankYouContent>(
    key: K,
    value: ThankYouContent[K]
  ) {
    setContent((previous) => ({ ...previous, [key]: value }));
    setNotice("Preview updated. Database saving will be connected in the next stage.");
  }

  function textField(
    label: string,
    key: keyof ThankYouContent,
    multiline = false
  ) {
    const value = content[key];

    if (typeof value !== "string") return null;

    return (
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#765b60]">{label}</span>
        {multiline ? (
          <textarea
            rows={5}
            className={fieldClass}
            value={value}
            onChange={(event) => update(key, event.target.value as never)}
          />
        ) : (
          <input
            className={fieldClass}
            value={value}
            onChange={(event) => update(key, event.target.value as never)}
          />
        )}
      </label>
    );
  }

  const panelClass =
    "rounded-[24px] border border-[#eaded3] bg-white/90 p-5 shadow-sm sm:p-7";

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">
      <header className="rounded-[26px] border border-[#e9d8ce] bg-gradient-to-r from-[#fffaf6] via-[#f8e9e9] to-[#f4eadc] px-6 py-7 shadow-sm sm:px-9">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a17b62]">
          WEDDING ADMINISTRATION
        </p>
        <h1 className="mt-3 font-serif text-3xl text-[#754e5c] sm:text-4xl">
          Thank-You Page Editor
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#806e68]">
          Preview the actual guest invitation page above. Edit the thank-you
          message and its appearance using the controls below.
        </p>
      </header>

      <section className={panelClass}>
        <div className="mb-5">
          <h2 className="font-serif text-2xl text-[#754e5c]">
            Exact Guest Page Preview
          </h2>
          <p className="mt-2 text-sm text-[#947e74]">
            This uses the same guest-facing component as the invitation page.
            The preview is not a separate mockup.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e7d8cc]">
          <GuestInvitationExperience
            token="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
            guestName="Preview Guest"
            checkedIn={false}
            previewMode
            thankYouContent={content}
          />
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="mb-5 font-serif text-2xl text-[#754e5c]">
          English Content
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {textField("Small heading", "eyebrowEn")}
          {textField("Main heading", "headingEn")}
          <div className="md:col-span-2">
            {textField("Thank-you message", "messageEn", true)}
          </div>
          {textField("Signature", "signatureEn")}
          {textField("Family closing text", "familyEn")}
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="mb-5 font-serif text-2xl text-[#754e5c]">
          የአማርኛ ይዘት
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {textField("ትንሽ ርዕስ", "eyebrowAm")}
          {textField("ዋና ርዕስ", "headingAm")}
          <div className="md:col-span-2">
            {textField("የምስጋና መልዕክት", "messageAm", true)}
          </div>
          {textField("የፊርማ ጽሑፍ", "signatureAm")}
          {textField("የቤተሰብ መዝጊያ ጽሑፍ", "familyAm")}
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="mb-5 font-serif text-2xl text-[#754e5c]">
          Typography & Layout
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2 text-sm text-[#765b60]">
            Font family
            <select
              className={fieldClass}
              value={content.fontFamily}
              onChange={(event) => update("fontFamily", event.target.value)}
            >
              <option value="Georgia">Georgia</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Palatino Linotype">Palatino</option>
              <option value="Trebuchet MS">Trebuchet</option>
            </select>
          </label>

          <label className="block space-y-2 text-sm text-[#765b60]">
            Text alignment
            <select
              className={fieldClass}
              value={content.alignment}
              onChange={(event) =>
                update("alignment", event.target.value as "center" | "left")
              }
            >
              <option value="center">Centered</option>
              <option value="left">Left aligned</option>
            </select>
          </label>

          <label className="block space-y-2 text-sm text-[#765b60]">
            Heading size: {content.headingSize}px
            <input
              type="range"
              min="20"
              max="54"
              value={content.headingSize}
              onChange={(event) => update("headingSize", Number(event.target.value))}
              className="w-full"
            />
          </label>

          <label className="block space-y-2 text-sm text-[#765b60]">
            Message size: {content.bodySize}px
            <input
              type="range"
              min="12"
              max="25"
              value={content.bodySize}
              onChange={(event) => update("bodySize", Number(event.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="mb-5 font-serif text-2xl text-[#754e5c]">
          Colors & Appearance
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["Thank-you paper", "paperColor"],
            ["Message text", "textColor"],
            ["Headings and accents", "accentColor"],
          ] as const).map(([label, key]) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-xl border border-[#eee4dc] p-3 text-sm text-[#765b60]"
            >
              <input
                type="color"
                value={content[key]}
                onChange={(event) => update(key, event.target.value)}
                className="h-11 w-14 cursor-pointer rounded border-0 bg-transparent"
              />
              <span>{label}</span>
              <span className="ml-auto text-xs">{content[key]}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => {
            setContent(initialContent);
            setNotice("Preview restored to the original content.");
          }}
          className="rounded-full border border-[#d9c8bd] bg-white px-6 py-3 text-sm font-semibold text-[#805767]"
        >
          Reset Preview
        </button>
        <p className="text-sm text-[#947e74]">
          {notice || "Edits update the guest preview immediately."}
        </p>
      </div>
    </div>
  );
}
