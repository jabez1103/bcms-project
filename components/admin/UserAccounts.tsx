"use client";
import { useState, useEffect, useMemo } from "react";

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
};

const emptyForm = {
  user_id: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "student",
  account_status: "active",
  profile_picture: "/avatars/defaultAvatar.jpg",
};

/* ================= HELPERS ================= */

function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function isBisuEmail(email: string) {
  return email.toLowerCase().endsWith("@bisu.edu.ph");
}

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
    let newForm = { ...form, [key]: value };
    if (["first_name", "middle_name", "last_name"].includes(key)) {
      newForm[key] = capitalizeWords(value);
    }
    if (key === "email") {
      if (value && !isBisuEmail(value)) {
        setError("Email must end with @bisu.edu.ph");
      } else {
        setError("");
      }
    }
    setForm(newForm);
  };

  const modifyUser = async () => {
    if (!isBisuEmail(form.email)) {
      setError("Only BISU institutional email is allowed.");
      return;
    }
    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              User Management
            </h1>
            <p className="text-slate-500 mt-2 text-base md:text-lg">
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
        <div className="flex flex-col lg:flex-row items-center justify-between mb-8 bg-white p-2 md:p-3 rounded-2xl border border-slate-200 shadow-sm gap-4">
          <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto w-full no-scrollbar">
            <div className="flex min-w-full sm:min-w-0">
                {["all", "student", "signatory", "admin"].map((role) => (
                <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all whitespace-nowrap ${
                    roleFilter === role
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
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
        <div className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          
          {/* MOBILE LIST VIEW */}
          <div className="block md:hidden divide-y divide-slate-100">
            {loading ? (
                <div className="p-10 text-center text-slate-400 italic">Loading directory...</div>
            ) : paginatedUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-400">No users found.</div>
            ) : (
                paginatedUsers.map((u) => (
                    <div key={u.user_id} className={`p-5 space-y-4 ${u.account_status === 'inactive' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 border border-indigo-100 shrink-0">
                                {u.first_name[0]}{u.last_name[0]}
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-slate-800 text-sm truncate">
                                    {u.first_name} {u.last_name}
                                </div>
                                <div className="text-xs text-slate-400 truncate">{u.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {u.role}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${u.account_status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {u.account_status}
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => toggleStatus(u)} className="text-slate-600 font-bold text-xs uppercase">{u.account_status === 'active' ? 'Deactivate' : 'Activate'}</button>
                                <button onClick={() => handleOpenModal(u)} className="text-indigo-600 font-bold text-xs uppercase">Edit</button>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">User Table Data</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Login Access</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {!loading && paginatedUsers.map((u) => (
                  <tr key={u.user_id} className={`hover:bg-slate-50 transition-colors group ${u.account_status === 'inactive' ? 'bg-slate-50/50' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${u.account_status === 'active' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${u.account_status === 'active' ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                            {u.first_name} {u.middle_name} {u.last_name}
                          </div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => toggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${u.account_status === 'active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.account_status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {u.account_status === 'active' ? 'Enabled' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right space-x-3">
                      <button onClick={() => handleOpenModal(u)} className="text-indigo-600 font-bold text-xs hover:underline uppercase tracking-wider">Modify</button>
                      <button onClick={() => deleteUser(u.user_id)} className="text-rose-300 hover:text-rose-500 font-bold text-xs hover:underline uppercase tracking-wider">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div className="px-6 md:px-8 py-4 md:py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="flex-1 sm:flex-none px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase disabled:opacity-40 transition-all hover:shadow-sm"
              >
                Prev
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="flex-1 sm:flex-none px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase disabled:opacity-40 transition-all hover:shadow-sm"
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
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                {editingId ? "Update Account" : "Register Account"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-light p-2">&times;</button>
            </div>

            <div className="p-6 md:p-8 space-y-5 overflow-y-auto">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-[10px] font-bold uppercase tracking-wide">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Student / Staff ID</label>
                  <input
                    type="number"
                    disabled={!!editingId}
                    value={form.user_id}
                    placeholder="Initial ID number"
                    onChange={(e) => updateFormFields("user_id", e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none transition-all disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => updateFormFields("first_name", e.target.value)}
                    className="w-full border-slate-200 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Middle Name</label>
                  <input
                    type="text"
                    value={form.middle_name}
                    onChange={(e) => updateFormFields("middle_name", e.target.value)}
                    className="w-full border-slate-200 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => updateFormFields("last_name", e.target.value)}
                    className="w-full border-slate-200 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Institutional Email</label>
                  <input
                    type="email"
                    value={form.email}
                    placeholder="name@bisu.edu.ph"
                    onChange={(e) => updateFormFields("email", e.target.value)}
                    className="w-full border-slate-200 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 md:col-span-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">User Role</label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full border-slate-200 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none bg-white"
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
                            className="w-full border-slate-200 border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold focus:border-indigo-500 outline-none bg-white"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Deactivated</option>
                        </select>
                    </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 border-t border-slate-100 shrink-0">
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