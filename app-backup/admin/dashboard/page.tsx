'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CheckCircle2, XCircle, Clock, UserCheck,
  Search, Download, LogOut, Edit2, Trash2, X, Mail, Phone, Calendar,
  Plus, Shield, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { FloralSpray } from '@/components/FloralDecorations';

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

interface Stats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  totalAttendees: number;
}

type FilterType = 'all' | 'attending' | 'declined';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [guests, setGuests] = useState<RSVPGuest[]>([]);
  const [allStaff, setAllStaff] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingGuest, setEditingGuest] = useState<RSVPGuest | null>(null);
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const checkAccessAndLoad = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin');
      return;
    }

    const { data: adminData } = await supabase
      .from('admin_staff')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!adminData) {
      router.push('/admin');
      return;
    }

    setAdminUser(adminData as AdminUser);
    await loadGuests();

    if (adminData.role === 'owner') {
      await loadStaff();
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    checkAccessAndLoad();
  }, [checkAccessAndLoad]);

  const loadGuests = async () => {
    const { data, error } = await supabase
      .from('rsvp_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading guests:', error);
      return;
    }

    setGuests(data as RSVPGuest[]);
  };

  const loadStaff = async () => {
    const { data, error } = await supabase
      .from('admin_staff')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading staff:', error);
      return;
    }

    setAllStaff(data as AdminUser[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  const stats: Stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.attending).length,
    declined: guests.filter((g) => !g.attending).length,
    pending: 0, // All responses are immediate; no pending state
    totalAttendees: guests
      .filter((g) => g.attending)
      .reduce((sum, g) => sum + 1 + g.num_guests, 0),
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      !search ||
      g.full_name.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.toLowerCase().includes(search.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter =
      filter === 'all' ||
      (filter === 'attending' && g.attending) ||
      (filter === 'declined' && !g.attending);

    return matchesSearch && matchesFilter;
  });

  const exportCSV = () => {
    const headers = [
      'Name', 'Phone', 'Email', 'Attending', 'Num Guests',
      'Accompanying Names', 'Dietary Requirements', 'Message',
      'Submitted At', 'Updated At',
    ];

    const rows = guests.map((g) => [
      g.full_name,
      g.phone,
      g.email || '',
      g.attending ? 'Yes' : 'No',
      g.num_guests,
      g.accompanying_names || '',
      g.dietary_requirements || '',
      g.message || '',
      new Date(g.created_at).toLocaleString(),
      new Date(g.updated_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wedding-guests-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateGuest = async (updated: Partial<RSVPGuest>) => {
    if (!editingGuest) return;
    setActionLoading(true);

    const { error } = await supabase
      .from('rsvp_responses')
      .update({
        full_name: updated.full_name,
        phone: updated.phone,
        email: updated.email,
        attending: updated.attending,
        num_guests: updated.num_guests,
        accompanying_names: updated.accompanying_names,
        dietary_requirements: updated.dietary_requirements,
        message: updated.message,
      })
      .eq('id', editingGuest.id);

    if (error) {
      setStaffError('Failed to update guest response.');
      setActionLoading(false);
      return;
    }

    setStaffError(null);
    setEditingGuest(null);
    setActionLoading(false);
    await loadGuests();
  };

  const handleDeleteGuest = async (guest: RSVPGuest) => {
    if (!confirm(`Remove ${guest.full_name}'s response? This cannot be undone.`)) return;

    const { error } = await supabase
      .from('rsvp_responses')
      .delete()
      .eq('id', guest.id);

    if (error) {
      setStaffError('Failed to remove guest.');
      return;
    }

    await loadGuests();
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStaffError(null);
    setStaffSuccess(null);

    try {
      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newStaffEmail,
        password: newStaffPassword,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // Add to admin_staff
      const { error: staffError2 } = await supabase
        .from('admin_staff')
        .insert({
          user_id: authData.user.id,
          email: newStaffEmail,
          full_name: newStaffName,
          role: 'staff',
        });

      if (staffError2) throw staffError2;

      setStaffSuccess(`${newStaffName} has been added as an admin staff member.`);
      setNewStaffEmail('');
      setNewStaffName('');
      setNewStaffPassword('');
      await loadStaff();
    } catch (err: any) {
      setStaffError(err?.message || 'Failed to add staff member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveStaff = async (staff: AdminUser) => {
    if (staff.role === 'owner') {
      setStaffError('Cannot remove the owner account.');
      return;
    }
    if (!confirm(`Remove ${staff.full_name} from admin staff?`)) return;

    const { error } = await supabase
      .from('admin_staff')
      .delete()
      .eq('id', staff.id);

    if (error) {
      setStaffError('Failed to remove staff member.');
      return;
    }

    setStaffError(null);
    await loadStaff();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory to-blush-light/30">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-ivory/90 backdrop-blur-md border-b border-blush-deep/15">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blush-deep/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-blush-deep" />
            </div>
            <div>
              <h1 className="font-serif-display text-xl text-ink">Wedding Dashboard</h1>
              <p className="font-body text-xs text-ink-light">
                Betslot &amp; Amanuel · {adminUser?.full_name}
                {adminUser?.role === 'owner' && ' · Owner'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {adminUser?.role === 'owner' && (
              <button
                onClick={() => setShowStaffPanel(!showStaffPanel)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blush-light border border-blush-deep/20 text-blush-deep font-body text-xs hover:bg-blush-deep/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Staff
              </button>
            )}
            <a
              href="/"
              className="px-3 py-2 rounded-lg bg-ivory border border-blush-deep/20 text-ink font-body text-xs hover:bg-blush-light/50 transition-colors"
            >
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ivory border border-blush-deep/20 text-ink font-body text-xs hover:bg-blush-light/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Responses" value={stats.total} color="blush" />
          <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Confirmed" value={stats.confirmed} color="green" />
          <StatCard icon={<XCircle className="w-5 h-5" />} label="Declined" value={stats.declined} color="red" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats.pending} color="amber" />
          <StatCard icon={<UserCheck className="w-5 h-5" />} label="Expected Attendees" value={stats.totalAttendees} color="blue" />
        </div>

        {/* Staff Management Panel */}
        <AnimatePresence>
          {showStaffPanel && adminUser?.role === 'owner' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-ivory rounded-2xl border border-gold/20 p-6 shadow-sm">
                <h2 className="font-serif-display text-xl text-ink mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blush-deep" />
                  Admin Staff Management
                </h2>

                {/* Add staff form */}
                <form onSubmit={handleAddStaff} className="grid md:grid-cols-4 gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    required
                    className="rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    required
                    className="rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20"
                  />
                  <input
                    type="password"
                    placeholder="Temporary password"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-blush-deep text-ivory font-body text-sm py-2 disabled:opacity-50 hover:bg-blush-deep/85 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Staff
                  </button>
                </form>

                {staffError && (
                  <p className="font-body text-sm text-red-600 mb-3">{staffError}</p>
                )}
                {staffSuccess && (
                  <p className="font-body text-sm text-green-600 mb-3">{staffSuccess}</p>
                )}

                {/* Staff list */}
                <div className="space-y-2">
                  {allStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between bg-blush-light/40 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="font-body text-sm text-ink">{staff.full_name}</p>
                        <p className="font-body text-xs text-ink-light">{staff.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-body px-2 py-1 rounded-full ${
                          staff.role === 'owner'
                            ? 'bg-gold/20 text-gold'
                            : 'bg-blush-deep/10 text-blush-deep'
                        }`}>
                          {staff.role}
                        </span>
                        {staff.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveStaff(staff)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest List */}
        <div className="bg-ivory rounded-2xl border border-gold/20 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="font-serif-display text-xl text-ink">Guest List</h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-ink-light absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-blush-deep/25 bg-ivory pl-9 pr-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20 w-full md:w-56"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="appearance-none rounded-lg border border-blush-deep/25 bg-ivory pl-3 pr-8 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20 cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="attending">Attending</option>
                  <option value="declined">Declined</option>
                </select>
                <ChevronDown className="w-4 h-4 text-ink-light absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Export CSV */}
              <button
                onClick={exportCSV}
                disabled={guests.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blush-deep text-ivory font-body text-sm disabled:opacity-50 hover:bg-blush-deep/85 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-blush-deep/30 mx-auto mb-3" />
              <p className="font-body text-sm text-ink-light">
                {guests.length === 0
                  ? 'No RSVP responses yet. Responses will appear here once guests submit them.'
                  : 'No guests match your search.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blush-deep/15">
                    <th className="text-left font-body text-xs uppercase tracking-wider text-ink-light py-3 px-2">Name</th>
                    <th className="text-left font-body text-xs uppercase tracking-wider text-ink-light py-3 px-2 hidden md:table-cell">Contact</th>
                    <th className="text-left font-body text-xs uppercase tracking-wider text-ink-light py-3 px-2">Status</th>
                    <th className="text-left font-body text-xs uppercase tracking-wider text-ink-light py-3 px-2 hidden md:table-cell">Guests</th>
                    <th className="text-left font-body text-xs uppercase tracking-wider text-ink-light py-3 px-2 hidden lg:table-cell">Dietary</th>
                    <th className="text-left font-body text-xs uppercase tracking-wider text-ink-light py-3 px-2 hidden lg:table-cell">Submitted</th>
                    <th className="text-right font-body text-xs uppercase tracking-wider text-ink-light py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => (
                    <tr key={guest.id} className="border-b border-blush-deep/8 hover:bg-blush-light/20 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-body text-sm text-ink font-medium">{guest.full_name}</p>
                        {guest.message && (
                          <p className="font-body text-xs text-ink-light italic mt-0.5 max-w-xs truncate">
                            &ldquo;{guest.message}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-body text-xs text-ink-light flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {guest.phone}
                          </span>
                          {guest.email && (
                            <span className="font-body text-xs text-ink-light flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {guest.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-body ${
                          guest.attending
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {guest.attending ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {guest.attending ? 'Attending' : 'Declined'}
                        </span>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell">
                        <span className="font-body text-sm text-ink">
                          {guest.attending ? `${1 + guest.num_guests} total` : '—'}
                        </span>
                        {guest.accompanying_names && (
                          <p className="font-body text-xs text-ink-light mt-0.5 max-w-xs truncate">
                            {guest.accompanying_names}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <span className="font-body text-xs text-ink-light">
                          {guest.dietary_requirements || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <span className="font-body text-xs text-ink-light flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(guest.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingGuest(guest)}
                            className="p-1.5 rounded-lg text-blush-deep hover:bg-blush-deep/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
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
        </div>
      </div>

      {/* Edit Guest Modal */}
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
  color: 'blush' | 'green' | 'red' | 'amber' | 'blue';
}) {
  const colorMap = {
    blush: 'bg-blush-deep/10 text-blush-deep',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-ivory rounded-2xl border border-gold/20 p-4 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="font-serif-display text-3xl text-ink">{value}</p>
      <p className="font-body text-xs text-ink-light mt-1">{label}</p>
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
    email: guest.email || '',
    attending: guest.attending,
    num_guests: guest.num_guests,
    accompanying_names: guest.accompanying_names || '',
    dietary_requirements: guest.dietary_requirements || '',
    message: guest.message || '',
  });

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
        onClick={(e) => e.stopPropagation()}
        className="bg-ivory rounded-2xl border border-gold/30 shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif-display text-xl text-ink">Edit Guest Response</h3>
          <button onClick={onClose} className="text-ink-light hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-body text-sm text-ink mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-sm text-ink mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20"
              />
            </div>
            <div>
              <label className="block font-body text-sm text-ink mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-body text-sm text-ink mb-1">Attending</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: true })}
                className={`py-2 rounded-lg font-body text-sm border-2 transition-all ${
                  formData.attending
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-ivory text-ink border-blush-deep/20'
                }`}
              >
                Attending
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, attending: false })}
                className={`py-2 rounded-lg font-body text-sm border-2 transition-all ${
                  !formData.attending
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-ivory text-ink border-blush-deep/20'
                }`}
              >
                Not Attending
              </button>
            </div>
          </div>

          <div>
            <label className="block font-body text-sm text-ink mb-1">Number of Guests</label>
            <input
              type="number"
              min="0"
              max="10"
              value={formData.num_guests}
              onChange={(e) => setFormData({ ...formData, num_guests: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20"
            />
          </div>

          <div>
            <label className="block font-body text-sm text-ink mb-1">Accompanying Names</label>
            <textarea
              value={formData.accompanying_names}
              onChange={(e) => setFormData({ ...formData, accompanying_names: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20 resize-none"
            />
          </div>

          <div>
            <label className="block font-body text-sm text-ink mb-1">Dietary Requirements</label>
            <input
              type="text"
              value={formData.dietary_requirements}
              onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
              className="w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20"
            />
          </div>

          <div>
            <label className="block font-body text-sm text-ink mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-blush-deep/25 bg-ivory px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blush-deep/20 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-blush-deep/25 text-ink font-body text-sm hover:bg-blush-light/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-blush-deep text-ivory font-body text-sm disabled:opacity-50 hover:bg-blush-deep/85 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
