
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Section =
  | "couple"
  | "bride"
  | "bridesmaids"
  | "groom"
  | "groomsmen";

type SeatingTable = {
  key: string;
  name: string;
  section: Section;
  row: number;
  seatCount: number;
  sortOrder: number;
};

type Assignment = {
  seatKey: string;
  tableKey: string;
  seatNumber: number;
  guestId: string | null;
  guestName: string;
  guestType: "registered" | "manual";
};

type Guest = {
  id: string;
  full_name: string;
  status: string;
};

const sectionLabels: Record<Section, string> = {
  couple: "Couple's Head Table",
  bride: "Bride's Family & Friends",
  bridesmaids: "Bridesmaids",
  groom: "Groom's Family & Friends",
  groomsmen: "Groomsmen",
};

const sectionOptions: Section[] = [
  "couple",
  "bride",
  "bridesmaids",
  "groom",
  "groomsmen",
];

async function seatingRequest(
  method: "GET" | "PUT",
  body?: unknown
) {
  const response = await fetch("/api/admin/seating", {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "The seating request failed.");
  }

  return result;
}

function makeSeatKey(tableKey: string, seatNumber: number) {
  return `${tableKey}:${seatNumber}`;
}

export default function SeatingManagementPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  const [newName, setNewName] = useState("");
  const [newSection, setNewSection] = useState<Section>("bride");
  const [newRow, setNewRow] = useState(1);
  const [newSeatCount, setNewSeatCount] = useState(10);

  const [selectedSeat, setSelectedSeat] = useState<{
    tableKey: string;
    seatNumber: number;
  } | null>(null);

  const [guestSearch, setGuestSearch] = useState("");
  const [manualName, setManualName] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        router.replace("/admin");
        return;
      }

      const data = await seatingRequest("GET");

      setTables(
        data.tables.length
          ? data.tables
          : [
              {
                key: "couple-head-table",
                name: "Couple's Head Table",
                section: "couple",
                row: 0,
                seatCount: 2,
                sortOrder: 0,
              },
            ]
      );

      setAssignments(data.assignments || []);
      setGuests(data.guests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load seating."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const capacity = useMemo(
    () => tables.reduce((sum, table) => sum + table.seatCount, 0),
    [tables]
  );

  const registeredCount = assignments.filter(
    (item) => item.guestType === "registered"
  ).length;

  const manualCount = assignments.filter(
    (item) => item.guestType === "manual"
  ).length;

  const updateTable = (
    key: string,
    changes: Partial<SeatingTable>
  ) => {
    setTables((previous) =>
      previous.map((table) =>
        table.key === key ? { ...table, ...changes } : table
      )
    );
  };

  const addTable = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const key =
      globalThis.crypto?.randomUUID?.() ??
      `table-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    setTables((previous) => [
      ...previous,
      {
        key,
        name: newName.trim() || `${sectionLabels[newSection]} Table`,
        section: newSection,
        row: newRow,
        seatCount: newSeatCount,
        sortOrder: previous.length,
      },
    ]);

    setNewName("");
    setSuccess("");
  };

  const deleteTable = (key: string) => {
    if (!window.confirm("Delete this table and all its seat assignments?")) {
      return;
    }

    setTables((previous) => previous.filter((table) => table.key !== key));
    setAssignments((previous) =>
      previous.filter((assignment) => assignment.tableKey !== key)
    );

    if (selectedSeat?.tableKey === key) {
      setSelectedSeat(null);
    }
  };

  const openSeat = (tableKey: string, seatNumber: number) => {
    setSelectedSeat({ tableKey, seatNumber });
    setGuestSearch("");
    setManualName("");
  };

  const selectedSeatKey = selectedSeat
    ? makeSeatKey(selectedSeat.tableKey, selectedSeat.seatNumber)
    : "";

  const selectedAssignment = assignments.find(
    (item) => item.seatKey === selectedSeatKey
  );

  const assignRegisteredGuest = (guest: Guest) => {
    if (!selectedSeat) return;

    const seatKey = makeSeatKey(
      selectedSeat.tableKey,
      selectedSeat.seatNumber
    );

    setAssignments((previous) => [
      ...previous.filter(
        (item) =>
          item.seatKey !== seatKey && item.guestId !== guest.id
      ),
      {
        seatKey,
        tableKey: selectedSeat.tableKey,
        seatNumber: selectedSeat.seatNumber,
        guestId: guest.id,
        guestName: guest.full_name,
        guestType: "registered",
      },
    ]);

    setSelectedSeat(null);
  };

  const assignManualGuest = () => {
    if (!selectedSeat || !manualName.trim()) return;

    const seatKey = makeSeatKey(
      selectedSeat.tableKey,
      selectedSeat.seatNumber
    );

    setAssignments((previous) => [
      ...previous.filter((item) => item.seatKey !== seatKey),
      {
        seatKey,
        tableKey: selectedSeat.tableKey,
        seatNumber: selectedSeat.seatNumber,
        guestId: null,
        guestName: manualName.trim(),
        guestType: "manual",
      },
    ]);

    setSelectedSeat(null);
  };

  const removeAssignment = () => {
    if (!selectedSeat) return;

    setAssignments((previous) =>
      previous.filter((item) => item.seatKey !== selectedSeatKey)
    );

    setSelectedSeat(null);
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await seatingRequest("PUT", {
        tables,
        assignments,
      });

      setSuccess(
        `Saved successfully: ${result.tables} tables and ${result.assignments} assigned seats.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save seating."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredGuests = guests
    .filter((guest) =>
      guest.full_name.toLowerCase().includes(guestSearch.toLowerCase())
    )
    .filter(
      (guest) =>
        !assignments.some(
          (assignment) =>
            assignment.guestId === guest.id &&
            assignment.seatKey !== selectedSeatKey
        )
    )
    .slice(0, 30);

  const renderSection = (section: Section) => {
    const sectionTables = tables
      .filter((table) => table.section === section)
      .sort(
        (a, b) =>
          a.row - b.row || a.sortOrder - b.sortOrder
      );

    const rows = [...new Set(sectionTables.map((table) => table.row))].sort(
      (a, b) => a - b
    );

    return (
      <section
        key={section}
        className="mb-6 rounded-2xl border border-[#c7a66a]/30 bg-white/80 p-4 shadow-sm"
      >
        <h2 className="mb-4 font-serif text-xl text-[#765344]">
          {sectionLabels[section]}
        </h2>

        {sectionTables.length === 0 ? (
          <p className="text-sm text-stone-500">
            No tables in this section yet.
          </p>
        ) : (
          rows.map((rowNumber) => (
            <div key={rowNumber} className="mb-5 last:mb-0">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#9b806b]">
                {rowNumber === 0 ? "Front Row" : `Row ${rowNumber}`}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {sectionTables
                  .filter((table) => table.row === rowNumber)
                  .map((table) => (
                    <div
                      key={table.key}
                      className="rounded-xl border border-[#e5d7c7] bg-[#fffdf9] p-3"
                    >
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        <label className="col-span-2 text-xs text-stone-600">
                          Table name
                          <input
                            value={table.name}
                            onChange={(event) =>
                              updateTable(table.key, {
                                name: event.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm"
                          />
                        </label>

                        <label className="text-xs text-stone-600">
                          Section
                          <select
                            value={table.section}
                            onChange={(event) =>
                              updateTable(table.key, {
                                section: event.target.value as Section,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs"
                          >
                            {sectionOptions.map((option) => (
                              <option key={option} value={option}>
                                {sectionLabels[option]}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="text-xs text-stone-600">
                          Row
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            value={table.row}
                            onChange={(event) =>
                              updateTable(table.key, {
                                row: Math.max(
                                  0,
                                  Number(event.target.value) || 0
                                ),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs"
                          />
                        </label>

                        <label className="text-xs text-stone-600">
                          Chairs
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={table.seatCount}
                            onChange={(event) =>
                              updateTable(table.key, {
                                seatCount: Math.max(
                                  1,
                                  Math.min(
                                    30,
                                    Number(event.target.value) || 1
                                  )
                                ),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-2 text-xs"
                          />
                        </label>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => deleteTable(table.key)}
                            className="w-full rounded-lg border border-red-200 px-2 py-2 text-xs text-red-600 hover:bg-red-50"
                          >
                            Delete table
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {Array.from(
                          { length: table.seatCount },
                          (_, index) => {
                            const number = index + 1;
                            const seatKey = makeSeatKey(table.key, number);
                            const assignment = assignments.find(
                              (item) => item.seatKey === seatKey
                            );

                            const seatClass = !assignment
                              ? "border-stone-300 bg-stone-100 text-stone-600 hover:bg-stone-200"
                              : assignment.guestType === "registered"
                                ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                                : "border-red-400 bg-red-100 text-red-800";

                            return (
                              <button
                                key={seatKey}
                                type="button"
                                onClick={() => openSeat(table.key, number)}
                                aria-label={
                                  assignment
                                    ? `Seat ${number}: ${assignment.guestName}`
                                    : `Empty seat ${number}`
                                }
                                className={`group relative flex h-10 items-center justify-center rounded-full border text-xs font-semibold transition ${seatClass}`}
                              >
                                {number}

                                {assignment && (
                                  <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 max-w-48 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                    {assignment.guestName}
                                  </span>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </section>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[#765344]">
        Loading seating management...
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#a08060]">
            Wedding Administration
          </p>
          <h1 className="font-serif text-3xl text-[#765344]">
            Seating Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Organize the couple's head table, family seating, bridal party,
            and guest assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[#8d655c] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#765344] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Seating Plan"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total Chairs", capacity],
          ["Assigned Seats", assignments.length],
          ["Registered Guests", registeredCount],
          ["Manual Names", manualCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-[#c7a66a]/30 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-stone-500">{label}</p>
            <p className="mt-1 font-serif text-2xl text-[#765344]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="mb-6 rounded-2xl border border-[#c7a66a]/30 bg-white p-4 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-[#9b806b]">
          Front of Venue
        </p>
        <div className="mx-auto mt-3 max-w-xl rounded-xl bg-[#e8d8c7] px-5 py-4">
          <p className="font-serif text-xl text-[#765344]">
            WEDDING STAGE
          </p>
          <p className="text-xs text-[#765344]">
            Ceremony stage
          </p>
        </div>
        <div className="mx-auto mt-3 max-w-md rounded-xl border-2 border-[#c7a66a] bg-[#fffaf0] px-5 py-3">
          <p className="font-serif text-lg text-[#765344]">
            Couple's Head Table
          </p>
          <p className="text-xs text-stone-500">
            Positioned at the front center
          </p>
        </div>
      </section>

      <form
        onSubmit={addTable}
        className="mb-6 rounded-2xl border border-[#c7a66a]/30 bg-white p-4 shadow-sm"
      >
        <h2 className="mb-4 font-serif text-xl text-[#765344]">
          Add a Seating Table
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Table name (optional)"
            className="rounded-lg border border-stone-200 px-3 py-3 text-sm"
          />

          <select
            value={newSection}
            onChange={(event) =>
              setNewSection(event.target.value as Section)
            }
            className="rounded-lg border border-stone-200 px-3 py-3 text-sm"
          >
            {sectionOptions.map((option) => (
              <option key={option} value={option}>
                {sectionLabels[option]}
              </option>
            ))}
          </select>

          <label className="text-xs text-stone-600">
            Row number
            <input
              type="number"
              min="0"
              value={newRow}
              onChange={(event) =>
                setNewRow(Math.max(0, Number(event.target.value) || 0))
              }
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs text-stone-600">
            Chairs per table
            <input
              type="number"
              min="1"
              max="30"
              value={newSeatCount}
              onChange={(event) =>
                setNewSeatCount(
                  Math.max(1, Math.min(30, Number(event.target.value) || 1))
                )
              }
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-[#8d655c] px-4 py-3 text-sm font-semibold text-white hover:bg-[#765344]"
          >
            Add Table
          </button>
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Add multiple tables to the same row to create rows of 6, 8, or
          any number of tables. Each table can have its own chair count.
        </p>
      </form>

      {renderSection("couple")}

      <div className="mb-3 grid grid-cols-1 gap-2 text-center xl:grid-cols-[1fr_90px_1fr]">
        <div className="rounded-lg bg-[#f5e7e2] px-3 py-2 text-sm font-semibold text-[#765344]">
          Bride's Side
        </div>
        <div className="flex items-center justify-center rounded-lg bg-stone-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
          Central Aisle
        </div>
        <div className="rounded-lg bg-[#e9edf2] px-3 py-2 text-sm font-semibold text-[#536578]">
          Groom's Side
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_90px_1fr]">
        <div>
          {renderSection("bride")}
          {renderSection("bridesmaids")}
        </div>

        <div className="hidden items-stretch justify-center xl:flex">
          <div className="w-full rounded-xl border border-dashed border-stone-300 bg-stone-50/70" />
        </div>

        <div>
          {renderSection("groom")}
          {renderSection("groomsmen")}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-4 rounded-xl border border-stone-200 bg-white p-4 text-xs">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border border-emerald-500 bg-emerald-100" />
          Registered guest
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border border-red-400 bg-red-100" />
          Manually entered name
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border border-stone-300 bg-stone-100" />
          Empty seat
        </span>
      </div>

      {selectedSeat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="seat-assignment-title"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#fffaf5] p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  id="seat-assignment-title"
                  className="font-serif text-2xl text-[#765344]"
                >
                  Assign a Guest
                </h2>
                <p className="text-xs text-stone-500">
                  Seat {selectedSeat.seatNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSeat(null)}
                className="rounded-full border border-stone-300 px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            {selectedAssignment && (
              <div className="mb-4 rounded-lg border border-stone-200 bg-white p-3">
                <p className="text-xs text-stone-500">Currently assigned</p>
                <p className="font-semibold text-[#765344]">
                  {selectedAssignment.guestName}
                </p>
                <button
                  type="button"
                  onClick={removeAssignment}
                  className="mt-2 text-xs text-red-600 underline"
                >
                  Remove this assignment
                </button>
              </div>
            )}

            <label className="block text-sm font-medium text-[#765344]">
              Search registered guests
              <input
                value={guestSearch}
                onChange={(event) => setGuestSearch(event.target.value)}
                placeholder="Search by first or last name..."
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-sm"
              />
            </label>

            <div className="mt-3 max-h-52 overflow-y-auto rounded-lg border border-stone-200 bg-white">
              {filteredGuests.length === 0 ? (
                <p className="p-4 text-sm text-stone-500">
                  No matching available registered guests.
                </p>
              ) : (
                filteredGuests.map((guest) => (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => assignRegisteredGuest(guest)}
                    className="block w-full border-b border-stone-100 px-4 py-3 text-left text-sm hover:bg-emerald-50"
                  >
                    <span className="block font-medium text-stone-800">
                      {guest.full_name}
                    </span>
                    <span className="text-xs text-emerald-700">
                      Registered guest
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="my-5 border-t border-stone-200" />

            <label className="block text-sm font-medium text-[#765344]">
              Or enter a manual guest name
              <input
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
                placeholder="Enter guest's full name"
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-sm"
              />
            </label>

            <button
              type="button"
              onClick={assignManualGuest}
              disabled={!manualName.trim()}
              className="mt-3 w-full rounded-lg bg-[#8d655c] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Assign Manual Guest
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
