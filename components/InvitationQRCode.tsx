
'use client';

import { QRCodeSVG } from 'qrcode.react';

export default function InvitationQRCode({ token }: { token: string }) {
  return (
    <div className="inline-flex rounded-2xl bg-white p-4 shadow-sm">
      <QRCodeSVG
        value={token}
        size={240}
        level="H"
        includeMargin
        bgColor="#ffffff"
        fgColor="#241b20"
      />
    </div>
  );
}
