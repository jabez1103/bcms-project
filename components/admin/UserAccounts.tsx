"use client";
import { useState, useEffect, useMemo } from "react";
import { SkeletonUserHeader, SkeletonUserRow, SkeletonMobileCard } from "@/components/ui/Skeleton";


type User = {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  account_status: string;
  profile_picture: string;
  program: string;
  year_level: string;
  department: string;
};

const emptyForm = {
  user_id: 0,
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "student",
  account_status: "active",
  profile_picture: "",
  program: "BSCS",
  year_level: "1",
  department: "Registrar",
};

/* ================= HELPERS ================= */

function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}
/*
function isBisuEmail(email: string) {
  return email.toLowerCase().endsWith("@bisu.edu.ph"); // need to change into auto generated email (e.g., James Kyle Degnamo -> jameskyle.degamo@bisu.edu.ph)
} */

function defaultPassword(lastName: string, userId: string) {
  if (!lastName || !userId) return "";
  const setDefaultPaswword = lastName.replaceAll(" ", "");
  return `${lastName}${userId}`
}

const PROGRAMS: Record<string, { label: string; years: number }> = {
  BSIT:     { label: "BS Information Technology", years: 4 },
  BSCS:     { label: "BS Computer Science",        years: 4 },
  BSES:     { label: "BS Environmental Science",   years: 4 },
  BEED:     { label: "Bachelor of Elementary Ed",  years: 4 },
  BEEDMATH: { label: "BEED Major in Math",          years: 4 },
  BTLED:    { label: "Bachelor of Tech-Livelihood", years: 4 },
  HM:       { label: "Hotel Management",            years: 2 },
};


const DEPARTMENTS = [
  "Registrar",
  "Library",
  "Cashier",
  "Guidance",
  "Clinic",
  "Sports Office",
  "Student Affairs",
  "Dean Office",
];

const program = Object.keys(PROGRAMS);
/* ================= COMPONENT ================= */

export default function UserAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [error, setError] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const years = PROGRAMS[form.program]?.years ?? 4;

  useEffect(() => {
    const maxYears = PROGRAMS[form.program]?.years ?? 4;

    if (Number(form.year_level) > maxYears) {
      setForm((prev: any) => ({
        ...prev,
        year_level: "1"
      }));
    }
  }, [form.program]);


  /* ================= FETCH ================= */

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ================= FILTER & PAGINATION ================= */

  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") return users;
    return users.filter((u) => u.role.toLowerCase() === roleFilter.toLowerCase());
  }, [users, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  /* ================= MODAL & FORM LOGIC ================= */

  const handleOpenModal = (user?: User) => {
    if (user) {
      setForm({ ...user });
      setEditingId(user.user_id);
    } else {
      setForm(emptyForm);
      setEditingId(null);
    }
    setError("");
    setShowModal(true);
  };

  const updateFormFields = (key: string, value: string) => {
    const newForm = { ...form, [key]: value };

    if (["first_name", "middle_name", "last_name"].includes(key)) {
      newForm[key] = capitalizeWords(value);
    }
    
    if (["first_name", "last_name", "user_id"].includes(key)) {
      // const firstName = (key === "first_name" ? value : form.first_name).trim().toLowerCase().replace(/\s+/g, "");
      // const lastName  = (key === "last_name"  ? value : form.last_name ).trim().toLowerCase().replace(/\s+/g, "");
      const cleanName = (str: string) => str.trim().toLowerCase().replace(/\s+/g, "");
      const firstName = key === "first_name" ? value: form.first_name;
      const lastName = key === "last_name" ? value: form.last_name;
      const userId = key === "user_id" ? value: form.user_id; 

      newForm.email = `${cleanName( firstName )}.${cleanName( lastName )}@bisu.edu.ph`;
      newForm.password = defaultPassword( lastName, userId );
      // newForm.profile_picture = `/avatars/${firstName}${lastName}.jpg`.toLowerCase();
      newForm.profile_picture = `/avatars/defaultAvatar.jpg`;

    }
    
    setForm(newForm);
  };

  const modifyUser = async () => {

    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PUT" : "POST";

    const payload: any = { ...form };
    if (form.role != "student") {
      delete payload.program;
      delete payload.year_level;
    }
    if (form.role != "signatory") {
      delete payload.department;
    }
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong!");
      return;
    }
    setShowModal(false);
    fetchUsers();
  };

  // NEW: Quick Deactivation Toggle (Retains historical records, blocks login)
  const toggleStatus = async (user: User) => {
    const newStatus = user.account_status === "active" ? "inactive" : "active";
    const res = await fetch(`/api/users/${user.user_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...user, account_status: newStatus }),
    });
    if (res.ok) fetchUsers();
  };

  const deleteUser = async (user_id: number) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    await fetch(`/api/users/${user_id}`, { method: "DELETE" });
    fetchUsers();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 sm:p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">

        {/*  Header + filter bar skeleton */}
        <SkeletonUserHeader />

        {/* Table container skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">

          {/* Mobile skeleton */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonMobileCard key={i} />
            ))}
          </div>

          {/* Desktop table skeleton */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                <tr>
                  {["User Table Data", "Role", "Login Access", "Actions"].map(h => (
                    <th key={h} className="px-8 py-5">
                      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonUserRow key={i} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer skeleton */}
          <div className="px-6 md:px-8 py-4 md:py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center animate-pulse">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 sm:p-6 md:p-12 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg">
              Manage student and staff roles, credentials, and system access.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 w-full md:w-fit"
          >
            <span className="text-xl">+</span> Add New Account
          </button>
        </div>

        {/* FILTER TOOLBAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8 bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto w-full no-scrollbar">
            <div className="flex min-w-full sm:min-w-0">
                {["all", "student", "signatory", "admin"].map((role) => (
                <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all whitespace-nowrap ${
                    roleFilter === role
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                >
                    {role}
                </button>
                ))}
            </div>
          </div>
          <div className="px-4 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest hidden sm:block">
            {filteredUsers.length} Users Registered
          </div>
        </div>

        {/* DATA CONTAINER */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
          
          {/* MOBILE LIST VIEW */}
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))
            ) : (
                paginatedUsers.map((u) => (
                    <div key={u.user_id} className={`p-5 space-y-4 ${u.account_status === 'inactive' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                                {u.first_name[0]}{u.last_name[0]}
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                                    {u.first_name} {u.last_name}
                                </div>
                                <div className="text-xs text-slate-400 truncate">{u.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    {u.role}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${u.account_status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                                    {u.account_status}
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => toggleStatus(u)} className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">{u.account_status === 'active' ? 'Deactivate' : 'Activate'}</button>
                                <button onClick={() => handleOpenModal(u)} className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase">Edit</button>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">User Table Data</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Login Access</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonUserRow key={i} />) : paginatedUsers.map((u) => (
                  <tr key={u.user_id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${u.account_status === 'inactive' ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${u.account_status === 'active' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'}`}>
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${u.account_status === 'active' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic'}`}>
                            {u.first_name} {u.middle_name} {u.last_name}
                          </div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => toggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${u.account_status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.account_status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {u.account_status === 'active' ? 'Enabled' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right space-x-3">
                      <button onClick={() => handleOpenModal(u)} className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline uppercase tracking-wider">Modify</button>
                      <button onClick={() => deleteUser(u.user_id)} className="text-rose-400 dark:hover:text-rose-500 font-bold text-xs hover:underline uppercase tracking-wider">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div className="px-6 md:px-8 py-4 md:py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="flex-1 sm:flex-none px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase disabled:opacity-40 transition-all hover:shadow-sm"
              >
                Prev
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="flex-1 sm:flex-none px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase disabled:opacity-40 transition-all hover:shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {editingId ? "Update Account" : "Register Account"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-light p-2">&times;</button>
            </div>

            <div className="p-6 md:p-8 space-y-5 overflow-y-auto">
              {error && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-[10px] font-bold uppercase tracking-wide">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

                {/* USER ID */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Student / Staff ID</label>
                  <input
                    type="number"
                    disabled={!!editingId}
                    value={ form.user_id || "" }
                    placeholder="Initial ID number"
                    onChange={(e) => updateFormFields("user_id", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 text-slate-800 dark:text-slate-200 outline-none transition-all disabled:opacity-60"
                  />
                </div>

                {/* FIRST NAME */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => updateFormFields("first_name", e.target.value)}
                    className="w-full border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* MIDDLE NAME */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Middle Name</label>
                  <input
                    type="text"
                    value={form.middle_name}
                    onChange={(e) => updateFormFields("middle_name", e.target.value)}
                    className="w-full border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* LAST NAME */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => updateFormFields("last_name", e.target.value)}
                    className="w-full border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* EMAIL — auto generated, readonly */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Institutional Email <span className="text-indigo-400 normal-case font-medium">(auto-generated)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold text-slate-400 dark:text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* DEFAULT PASSWORD — auto generated, readonly */}
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Default Password <span className="text-indigo-400 normal-case font-medium">(LastName + ID)</span>
                  </label>
                  <input
                    type="text"
                    value={form.password}
                    readOnly
                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold text-slate-400 dark:text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                {/* ROLE & STATUS */}
                <div className="grid grid-cols-2 md:col-span-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">User Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => {
                        setForm({ ...form, role: e.target.value });
                        setError("");
                      }}
                      className="w-full border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="student">Student</option>
                      <option value="signatory">Signatory</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Initial Status</label>
                    <select
                      value={form.account_status}
                      onChange={(e) => setForm({ ...form, account_status: e.target.value })}
                      className="w-full border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Deactivated</option>
                    </select>
                  </div>
                </div>

                {/* STUDENT FIELDS — show only when role is student */}
                {form.role === "student" && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Program</label>
                      <select
                        value={form.program}
                        onChange={(e) => updateFormFields("program", e.target.value)}
                        className="w-full border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        {Object.entries(PROGRAMS).map(([key, val]) => (
                          <option key={key} value={key}>{key} — {val.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Year Level</label>
                      <select
                        value={form.year_level}
                        onChange={(e) => setForm({ ...form, year_level: e.target.value })}
                        className="w-full border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                      >
                        {Array.from({ length: years }, (_, i) => {
                          const value = String(i + 1);
                          return (
                          <option key={i + 1} value={String(i + 1)}>
                            {["1st", "2nd", "3rd", "4th"][i]} Year
                          </option>
                        );
                      })}
                      </select>
                    </div>
                  </>
                )}

                {/* SIGNATORY FIELDS — show only when role is signatory */}
                {form.role === "signatory" && (
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full border-slate-200 dark:border-slate-700 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button 
                onClick={() => setShowModal(false)}
                className="order-2 sm:order-1 px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={modifyUser}
                className="order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                {editingId ? "Update Info" : "Register Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}