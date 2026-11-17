
"use client";

import { useMemo, useState } from "react";

type Side = "bride" | "groom";

type SelectedSeat = {
  id: string;
  side: Side;
  table: number;
  chair: number;
};

type SelectedTable = {
  side: Side;
  table: number;
};

const SIDE_COLORS = {
  bride: {
    empty: "#d9a9b8",
    occupied: "#9b6378",
    text: "#855467",
  },
  groom: {
    empty: "#d2bb91",
    occupied: "#9b7948",
    text: "#856b43",
  },
};

function Flower({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="-8"
          rx="4"
          ry="8"
          fill={i % 2 === 0 ? "#d6a0a9" : "#e8c4bd"}
          transform={`rotate(${i * 45})`}
        />
      ))}
      <circle r="4" fill="#c29a55" />
    </g>
  );
}

function FloralArrangement({
  x,
  y,
}: {
  x: number;
  y: number;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 13 Q-12 -2 -25 -15 M0 13 Q12 -3 26 -16 M0 13 Q0 -8 0 -25"
        fill="none"
        stroke="#71846b"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <ellipse
        cx="-17"
        cy="-9"
        rx="5"
        ry="11"
        fill="#9aaa83"
        transform="rotate(-48 -17 -9)"
      />
      <ellipse
        cx="18"
        cy="-10"
        rx="5"
        ry="11"
        fill="#8fa17a"
        transform="rotate(48 18 -10)"
      />
      <ellipse
        cx="-8"
        cy="-19"
        rx="4"
        ry="9"
        fill="#a9b58f"
        transform="rotate(-25 -8 -19)"
      />
      <ellipse
        cx="9"
        cy="-20"
        rx="4"
        ry="9"
        fill="#829777"
        transform="rotate(25 9 -20)"
      />

      <Flower x={-13} y={-12} />
      <Flower x={13} y={-13} />
      <Flower x={0} y={-25} />

      <circle cx="0" cy="2" r="3" fill="#c29a55" />
    </g>
  );
}

function PartyChair({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Chair back */}
      <rect
        x="-7"
        y="-12"
        width="14"
        height="12"
        rx="4"
        fill={color}
        stroke="#806b60"
        strokeWidth="0.9"
      />
      {/* Chair seat */}
      <rect
        x="-8"
        y="0"
        width="16"
        height="7"
        rx="2"
        fill="#fffaf4"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Chair legs */}
      <path
        d="M-6 7 L-6 11 M6 7 L6 11"
        stroke="#987c66"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </g>
  );
}

function PartyTable({
  x,
  y,
  width,
  label,
  color,
  count,
}: {
  x: number;
  y: number;
  width: number;
  label: string;
  color: string;
  count: number;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height="76"
        rx="13"
        fill="#fffaf4"
        stroke={color}
        strokeWidth="2"
      />

      {/* Exactly five chair-shaped seats, on the top side only */}
      {Array.from({ length: count }, (_, i) => {
        const seatX = x + ((i + 1) * width) / (count + 1);

        return (
          <PartyChair
            key={i}
            x={seatX}
            y={y - 13}
            color={color}
          />
        );
      })}

      <text
        x={x + width / 2}
        y={y + 27}
        textAnchor="middle"
        fontSize="10"
        fill="#765c57"
        fontWeight="700"
      >
        {label}
      </text>

      <FloralArrangement
        x={x + width / 2}
        y={y + 53}
      />
    </g>
  );
}

function RoyalChair({
  x,
  label,
  color,
}: {
  x: number;
  label: string;
  color: string;
}) {
  return (
    <g transform={`translate(${x} 185)`}>
      <text
        x="0"
        y="-48"
        textAnchor="middle"
        fontSize="29"
        fill="#b58d4d"
      >
        ♛
      </text>

      <path
        d="M-25 8 L-25 -20 Q-25 -34 -12 -34 L12 -34 Q25 -34 25 -20 L25 8"
        fill={color}
        stroke="#98734b"
        strokeWidth="2"
      />

      <rect
        x="-24"
        y="0"
        width="48"
        height="36"
        rx="9"
        fill={color}
        stroke="#98734b"
        strokeWidth="2"
      />

      <path
        d="M-18 36 L-20 47 M18 36 L20 47"
        stroke="#98734b"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <text
        x="0"
        y="23"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#fffaf3"
      >
        {label}
      </text>
    </g>
  );
}

export default function SeatingEditorPreview() {
  const [seatNames, setSeatNames] = useState<Record<string, string>>({});
  const [occupied, setOccupied] = useState<Record<string, boolean>>({});
  const [selectedSeat, setSelectedSeat] = useState<SelectedSeat | null>(null);
  const [selectedTable, setSelectedTable] = useState<SelectedTable | null>(
    null
  );
  const [chairCounts, setChairCounts] = useState<Record<string, number>>({});
  const [walkwayWidth, setWalkwayWidth] = useState(200);

  const tableRows = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i),
    []
  );

  const tableColumns = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i),
    []
  );

  const tableKey = (side: Side, table: number) =>
    `${side}-table-${table}`;

  const seatKey = (side: Side, table: number, chair: number) =>
    `${side}-${table}-${chair}`;

  const getChairCount = (side: Side, table: number) =>
    chairCounts[tableKey(side, table)] ?? 10;

  const selectSeat = (
    event: React.MouseEvent<SVGGElement>,
    side: Side,
    table: number,
    chair: number
  ) => {
    event.stopPropagation();
    setSelectedTable(null);
    setSelectedSeat({
      id: seatKey(side, table, chair),
      side,
      table,
      chair,
    });
  };

  const selectTable = (
    event: React.MouseEvent<SVGGElement>,
    side: Side,
    table: number
  ) => {
    event.stopPropagation();
    setSelectedSeat(null);
    setSelectedTable({ side, table });
  };

  const renderTable = (side: Side, row: number, col: number) => {
    const tableNumber = row * 10 + col + 1;

    const centerX =
      side === "bride" ? 55 + col * 61 : 1015 + col * 61;

    const centerY = 660 + row * 64;
    const radius = 20;
    const count = getChairCount(side, tableNumber);
    const tableId = tableKey(side, tableNumber);

    const isSelected =
      selectedTable?.side === side &&
      selectedTable?.table === tableNumber;

    return (
      <g key={tableId}>
        {Array.from({ length: count }, (_, i) => {
          const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
          const seatX = centerX + Math.cos(angle) * radius;
          const seatY = centerY + Math.sin(angle) * radius;

          const id = seatKey(side, tableNumber, i + 1);
          const isOccupied = !!occupied[id];
          const isSelectedSeat = selectedSeat?.id === id;
          const color = SIDE_COLORS[side];

          return (
            <g
              key={id}
              onClick={(event) =>
                selectSeat(event, side, tableNumber, i + 1)
              }
              className="cursor-pointer"
              role="button"
              aria-label={`${side} side table ${tableNumber}, chair ${i + 1}`}
            >
              <title>
                {seatNames[id] || "Unassigned chair"} ·{" "}
                {isOccupied ? "Occupied" : "Unoccupied"} · Click to edit
              </title>

              <circle
                cx={seatX}
                cy={seatY}
                r={isSelectedSeat ? 8 : 6}
                fill={isOccupied ? color.occupied : color.empty}
                stroke={isSelectedSeat ? "#50343c" : "#806b60"}
                strokeWidth={isSelectedSeat ? 2.5 : 1}
              />

              {isSelectedSeat && seatNames[id] && (
                <g>
                  <rect
                    x={seatX - 48}
                    y={seatY - 28}
                    width="96"
                    height="15"
                    rx="5"
                    fill="#fffaf4"
                    stroke="#b58d79"
                  />
                  <text
                    x={seatX}
                    y={seatY - 18}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#684b52"
                    fontWeight="700"
                  >
                    {seatNames[id].slice(0, 18)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        <g
          onClick={(event) => selectTable(event, side, tableNumber)}
          className="cursor-pointer"
          role="button"
          aria-label={`Edit ${side} side table ${tableNumber}`}
        >
          <title>
            {side === "bride" ? "Bride" : "Groom"} table {tableNumber} ·{" "}
            {count} chairs · Click to edit
          </title>

          <circle
            cx={centerX}
            cy={centerY}
            r="12"
            fill={isSelected ? "#fff1d7" : "#fffaf4"}
            stroke={isSelected ? "#a87943" : "#b99b7a"}
            strokeWidth={isSelected ? 2.8 : 1.5}
          />

          <text
            x={centerX}
            y={centerY + 3}
            textAnchor="middle"
            fontSize="7"
            fill="#806b60"
            fontWeight="700"
          >
            {tableNumber}
          </text>
        </g>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[#eadccf] bg-[#fffaf5] shadow-[0_20px_70px_rgba(91,55,59,0.09)]">
        <div className="border-b border-[#eadccf] bg-gradient-to-r from-[#f8e9e9] via-[#fffaf5] to-[#f2e8d8] px-5 py-7 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#a17b62]">
            Betslot & Amanuel
          </p>

          <h2 className="mt-2 font-serif text-3xl text-[#744c59] sm:text-4xl">
            Wedding Reception Seating
          </h2>

          <p className="mt-2 text-sm text-[#927c75]">
            Reception floor plan · Select any chair or table to edit
          </p>
        </div>

        <div className="overflow-x-auto p-3 sm:p-5">
          <svg
            viewBox="0 0 1600 1350"
            className="mx-auto h-auto w-full min-w-[1050px] max-w-[1600px]"
            role="img"
            aria-label="Wedding reception floor plan with stage, couple, wedding party, dance floor and round guest tables"
          >
            <defs>
              <pattern
                id="weddingFloor"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M24 0H0V24"
                  fill="none"
                  stroke="#eadfd4"
                  strokeWidth="0.8"
                />
              </pattern>

              <linearGradient id="weddingStage" x1="0" x2="1">
                <stop offset="0%" stopColor="#f3e2df" />
                <stop offset="50%" stopColor="#fff8ee" />
                <stop offset="100%" stopColor="#f0e2d1" />
              </linearGradient>

              <linearGradient id="weddingDance" x1="0" x2="1">
                <stop offset="0%" stopColor="#f7e8e9" />
                <stop offset="50%" stopColor="#fff7ef" />
                <stop offset="100%" stopColor="#f2e7d8" />
              </linearGradient>
            </defs>

            <rect
              x="8"
              y="8"
              width="1584"
              height="1334"
              rx="28"
              fill="#fffdf9"
              stroke="#ddc9b8"
              strokeWidth="3"
            />

            <rect
              x="20"
              y="20"
              width="1560"
              height="1310"
              rx="22"
              fill="url(#weddingFloor)"
              opacity="0.55"
            />

            {/* STAGE */}
            <rect
              x="55"
              y="35"
              width="1490"
              height="280"
              rx="24"
              fill="url(#weddingStage)"
              stroke="#c5a16d"
              strokeWidth="2.5"
            />

            <text
              x="800"
              y="65"
              textAnchor="middle"
              fontSize="13"
              letterSpacing="5"
              fill="#9b7950"
              fontWeight="700"
            >
              THE WEDDING STAGE
            </text>

            {/* BRIDESMAIDS SHARED TABLE */}
            <PartyTable
              x={100}
              y={155}
              width={360}
              label="BRIDESMAIDS · SHARED TABLE"
              color="#c58e9f"
              count={5}
            />

            {/* BRIDE'S ROYAL CHAIR */}
            <RoyalChair
              x={735}
              label="Betsy"
              color="#bd8999"
            />

            {/* CENTERED COUPLE TABLE IN FRONT OF THE TWO CHAIRS */}
            <g>
              <rect
                x="740"
                y="245"
                width="120"
                height="48"
                rx="10"
                fill="#fffaf4"
                stroke="#b99769"
                strokeWidth="2.5"
              />

              <FloralArrangement x={800} y={270} />

              <text
                x="800"
                y="307"
                textAnchor="middle"
                fontSize="9"
                fill="#80634d"
                fontWeight="700"
              >
                COUPLE TABLE
              </text>
            </g>

            {/* GROOM'S ROYAL CHAIR */}
            <RoyalChair
              x={865}
              label="Aman"
              color="#b69768"
            />

            {/* GROOMSMEN SHARED TABLE */}
            <PartyTable
              x={1140}
              y={155}
              width={360}
              label="GROOMSMEN · SHARED TABLE"
              color="#b89a6d"
              count={5}
            />

            {/* DANCE FLOOR */}
            <rect
              x="250"
              y="345"
              width="1100"
              height="245"
              rx="26"
              fill="url(#weddingDance)"
              stroke="#c5a16d"
              strokeWidth="2.5"
            />

            <rect
              x="270"
              y="365"
              width="1060"
              height="205"
              rx="18"
              fill="none"
              stroke="#d9bfa4"
              strokeDasharray="8 8"
              strokeWidth="1.5"
            />

            <text
              x="800"
              y="405"
              textAnchor="middle"
              fontSize="13"
              letterSpacing="4"
              fill="#9b7950"
              fontWeight="700"
            >
              THE DANCE FLOOR
            </text>

            <text
              x="800"
              y="455"
              textAnchor="middle"
              fontSize="31"
              fill="#9a6575"
              fontFamily="Georgia, serif"
            >
              First Dance
            </text>

            <text
              x="800"
              y="481"
              textAnchor="middle"
              fontSize="12"
              fill="#9a8175"
            >
              Betslot & Amanuel
            </text>

            {/* DJ BOOTH */}
            <g transform="translate(335 505)">
              <rect
                x="-62"
                y="-22"
                width="124"
                height="42"
                rx="9"
                fill="#59434a"
                stroke="#b99769"
                strokeWidth="2"
              />

              <rect
                x="-35"
                y="-15"
                width="70"
                height="24"
                rx="4"
                fill="#ead9c9"
              />

              <circle cx="-46" cy="-3" r="7" fill="#d8b77e" />
              <circle cx="46" cy="-3" r="7" fill="#d8b77e" />

              <path
                d="M63 -11 L78 -11 L78 11 L63 11"
                fill="#b99769"
                stroke="#80634d"
              />

              <text
                x="0"
                y="36"
                textAnchor="middle"
                fontSize="11"
                fill="#80634d"
                fontWeight="700"
              >
                DJ BOOTH →
              </text>
            </g>

            {/* GUEST SIDE LABELS */}
            <text
              x="345"
              y="625"
              textAnchor="middle"
              fontSize="16"
              letterSpacing="3"
              fill="#a2677c"
              fontWeight="700"
            >
              BRIDE'S SIDE
            </text>

            <text
              x="1255"
              y="625"
              textAnchor="middle"
              fontSize="16"
              letterSpacing="3"
              fill="#9b7950"
              fontWeight="700"
            >
              GROOM'S SIDE
            </text>

            {/* CENTRAL WALKWAY */}
            <rect
              x={800 - walkwayWidth / 2}
              y="625"
              width={walkwayWidth}
              height="650"
              rx="18"
              fill="#f3e8dc"
              stroke="#c7a77d"
              strokeWidth="2"
              strokeDasharray="8 8"
            />

            <text
              x="800"
              y="960"
              textAnchor="middle"
              fontSize="13"
              letterSpacing="4"
              fill="#987c66"
              fontWeight="700"
              transform="rotate(-90 800 960)"
            >
              GRAND CENTRAL WALKWAY
            </text>

            {/* 10 ROWS × 10 ROUND GUEST TABLES ON THE BRIDE'S SIDE */}
            {tableRows.map((row) =>
              tableColumns.map((col) => (
                <g key={`bride-${row}-${col}`}>
                  {renderTable("bride", row, col)}
                </g>
              ))
            )}

            {/* 10 ROWS × 10 ROUND GUEST TABLES ON THE GROOM'S SIDE */}
            {tableRows.map((row) =>
              tableColumns.map((col) => (
                <g key={`groom-${row}-${col}`}>
                  {renderTable("groom", row, col)}
                </g>
              ))
            )}

            {/* ENTRANCE */}
            <rect
              x="650"
              y="1290"
              width="300"
              height="36"
              rx="12"
              fill="#eadbc9"
              stroke="#c5a16d"
              strokeWidth="1.5"
            />

            <text
              x="800"
              y="1314"
              textAnchor="middle"
              fontSize="12"
              letterSpacing="3"
              fill="#80634d"
              fontWeight="700"
            >
              GUEST ENTRANCE
            </text>
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 border-t border-[#eadccf] px-5 py-5 text-xs text-[#806f68]">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#d9a9b8]" />
            Bride-side unoccupied
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#9b6378]" />
            Bride-side occupied
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#d2bb91]" />
            Groom-side unoccupied
          </span>

          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#9b7948]" />
            Groom-side occupied
          </span>
        </div>
      </section>

      {/* EDIT SELECTED GUEST CHAIR */}
      {selectedSeat && (
        <section className="rounded-[24px] border border-[#e5d3c8] bg-white p-5 shadow-lg sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a17b62]">
                Selected chair
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#754e5c]">
                {selectedSeat.side === "bride" ? "Bride's" : "Groom's"} side ·
                Table {selectedSeat.table} · Chair {selectedSeat.chair}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="rounded-full border border-[#eadccf] px-4 py-2 text-sm text-[#806e68] hover:bg-[#fbf5f0]"
            >
              Close
            </button>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-medium text-[#765b5c]">
              Guest name
            </span>

            <input
              autoFocus
              value={seatNames[selectedSeat.id] ?? ""}
              onChange={(event) =>
                setSeatNames((current) => ({
                  ...current,
                  [selectedSeat.id]: event.target.value,
                }))
              }
              placeholder="Enter guest name"
              className="w-full rounded-xl border border-[#e5d5cb] bg-[#fffdfa] px-4 py-3 text-sm text-[#684c55] outline-none focus:border-[#a87986]"
            />
          </label>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-3 text-sm text-[#765b5c]">
              <input
                type="checkbox"
                checked={!!occupied[selectedSeat.id]}
                onChange={(event) =>
                  setOccupied((current) => ({
                    ...current,
                    [selectedSeat.id]: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-[#805767]"
              />
              Mark this chair as occupied
            </label>

            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="rounded-full bg-[#805767] px-6 py-3 text-sm font-semibold text-white hover:bg-[#704958]"
            >
              Done
            </button>
          </div>
        </section>
      )}

      {/* EDIT SELECTED ROUND TABLE */}
      {selectedTable && (
        <section className="rounded-[24px] border border-[#e5d3c8] bg-white p-5 shadow-lg sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a17b62]">
                Selected round table
              </p>

              <h3 className="mt-2 font-serif text-2xl text-[#754e5c]">
                {selectedTable.side === "bride" ? "Bride's" : "Groom's"} side ·
                Table {selectedTable.table}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setSelectedTable(null)}
              className="rounded-full border border-[#eadccf] px-4 py-2 text-sm text-[#806e68] hover:bg-[#fbf5f0]"
            >
              Close
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <label className="flex-1">
              <span className="mb-2 block text-sm font-medium text-[#765b5c]">
                Chairs around this table
              </span>

              <input
                type="number"
                min="1"
                max="20"
                value={getChairCount(
                  selectedTable.side,
                  selectedTable.table
                )}
                onChange={(event) => {
                  const value = Math.max(
                    1,
                    Math.min(20, Number(event.target.value) || 1)
                  );

                  setChairCounts((current) => ({
                    ...current,
                    [tableKey(selectedTable.side, selectedTable.table)]:
                      value,
                  }));
                }}
                className="w-full max-w-xs rounded-xl border border-[#e5d5cb] bg-[#fffdfa] px-4 py-3 text-sm text-[#684c55] outline-none focus:border-[#a87986]"
              />
            </label>

            <button
              type="button"
              onClick={() => setSelectedTable(null)}
              className="mt-6 rounded-full bg-[#805767] px-6 py-3 text-sm font-semibold text-white hover:bg-[#704958]"
            >
              Done
            </button>
          </div>
        </section>
      )}

      {/* WALKWAY CONTROL */}
      <section className="rounded-[24px] border border-[#eadccf] bg-white/90 p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl text-[#754e5c]">
              Central walkway width
            </h3>

            <p className="mt-1 text-sm text-[#8e7b74]">
              Adjust the open passage between the two guest sections.
            </p>
          </div>

          <span className="rounded-full bg-[#f8eee7] px-4 py-2 text-sm font-semibold text-[#805767]">
            {walkwayWidth} units
          </span>
        </div>

        <input
          type="range"
          min="160"
          max="280"
          value={walkwayWidth}
          onChange={(event) => setWalkwayWidth(Number(event.target.value))}
          className="mt-5 w-full accent-[#a87986]"
        />

        <p className="mt-4 text-xs leading-6 text-[#927e73]">
          This is a visual planning preview. Chair names, occupancy and table
          chair counts currently stay in this browser session; they are not
          saved to the wedding database yet.
        </p>
      </section>
    </div>
  );
}
