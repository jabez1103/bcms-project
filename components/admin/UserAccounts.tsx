"use client";
import { useState, useEffect } from "react";


type User = {
  user_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  account_status: string;
};

const emptyForm = {
  user_id: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "student",
  account_status: "active"
};

export default function UserAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<User | typeof emptyForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const addUser = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
    setError("");
  };

  const editUser = (user: User) => {
    setForm({ ...user});
    setEditingId(user.user_id);
    setError("");
    setShowModal(true);
  };

  const modifyUser = async () => {
    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch( url, {
      method,
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) { setError( data.error || "Something went wrong! " ); return; }

    setShowModal(false);
    fetchUsers();
  };

  const deleteUser = async (user_id: number) => {
    if (!confirm("Delete this user? Buotan raba ni sya.")) return;
    await fetch(`/api/users/${user_id}` , { method: "DELETE" });
    fetchUsers();
  }
  
  return (
    <>
      <div className="bg-white p-4 rounded shadow text-black">
          <h1 className="text-2xl font-bold mb-4">User Management</h1>
          <p>This a user accounts management area bai.</p>
      </div>
      <div className="p-6">
        <div className="flex justify-end items-center mb-4">
          <button onClick={addUser} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add User
          </button>
        </div>

        <table className="w-full border text-sm bg-black">
          <thead className="bg-gray-100">
            <tr className="font-bold">
              {["User ID", "Name", "Email", "Role", "Account Status", "Actions"].map(h => (
                <th key={h} className="border px-3 py-2 text-left bg-pink-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td className="border px-3 py-2">{u.user_id}</td>
                <td className="border px-3 py-2">{u.first_name} {u.middle_name} {u.last_name}</td>
                <td className="border px-3 py-2">{u.email}</td>
                <td className="border px-3 py-2 capitalize">{u.role}</td>
                <td className="border px-3 py-2 capitalize">{u.account_status}</td>
                <td className="border px-3 py-2 space-x-2">
                  <button onClick={() => editUser(u)} className="text-blue-700 hover:underline">Edit</button>
                  <button onClick={() => deleteUser(u.user_id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-pink-600 rounded-lg p-6 w-full max-w-md shadow-xl">
              <h2 className="tex-lg font-bold mb-4">{editingId ? "Edit User" : "Add User"}</h2>

              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

              {[
                { label: "User Id", key: "user_id" },
                { label: "First Name", key: "first_name" },
                { label: "Middle Name", key: "middle_name" },
                { label: "Last Name", key: "last_name" }
              ].map(({ label, key }) => (
                <div key={key} className="mb-3">
                  <label className="block text-sm font-meduim mb-1">{label}</label>
                  <input
                    type= "text" //{ key === "password" ? "password" : "text"}
                    value={(form as any) [key]}
                    disabled={ key === "user_id" && !!editingId }
                    onChange={e => {
                      const val = key === "user_id" ? (parseInt(e.target.value) || "") : e.target.value;
                      const new_form = { ...form, [key]: val };
                      const first_name = new_form.first_name.replace( /\s+/g, "").toLowerCase();
                      const last_name = new_form.last_name.replace( /\s+/g, "").toLowerCase();
                      const email = `${first_name}.${last_name}@bisu.edu.ph`;
                      const def_pword = `${new_form.user_id}${last_name}`;
                      setForm({...new_form, "email": email, "password": def_pword });
                      setError("");
                    }}
                    className={`w-full border rounded px-3 py-2 text-sm ${key === "user_id" && editingId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
              ))}

              <div className="mb-3">
                <label className="block text-sm font-meduim mb-1">Role</label>
                <select disabled={ !!editingId } value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={ `w-full border rounded px-3 py-2 text-sm ${ !!editingId ? "bg-gray-100 cursor-not-allowed" : ""}` }>
                  <option value="student">Student</option>
                  <option value="signatory">Signatory</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-meduim mb-1">Account Status</label>
                <select value={form.account_status} onChange={e => setForm({ ...form, account_status: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
                <button onClick={modifyUser} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </>
  );
}
/*
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <button onClick={addUser} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add User
        </button>
      </div>

      {/* TABLE }
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr className="font-bold">
            {["ID", "Name", "Email", "Role", "Status", "Actions"].map(h => (
              <th key={h} className="border px-3 py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.user_id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{u.user_id}</td>
              <td className="border px-3 py-2">{u.first_name} {u.middle_name} {u.last_name}</td>
              <td className="border px-3 py-2">{u.email}</td>
              <td className="border px-3 py-2 capitalize">{u.role}</td>
              <td className="border px-3 py-2 capitalize">{u.account_status}</td>
              <td className="border px-3 py-2 space-x-2">
                <button onClick={() => editUser(u)} className="text-blue-700 hover:underline">Edit</button>
                <button onClick={() => deleteUser(u.user_id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL }
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">{editingId ? "Edit User" : "Add User"}</h2>

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            {[
              { label: "User Id", key: "user_id" },
              { label: "First Name", key: "first_name" },
              { label: "Middle Name", key: "middle_name" },
              { label: "Last Name", key: "last_name" },
              { label: "Email", key: "email" },
              { label: "Password", key: "password" },
            ].map(({ label, key }) => (
              <div key={key} className="mb-3">
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  //type={key === "password" ? "password" : "text"}
                  type="text"
                  value={(form as any)[key]}
                  disabled={ key==="user_id" && !!editingId}
                  onChange={e => {
                    const val = key === "user_id" ? parseInt(e.target.value) || 0 : e.target.value;
                    setForm({ ...form, [key]: val });
                    setError("");
                  }}
                  className={`w-full border rounded px-3 py-2 text-sm ${key === "user_id" && editingId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                 />
              </div>
            ))}

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm">
                <option value="student">Student</option>
                <option value="signatory">Signatory</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.account_status} onChange={e => setForm({ ...form, account_status: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-sm">Cancel</button>
              <button onClick={modifyUser} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}   
*/