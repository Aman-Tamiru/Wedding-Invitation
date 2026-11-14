"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, CheckCircle2, XCircle, Clock, UserCheck,
  Search, Download, LogOut, Edit2, Trash2, X, Mail, Phone, Calendar,
  Plus, Shield, ChevronDown,
} from "lucide-react";

interface RSVPGuest {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  attending: boolean;
  num_guests: number;
  accompanying_names: string | null;
  dietary_requirements: string | null;
  message: string | null;
  edit_token: string;
  created_at: string;
  updated_at: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

type FilterType = "all" | "attending" | "declined";

async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "The request could not be completed.");
  }

  return result;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [guests, setGuests] = useState<RSVPGuest[]>([]);
  const [allStaff, setAllStaff] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingGuest, setEditingGuest] = useState<RSVPGuest | null>(null);
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    const me = await apiRequest("/api/admin/me");

    if (!me.authenticated) {
      router.replace("/admin");
      return;
    }

    setAdminUser({
      id: "",
      user_id: "",
      email: "",
      full_name: me.admin.full_name,
      role: me.admin.role,
    });

    const data = await apiRequest("/api/admin/dashboard");

    setGuests(data.guests);
    setAllStaff(data.staff || []);
  }, [router]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        await loadDashboard();
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
        if (active) {
          setPageError(
            error instanceof Error ? error.message : "Unable to load dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [loadDashboard]);

  const refreshGuests = async () => {
    const data = await apiRequest("/api/admin/dashboard");
    setGuests(data.guests);
    setAllStaff(data.staff || []);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin");
    }
  };

  const stats = {
    total: guests.length,
    confirmed: guests.filter((guest) => guest.attending).length,
    declined: guests.filter((guest) => !guest.attending).length,
    pending: 0,
    totalAttendees: guests
      .filter((guest) => guest.attending)
      .reduce((sum, guest) => sum + 1 + guest.num_guests, 0),
  };

  const filteredGuests = guests.filter((guest) => {
    const term = search.toLowerCase();

    const matchesSearch =
      !term ||
      guest.full_name.toLowerCase().includes(term) ||
      guest.phone.toLowerCase().includes(term) ||
      (guest.email || "").toLowerCase().includes(term);

    const matchesFilter =
      filter === "all" ||
      (filter === "attending" && guest.attending) ||
      (filter === "declined" && !guest.attending);

    return matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    const headers = [
      "Name", "Phone", "Email", "Attending", "Num Guests",
      "Accompanying Names", "Dietary Requirements", "Message",
      "Submitted At", "Updated At",
    ];

    const rows = guests.map((guest) => [
      guest.full_name,
      guest.phone,
      guest.email || "",
      guest.attending ? "Yes" : "No",
      guest.num_guests,
      guest.accompanying_names || "",
      guest.dietary_requirements || "",
      guest.message || "",
      new Date(guest.created_at).toLocaleString(),
      new Date(guest.updated_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `wedding-guests-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleUpdateGuest = async (updated: Partial<RSVPGuest>) => {
    if (!editingGuest) return;

    setActionLoading(true);
    setStaffError(null);

    try {
      await apiRequest("/api/admin/dashboard", {
        method: "PATCH",
        body: JSON.stringify({ id: editingGuest.id, ...updated }),
      });

      setEditingGuest(null);
      await refreshGuests();
    } catch (error) {
      setStaffError(
        error instanceof Error ? error.message : "Failed to update guest."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGuest = async (guest: RSVPGuest) => {
    if (!confirm(`Remove ${guest.full_name}'s response? This cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest("/api/admin/dashboard", {
        method: "POST",
        body: JSON.stringify({ action: "delete_guest", id: guest.id }),
      });
      await refreshGuests();
    } catch (error) {
      setStaffError(
        error instanceof Error ? error.message : "Failed to remove guest."
      );
    }
  };

  const handleAddStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionLoading(true);
    setStaffError(null);
    setStaffSuccess(null);

    try {
      await apiRequest("/api/admin/dashboard", {
        method: "POST",
        body: JSON.stringify({
          action: "add_staff",
          email: newStaffEmail,
          full_name: newStaffName,
          password: newStaffPassword,
        }),
      });

      setStaffSuccess(`${newStaffName} has been added as an admin staff member.`);
      setNewStaffEmail("");
      setNewStaffName("");
      setNewStaffPassword("");
      await refreshGuests();
    } catch (error) {
      setStaffError(
        error instanceof Error ? error.message : "Failed to add staff member."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveStaff = async (staff: AdminUser) => {
    if (staff.role === "owner") {
      setStaffError("Cannot remove the owner account.");
      return;
    }

    if (!confirm(`Remove ${staff.full_name} from admin staff?`)) return;

    setStaffError(null);

    try {
      await apiRequest("/api/admin/dashboard", {
        method: "POST",
        body: JSON.stringify({
          action: "remove_staff",
          id: staff.id,
          user_id: staff.user_id,
        }),
      });
      await refreshGuests();
    } catch (error) {
      setStaffError(
        error instanceof Error ? error.message : "Failed to remove staff member."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blush-deep border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-body text-sm text-ink-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory p-6">
        <div className="max-w-md text-center">
          <p className="font-serif-display text-2xl text-ink mb-3">
            Dashboard unavailable
          </p>
          <p className="font-body text-sm text-red-600 mb-5">{pageError}</p>
          <button
            onClick={() => router.replace("/admin")}
            className="rounded-full bg-blush-deep text-ivory px-6 py-3"
          >
            Return to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory to-blush-light/30">
      <header className="sticky top-0 z-20 bg-ivory/90 backdrop-blur-md border-b border-blush-deep/15">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blush-deep/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-blush-deep" />
            </div>
            <div>
              <h1 className="font-serif-display text-xl text-ink">Wedding Dashboard</h1>
              <p className="font-body text-xs text-ink-light">
                Betslot &amp; Amanuel · {adminUser?.full_name}
                {adminUser?.role === "owner" && " · Owner"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminUser?.role === "owner" && (
              <button
                onClick={() => setShowStaffPanel(!showStaffPanel)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blush-light border border-blush-deep/20 text-blush-deep font-body text-xs"
              >
                <Shield className="w-4 h-4" /> Staff
              </button>
            )}
            <a
              href="/"
              className="px-3 py-2 rounded-lg bg-ivory border border-blush-deep/20 text-ink font-body text-xs"
            >
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ivory border border-blush-deep/20 text-ink font-body text-xs"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Users />} label="Total Responses" value={stats.total} color="blush" />
          <StatCard icon={<CheckCircle2 />} label="Confirmed" value={stats.confirmed} color="green" />
          <StatCard icon={<XCircle />} label="Declined" value={stats.declined} color="red" />
          <StatCard icon={<Clock />} label="Pending" value={stats.pending} color="amber" />
          <StatCard icon={<UserCheck />} label="Expected Attendees" value={stats.totalAttendees} color="blue" />
        </div>

        <AnimatePresence>
          {showStaffPanel && adminUser?.role === "owner" && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-ivory rounded-2xl border border-gold/20 p-6 shadow-sm">
                <h2 className="font-serif-display text-xl text-ink mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blush-deep" />
                  Admin Staff Management
                </h2>

                <form onSubmit={handleAddStaff} className="grid md:grid-cols-4 gap-3 mb-6">
                  <input
                    placeholder="Full name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    required
                    className="rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    required
                    className="rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Temporary password (8+ characters)"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    required
                    minLength={8}
                    className="rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-blush-deep text-ivory text-sm py-2 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" /> Add Staff
                  </button>
                </form>

                {staffError && <p className="text-sm text-red-600 mb-3">{staffError}</p>}
                {staffSuccess && <p className="text-sm text-green-600 mb-3">{staffSuccess}</p>}

                <div className="space-y-2">
                  {allStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between bg-blush-light/40 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm text-ink">{staff.full_name}</p>
                        <p className="text-xs text-ink-light">{staff.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          staff.role === "owner"
                            ? "bg-gold/20 text-gold"
                            : "bg-blush-deep/10 text-blush-deep"
                        }`}>
                          {staff.role}
                        </span>
                        {staff.role !== "owner" && (
                          <button
                            onClick={() => handleRemoveStaff(staff)}
                            className="text-red-400 hover:text-red-600"
                            aria-label={`Remove ${staff.full_name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="bg-ivory rounded-2xl border border-gold/20 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="font-serif-display text-xl text-ink">Guest List</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-ink-light absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  placeholder="Search guests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-blush-deep/25 bg-ivory pl-9 pr-3 py-2 text-sm w-full md:w-56"
                />
              </div>

              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="appearance-none rounded-lg border border-blush-deep/25 bg-ivory pl-3 pr-8 py-2 text-sm"
                >
                  <option value="all">All</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={exportCSV}
                disabled={!guests.length}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blush-deep text-ivory text-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-blush-deep/30 mx-auto mb-3" />
              <p className="text-sm text-ink-light">
                {guests.length === 0
                  ? "No RSVP responses yet. Responses will appear here once guests submit them."
                  : "No guests match your search."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blush-deep/15">
                    {["Name", "Contact", "Status", "Guests", "Dietary", "Submitted", "Actions"].map((heading, index) => (
                      <th
                        key={heading}
                        className={`text-left text-xs uppercase tracking-wider text-ink-light py-3 px-2 ${
                          (index === 1 || index === 3) ? "hidden md:table-cell" : ""
                        } ${index === 4 || index === 5 ? "hidden lg:table-cell" : ""} ${
                          index === 6 ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="border-b border-blush-deep/8 hover:bg-blush-light/20">
                      <td className="py-3 px-2">
                        <p className="text-sm text-ink font-medium">{guest.full_name}</p>
                        {guest.message && (
                          <p className="text-xs text-ink-light italic mt-0.5 max-w-xs truncate">
                            “{guest.message}”
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <div className="flex flex-col gap-0.5 text-xs text-ink-light">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{guest.phone}</span>
                          {guest.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{guest.email}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          guest.attending ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {guest.attending ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {guest.attending ? "Attending" : "Declined"}
                        </span>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <span className="text-sm text-ink">
                          {guest.attending ? `${1 + guest.num_guests} total` : "—"}
                        </span>
                        {guest.accompanying_names && (
                          <p className="text-xs text-ink-light mt-0.5 max-w-xs truncate">{guest.accompanying_names}</p>
                        )}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell text-xs text-ink-light">
                        {guest.dietary_requirements || "—"}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell text-xs text-ink-light">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(guest.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingGuest(guest)}
                            className="p-1.5 rounded-lg text-blush-deep hover:bg-blush-deep/10"
                            aria-label={`Edit ${guest.full_name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
                            aria-label={`Delete ${guest.full_name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {editingGuest && (
          <EditGuestModal
            guest={editingGuest}
            onSave={handleUpdateGuest}
            onClose={() => setEditingGuest(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blush" | "green" | "red" | "amber" | "blue";
}) {
  const colors = {
    blush: "bg-blush-deep/10 text-blush-deep",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-ivory rounded-2xl border border-gold/20 p-4 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="font-serif-display text-3xl text-ink">{value}</p>
      <p className="text-xs text-ink-light mt-1">{label}</p>
    </motion.div>
  );
}

function EditGuestModal({
  guest, onSave, onClose, loading,
}: {
  guest: RSVPGuest;
  onSave: (updated: Partial<RSVPGuest>) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    full_name: guest.full_name,
    phone: guest.phone,
    email: guest.email || "",
    attending: guest.attending,
    num_guests: guest.num_guests,
    accompanying_names: guest.accompanying_names || "",
    dietary_requirements: guest.dietary_requirements || "",
    message: guest.message || "",
  });

  const update = (field: keyof typeof formData, value: string | boolean | number) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(event) => event.stopPropagation()}
        className="bg-ivory rounded-2xl border border-gold/30 shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif-display text-xl text-ink">Edit Guest Response</h3>
          <button onClick={onClose} className="text-ink-light hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-ink">
            Full Name
            <input
              value={formData.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              className="mt-1 w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-ink">
              Phone
              <input
                value={formData.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-1 w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2"
              />
            </label>
            <label className="block text-sm text-ink">
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                className="mt-1 w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2"
              />
            </label>
          </div>

          <div>
            <p className="text-sm text-ink mb-2">Attending</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => update("attending", true)}
                className={`py-2 rounded-lg border-2 text-sm ${
                  formData.attending ? "bg-green-100 text-green-700 border-green-300" : "border-blush-deep/20"
                }`}
              >
                Attending
              </button>
              <button
                type="button"
                onClick={() => update("attending", false)}
                className={`py-2 rounded-lg border-2 text-sm ${
                  !formData.attending ? "bg-red-100 text-red-700 border-red-300" : "border-blush-deep/20"
                }`}
              >
                Not Attending
              </button>
            </div>
          </div>

          <label className="block text-sm text-ink">
            Number of Guests
            <input
              type="number"
              min="0"
              max="10"
              value={formData.num_guests}
              onChange={(e) => update("num_guests", Math.max(0, Math.min(10, Number(e.target.value) || 0)))}
              className="mt-1 w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2"
            />
          </label>

          <label className="block text-sm text-ink">
            Accompanying Names
            <textarea
              rows={2}
              value={formData.accompanying_names}
              onChange={(e) => update("accompanying_names", e.target.value)}
              className="mt-1 w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 resize-none"
            />
          </label>

          <label className="block text-sm text-ink">
            Dietary Requirements
            <input
              value={formData.dietary_requirements}
              onChange={(e) => update("dietary_requirements", e.target.value)}
              className="mt-1 w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2"
            />
          </label>

          <label className="block text-sm text-ink">
            Message
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => update("message", e.target.value)}
              className="mt-1 w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 resize-none"
            />
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-blush-deep/25 text-ink text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-blush-deep text-ivory text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}