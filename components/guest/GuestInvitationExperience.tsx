
'use client';

import { useRef, useState } from 'react';
import InvitationQRCode from '@/components/InvitationQRCode';

type Props = {
  token: string;
  guestName: string;
  checkedIn: boolean;
  partnerName?: string;
};

export default function GuestInvitationExperience({
  token,
  guestName,
  checkedIn,
}: Props) {
  const photoInput = useRef<HTMLInputElement>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);

  function handlePhotoSelection(files: FileList | null) {
    if (!files) return;
    const images = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );
    setSelectedPhotos((previous) => [...previous, ...images]);
  }

  function installPage() {
    alert(
      'To add this invitation to your home screen, open your browser menu and choose “Add to Home Screen” or “Install App”.\n\nይህንን ግብዣ ወደ ስልክዎ ዋና ገጽ ለመጨመር የብራውዘሩን ሜኑ ከፍተው “Add to Home Screen” ወይም “Install App” የሚለውን ይምረጡ።'
    );
  }

  return (
    <main className="guest-memory-page">
      <div className="guest-atmosphere" aria-hidden="true">
        <span className="guest-orbit guest-orbit-one" />
        <span className="guest-orbit guest-orbit-two" />
        <span className="guest-orbit guest-orbit-three" />
        <span className="guest-light guest-light-one" />
        <span className="guest-light guest-light-two" />
        <span className="guest-petal guest-petal-one" />
        <span className="guest-petal guest-petal-two" />
        <span className="guest-petal guest-petal-three" />
      </div>

      <div className="guest-page-inner">
        <header className="guest-welcome">
          <p className="guest-eyebrow">
            OUR WEDDING CELEBRATION
            <span>የእኛ የሠርግ በዓል</span>
          </p>

          <h1 className="guest-couple-title">Betslot &amp; Amanuel</h1>
          <p className="guest-subtitle">
            A day of love, a lifetime of memories
            <span>የፍቅር ቀን፣ የዘላለም ትዝታ</span>
          </p>

          <div className="guest-fine-rule">
            <span />
          </div>

          <p className="guest-dear">
            Dear {guestName}
            <span>ውድ {guestName}</span>
          </p>

          <p className="guest-welcome-copy">
            We are delighted to celebrate this special occasion with you.
            <span>ይህንን ልዩ ቀን ከእርስዎ ጋር ለማክበር በጣም ደስ ብሎናል።</span>
          </p>
        </header>

        <section className="guest-glass-panel guest-event-panel">
          <div className="guest-panel-heading">
            <span>THE CELEBRATION</span>
            <span>የበዓሉ ዝርዝር</span>
          </div>

          <div className="guest-event-details">
            <div>
              <strong>19 November 2028</strong>
              <span>እሑድ፣ ኖቬምበር 19፣ 2028</span>
            </div>
            <div>
              <strong>8:00 PM</strong>
              <span>ምሽት 2:00 ሰዓት</span>
            </div>
            <div>
              <strong>Friendship Park</strong>
              <span>ፍሬንድሺፕ ፓርክ</span>
            </div>
            <div>
              <strong>Addis Ababa, Ethiopia</strong>
              <span>አዲስ አበባ፣ ኢትዮጵያ</span>
            </div>
          </div>
        </section>

        <section className="guest-glass-panel guest-pass-panel">
          <div className="guest-panel-heading">
            <span>YOUR PERSONAL ENTRANCE PASS</span>
            <span>የእርስዎ የግል መግቢያ ትኬት</span>
          </div>

          <p className="guest-section-copy">
            Please present this QR code at the wedding entrance.
            <span>በሠርጉ መግቢያ ላይ ይህንን QR ኮድ ያሳዩ።</span>
          </p>

          <div className="guest-qr-frame">
            <InvitationQRCode token={token} />
          </div>

          <p className="guest-pass-name">{guestName}</p>
          <p className="guest-pass-name-am">የእንግዳ ስም</p>

          {checkedIn && (
            <div className="guest-checked-in">
              <span>CHECKED IN · ገብተዋል</span>
            </div>
          )}
        </section>

        <section className="guest-glass-panel guest-memory-panel">
          <p className="guest-eyebrow">
            OUR MEMORIES
            <span>የእኛ ትዝታዎች</span>
          </p>

          <h2 className="guest-script-heading">
            Share Your Memories With Love
          </h2>
          <p className="guest-amharic-script">
            የሠርጋችንን ትዝታዎች በፍቅር ያጋሩን
          </p>

          <p className="guest-section-copy">
            Your photographs will help us remember every beautiful moment.
            We would love to see the memories you captured.
            <span>
              የእርስዎ ፎቶዎች እያንዳንዱን ውብ ቅጽበት እንድናስታውስ ይረዱናል።
              ያነሷቸውን የሠርጋችን ትዝታዎች እንድታጋሩን እንፈልጋለን።
            </span>
          </p>

          <input
            ref={photoInput}
            className="guest-photo-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => handlePhotoSelection(event.target.files)}
          />

          <button
            className="guest-upload-button"
            type="button"
            onClick={() => photoInput.current?.click()}
          >
            <span className="guest-upload-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 16.5v2A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-2" />
              </svg>
            </span>
            <span>
              <strong>CHOOSE WEDDING PHOTOS</strong>
              <small>የሠርጉን ፎቶዎች ይምረጡ</small>
            </span>
          </button>

          {selectedPhotos.length > 0 && (
            <div className="guest-photo-selection">
              <strong>
                {selectedPhotos.length} photo(s) selected
                <span>{selectedPhotos.length} ፎቶዎች ተመርጠዋል</span>
              </strong>
              <ul>
                {selectedPhotos.map((file, index) => (
                  <li key={`${file.name}-${index}`}>{file.name}</li>
                ))}
              </ul>
              <p>
                Your photos are selected on this device. Online submission
                will be enabled when the private wedding gallery storage is
                connected.
                <span>
                  ፎቶዎችዎ ተመርጠዋል። ወደ የሠርጉ የግል የፎቶ ማህደር መላክ የሚቻለው
                  የፎቶ ማከማቻው ሲገናኝ ነው።
                </span>
              </p>
            </div>
          )}
        </section>

        <section className="guest-scroll-section">
          <div className="guest-scroll">
            <div className="guest-scroll-top" />
            <div className="guest-scroll-paper">
              <p className="guest-scroll-kicker">
                A MESSAGE FROM OUR HEARTS
                <span>ከልባችን የተላከ መልዕክት</span>
              </p>

              <h2>With All Our Love &amp; Gratitude</h2>
              <h3>በሙሉ ፍቅርና ምስጋናችን</h3>

              <div className="guest-scroll-divider">
                <span />
              </div>

              <p className="guest-scroll-message">
                Thank you for celebrating our special day with us. Your
                presence, love and blessings made our wedding unforgettable.
                With heartfelt gratitude, we thank you and your families for
                being part of our beginning.
              </p>

              <p className="guest-scroll-message guest-scroll-amharic">
                በዚህ ልዩ ቀናችን ከእኛ ጋር ስለተካፈላችሁ እናመሰግናለን።
                መገኘታችሁ፣ ፍቅራችሁና በረከታችሁ የሠርጋችንን ቀን የማይረሳ
                አድርጎታል። የሕይወታችን አዲስ ጅማሬ አካል ስለሆናችሁ ከልብ
                እናመሰግናለን።
              </p>

              <p className="guest-scroll-signature">
                With love, Betslot &amp; Amanuel
                <span>ከፍቅር ጋር፣ ቤትስሎት እና አማኑኤል</span>
              </p>

              <p className="guest-scroll-family">
                AND OUR FAMILIES · ከቤተሰቦቻችን ጋር
              </p>
            </div>
            <div className="guest-scroll-bottom" />
          </div>
        </section>

        <footer className="guest-page-footer">
          <button
            className="guest-home-button"
            type="button"
            onClick={installPage}
          >
            ADD TO HOME SCREEN
            <span>ወደ ስልክዎ ዋና ገጽ ይጨምሩ</span>
          </button>

          <p>
            A celebration remembered forever.
            <span>ለዘላለም የሚታወስ በዓል</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
