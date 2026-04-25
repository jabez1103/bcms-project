"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  SkeletonMobileCard,
  SkeletonUserHeader,
  SkeletonUserRow,
} from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Users, UserPlus, Upload } from "lucide-react";

type User = {
  user_id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  email: string;
  role: string;
  account_status: string;
  profile_picture: string | null;
  program: string | null;
  year_level: number | null;
  department: string | null;
};

type FormState = {
  user_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  email: string;
  password: string;
  role: string;
  account_status: string;
  profile_picture: string;
  program: string;
  year_level: string;
  department: string;
  credentials: string;
};

type ApiResponse = {
  success?: boolean;
  data?: User[];
  message?: string;
  error?: string;
  details?: Record<string, string>;
};

type Notice = {
  type: "success" | "error";
  message: string;
};

type ImportResult = {
  imported: number;
  skipped: { user_id: string; name: string; reason: string }[];
  errors: string[];
};

const emptyForm: FormState = {
  user_id: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  email: "",
  password: "",
  role: "student",
  account_status: "active",
  profile_picture: "/avatars/defaultAvatar.jpg",
  program: "BSCS",
  year_level: "1",
  department: "Director, Scholarship and Admission",
  credentials: "",
};

const PROGRAMS: Record<string, { label: string; years: number }> = {
  BSIT: { label: "BS Information Technology", years: 4 },
  BSCS: { label: "BS Computer Science", years: 4 },
  BSES: { label: "BS Environmental Science", years: 4 },
  BEED: { label: "Bachelor of Elementary Ed", years: 4 },
  BEEDMATH: { label: "BEED Major in Math", years: 4 },
  BTLED: { label: "Bachelor of Tech-Livelihood", years: 4 },
  HM: { label: "Hotel Management", years: 2 },
};

const DEPARTMENTS = [
  'Director, Scholarship and Admission',
  'Director, Guidance and Counseling Services',
  'Director, Sports Development',
  'Head, Housing and Residental Services',
  'Head, Student Publication',
  'Head, Student Goverment',
  'Head, Student Discipline',
  'Director, Health and Wellness Services',
  'Diretor, Culture and Arts Affair',
  'Director, Alumni Relations',
  'Head, Student Organizations',
  'Head, FSTLP',
  'Director, Student Development Services',
  'Sports Office',
  'Dean',
  'Librarian',
  'Cashier',
];


const CREDENTIALS = [
  { value: "", label: "None" },
  { value: "PhD", label: "PhD — Doctor of Philosophy" },
  { value: "EdD", label: "EdD — Doctor of Education" },
  { value: "MD", label: "MD — Doctor of Medicine" },
  { value: "Atty.", label: "Atty. — Attorney" },
  { value: "Engr.", label: "Engr. — Engineer" },
  { value: "Arch.", label: "Arch. — Architect" },
  { value: "CPA", label: "CPA — Certified Public Accountant" },
  { value: "LPT", label: "LPT — Licensed Professional Teacher" },
  { value: "RN", label: "RN — Registered Nurse" },
  { value: "RPm", label: "RPm — Registered Psychometrician" },
];

const SUFFIXES = ["", "Jr.", "Sr.", "II", "III", "IV", "V"];

const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;
const SELF_PROTECTION_MESSAGE =
  "System Protection: You cannot modify your own administrative status";

/* ================= HELPERS ================= */

function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function cleanName(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, "");
}

function defaultPassword(lastName: string, userId: string) {
  if (!lastName || !userId) return "";
  return `${lastName.replaceAll(" ", "")}${userId}`;
}

function readYearLabel(year: number) {
  return ["1st", "2nd", "3rd", "4th", "5th"][year - 1] ?? `${year}th`;
}

function normalizeImportResult(payload: unknown): ImportResult {
  const source =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {};

  const importedRaw = Number(source.imported ?? 0);
  const imported = Number.isFinite(importedRaw) ? importedRaw : 0;

  const skipped = Array.isArray(source.skipped)
    ? source.skipped.map((item) => {
        const row =
          typeof item === "object" && item !== null
            ? (item as Record<string, unknown>)
            : {};
        return {
          user_id: String(row.user_id ?? ""),
          name: String(row.name ?? ""),
          reason: String(row.reason ?? "Skipped"),
        };
      })
    : [];

  const errors = Array.isArray(source.errors)
    ? source.errors.map((item) => String(item))
    : [];

  if (errors.length === 0 && typeof source.error === "string" && source.error.trim()) {
    errors.push(source.error);
  }
  if (errors.length === 0 && typeof source.message === "string" && source.message.trim()) {
    errors.push(source.message);
  }

  return { imported, skipped, errors };
}

function userToForm(user: User): FormState {
  return {
    user_id: String(user.user_id),
    first_name: user.first_name ?? "",
    middle_name: user.middle_name ?? "",
    last_name: user.last_name ?? "",
    suffix: user.suffix ?? "",
    email: user.email ?? "",
    password: "",
    role: user.role ?? "student",
    account_status: user.account_status ?? "active",
    profile_picture: user.profile_picture ?? "/avatars/defaultAvatar.jpg",
    program: user.program ?? "BSCS",
    year_level: user.year_level ? String(user.year_level) : "1",
    department: user.department ?? "Registrar",
    credentials: (user as any).credentials ?? "",
  };
}

async function readJsonSafely(response: Response): Promise<ApiResponse | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function validateForm(form: FormState, isEditing: boolean) {
  const errors: Record<string, string> = {};

  if (!form.user_id.trim()) {
    errors.user_id = "Student or staff ID is required.";
  } else if (!/^\d+$/.test(form.user_id.trim())) {
    errors.user_id = "Student or staff ID must contain numbers only.";
  }

  if (!form.first_name.trim()) {
    errors.first_name = "First name is required.";
  } else if (!NAME_REGEX.test(form.first_name.trim())) {
    errors.first_name = "First name contains invalid characters.";
  }

  if (form.middle_name.trim() && !NAME_REGEX.test(form.middle_name.trim())) {
    errors.middle_name = "Middle name contains invalid characters.";
  }

  if (!form.last_name.trim()) {
    errors.last_name = "Last name is required.";
  } else if (!NAME_REGEX.test(form.last_name.trim())) {
    errors.last_name = "Last name contains invalid characters.";
  }

  if (!form.email.trim()) {
    errors.email = "Institutional email is required.";
  } else if (!/^[a-z0-9._%+-]+@bisu\.edu\.ph$/.test(form.email.trim().toLowerCase())) {
    errors.email = "Email must use the @bisu.edu.ph domain.";
  }

  if (!isEditing) {
    if (!form.password.trim()) {
      errors.password = "Default password could not be generated yet.";
    } else if (form.password.trim().length < 6) {
      errors.password = "Default password must be at least 6 characters.";
    }
  } else if (form.password.trim() && form.password.trim().length < 6) {
    errors.password = "New password must be at least 6 characters.";
  }

  if (!["student", "signatory", "admin"].includes(form.role)) {
    errors.role = "Please select a valid role.";
  }

  if (!["active", "inactive"].includes(form.account_status)) {
    errors.account_status = "Please select a valid account status.";
  }

  if (form.role === "student") {
    if (!PROGRAMS[form.program]) {
      errors.program = "Please select a valid program.";
    }

    const maxYears = PROGRAMS[form.program]?.years ?? 4;
    if (!/^\d+$/.test(form.year_level)) {
      errors.year_level = "Please select a valid year level.";
    } else {
      const yearLevel = Number(form.year_level);
      if (yearLevel < 1 || yearLevel > maxYears) {
        errors.year_level = `Year level must be between 1 and ${maxYears}.`;
      }
    }
  }

  if (form.role === "signatory" && !DEPARTMENTS.includes(form.department)) {
    errors.department = "Please select a valid department.";
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-2 text-[11px] font-bold text-rose-500 dark:text-rose-400">
      {message}
    </p>
  );
}

type ProtectedActionButtonProps = {
  disabled: boolean;
  tooltip: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
};

function ProtectedActionButton({
  disabled,
  tooltip,
  onClick,
  className,
  children,
}: ProtectedActionButtonProps) {
  if (disabled) {
    return (
      <span title={tooltip} className="inline-flex">
        <button type="button" disabled className={className}>
          {children}
        </button>
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

/* ================= COMPONENT ================= */

export default function UserAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [modalError, setModalError] = useState("");
  const [listError, setListError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  // IMPORT NI NA PART BAI JUSKO
  const [showImportModal, setShowImportModal]   = useState(false);
  const [importFile, setImportFile]             = useState<File | null>(null);
  const [importPreview, setImportPreview]       = useState<any[]>([]);
  const [importResult, setImportResult]         = useState<ImportResult | null>(null);
  const [importing, setImporting]               = useState(false);
  const [fileType, setFileType]                 = useState<"csv" | "xlsx" | null>(null);
  const [activeResultTab, setActiveResultTab]   = useState<"skipped" | "errors">("skipped");

  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { user: currentUser, loading: currentUserLoading } = useCurrentUser();

  const itemsPerPage = 6;
  const years = PROGRAMS[form.program]?.years ?? 4;
  const isEditing = editingId !== null;
  const isProtectedAdminAction = (user: User) =>
    !currentUserLoading &&
    String(currentUser?.role ?? "").toLowerCase() === "admin" &&
    Number(currentUser?.user_id) === user.user_id;

  useEffect(() => {
    const maxYears = PROGRAMS[form.program]?.years ?? 4;
    if (Number(form.year_level) > maxYears) {
      setForm((prev) => ({
        ...prev,
        year_level: "1",
      }));
    }
  }, [form.program, form.year_level]);

  const fetchUsers = async () => {
    setLoading(true);
    setListError("");

    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await readJsonSafely(res);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch users.");
      }

      const nextUsers = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setUsers(nextUsers);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch users.";
      setUsers([]);
      setListError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole =
        roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
      if (!matchesRole) return false;
      if (!q) return true;

      const fullName = `${u.first_name} ${u.middle_name ?? ""} ${u.last_name}`
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      return (
        fullName.includes(q) ||
        String(u.user_id).toLowerCase().includes(q) ||
        String(u.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, roleFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetModalState = () => {
    setFormErrors({});
    setModalError("");
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setForm(userToForm(user));
      setEditingId(user.user_id);
    } else {
      setForm(emptyForm);
      setEditingId(null);
    }

    resetModalState();
    setNotice(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSaving(false);
    resetModalState();
  };

  const updateFormFields = (key: keyof FormState, value: string) => {
    const normalizedValue =
      key === "first_name" || key === "middle_name" || key === "last_name"
        ? capitalizeWords(value)
        : value;

    const newForm = { ...form, [key]: normalizedValue };

    if (key === "first_name" || key === "last_name" || key === "user_id") {
      const firstName =
        key === "first_name" ? normalizedValue : newForm.first_name;
      const lastName = key === "last_name" ? normalizedValue : newForm.last_name;
      const userId = key === "user_id" ? normalizedValue : newForm.user_id;

      newForm.email = `${cleanName(firstName)}.${cleanName(lastName)}@bisu.edu.ph`;
      newForm.profile_picture = "/avatars/defaultAvatar.jpg";

      if (!isEditing) {
        newForm.password = defaultPassword(lastName, userId);
      }
    }

    setForm(newForm);
    setModalError("");
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === "first_name" || key === "last_name" || key === "user_id") {
        delete next.email;
        if (!isEditing) {
          delete next.password;
        }
      }
      return next;
    });
  };

  const handleRoleChange = (role: string) => {
    setForm((prev) => ({
      ...prev,
      role,
      program: prev.program || "BSCS",
      year_level: prev.year_level || "1",
      department: prev.department || "Registrar",
    }));

    setModalError("");
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.role;
      delete next.program;
      delete next.year_level;
      delete next.department;
      return next;
    });
  };

  const modifyUser = async () => {
    const clientErrors = validateForm(form, isEditing);
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      setModalError("Please review the form and correct the highlighted fields.");
      return;
    }

    setSaving(true);
    setModalError("");
    setFormErrors({});
    setNotice(null);

    const url = isEditing ? `/api/users/${editingId}` : "/api/users";
    const method = isEditing ? "PUT" : "POST";

    const payload: Record<string, string> = {
      ...form,
      user_id: isEditing ? String(editingId) : form.user_id,
      password: isEditing ? form.password.trim() : form.password,
    };

    if (form.role !== "student") {
      delete payload.program;
      delete payload.year_level;
    }

    if (form.role !== "signatory") {
      delete payload.department;
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await readJsonSafely(res);

    if (!res.ok) {
      setFormErrors(data?.details || {});
      setModalError(data?.error || "Something went wrong while saving the account.");
      setSaving(false);
      return;
    }

    setShowModal(false);
    setSaving(false);
    setNotice({
      type: "success",
      message:
        data?.message ||
        (isEditing
          ? "User account updated successfully."
          : "User account created successfully."),
    });

    await fetchUsers();
  };

  const toggleStatus = async (user: User) => {
    const newStatus = user.account_status === "active" ? "inactive" : "active";

    setBusyUserId(user.user_id);
    setNotice(null);

    const payload = {
      user_id: String(user.user_id),
      first_name: user.first_name,
      middle_name: user.middle_name ?? "",
      last_name: user.last_name,
      suffix: user.suffix ?? "",
      email: user.email,
      password: "",
      role: user.role,
      account_status: newStatus,
      profile_picture: user.profile_picture ?? "/avatars/defaultAvatar.jpg",
      program: user.program ?? "BSCS",
      year_level: user.year_level ? String(user.year_level) : "1",
      department: user.department ?? "Registrar",
    };

    try {
      const res = await fetch(`/api/users/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await readJsonSafely(res);

      if (!res.ok) {
        setNotice({
          type: "error",
          message: data?.error || "Unable to update user access status.",
        });
        return;
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.user_id === user.user_id
            ? { ...item, account_status: newStatus }
            : item,
        ),
      );

      setNotice({
        type: "success",
        message:
          data?.message ||
          `User account ${newStatus === "active" ? "activated" : "deactivated"} successfully.`,
      });
    } catch {
      setNotice({
        type: "error",
        message: "Unable to update user access status.",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  const deleteUser = async (user_id: number) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    setBusyUserId(user_id);
    setNotice(null);

    try {
      const res = await fetch(`/api/users/${user_id}`, { method: "DELETE" });
      const data = await readJsonSafely(res);

      if (!res.ok) {
        setNotice({
          type: "error",
          message: data?.error || "Unable to delete user account.",
        });
        return;
      }

      setUsers((prev) => prev.filter((user) => user.user_id !== user_id));
      setNotice({
        type: "success",
        message: data?.message || "User account deleted successfully.",
      });
    } catch {
      setNotice({
        type: "error",
        message: "Unable to delete user account.",
      });
    } finally {
      setBusyUserId(null);
    }
  };

  // IMPORT FUNCTIONS HERE BOSS
  function parseCSV(text: string): any[] {
    const lines = text.trim().split("\n").filter(l => l.trim());
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      return headers.reduce((obj: any, h, i) => { obj[h] = values[i] || ""; return obj; }, {});
    });
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportResult(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    setFileType(ext === "xlsx" ? "xlsx" : "csv");

    if (ext === "xlsx") {
      // Parse Excel
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      // Normalize keys
      const normalized = (data as any[]).map(row =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k.toLowerCase().replace(/\s+/g, "_"), v])
        )
      );
      setImportPreview(normalized.slice(0, 5));
    } else {
      // Parse CSV
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        setImportPreview(parseCSV(text).slice(0, 5));
      };
      reader.readAsText(file);
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    setImporting(true);

    try {
      let users: any[] = [];

      if (fileType === "xlsx") {
        const XLSX = await import("xlsx");
        const arrayBuffer = await importFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        users = (data as any[]).map(row =>
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k.toLowerCase().replace(/\s+/g, "_"), v])
          )
        );
      } else {
        const reader = new FileReader();
        await new Promise<void>(resolve => {
          reader.onload = (ev) => {
            users = parseCSV(ev.target?.result as string);
            resolve();
          };
          reader.readAsText(importFile);
        });
      }

      const res = await fetch("/api/users/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users }),
      });

      const data = await res.json();
      setImportResult(normalizeImportResult(data));
      fetchUsers();
    } catch {
      setImportResult({ imported: 0, skipped: [], errors: ["Failed to parse or upload file."] });
    }

    setImporting(false);
  };

  const downloadSample = (type: "csv" | "xlsx") => {
    const rows = [
      { user_id: 10001, first_name: "Juan", middle_name: "dela", last_name: "Cruz", role: "student", program: "BSIT", year_level: 1, department: "", credentials: "" },
      { user_id: 10002, first_name: "Maria", middle_name: "", last_name: "Santos", role: "signatory", program: "", year_level: "", department: "Library", credentials: "LPT" },
      { user_id: 10003, first_name: "Pedro", middle_name: "", last_name: "Reyes", role: "admin", program: "", year_level: "", department: "", credentials: "" },
    ];


    if (type === "csv") {
      const headers = Object.keys(rows[0]).join(",");
      const csv = [headers, ...rows.map(r => Object.values(r).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "sample_users.csv"; a.click();
    } else {
      import("xlsx").then(XLSX => {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, "sample_users.xlsx");
      });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-2 sm:p-4 md:p-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <SkeletonUserHeader />

          <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonMobileCard key={i} />
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                  <tr>
                    {["User Table Data", "Role", "Login Access", "Actions"].map((h) => (
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
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <PageHeader
        title="User Accounts"
        description="Comprehensive directory for managing institutional stakeholders and system access."
        icon={Users}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowImportModal(true);
                setImportFile(null);
                setImportPreview([]);
                setImportResult(null);
                setFileType(null);
                setActiveResultTab("skipped");
              }}
              className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
            >
              <Upload size={14} /> Import
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all flex items-center gap-2 shadow-lg shadow-brand-200 dark:shadow-none active:scale-95"
            >
              <UserPlus size={14} /> Add User
            </button>
          </div>
        }
      />
      <div className="max-w-[1600px] mx-auto p-2 sm:p-4 md:p-10">

        {notice && (
          <div
            className={`mb-6 rounded-2xl border px-5 py-4 shadow-sm ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
            }`}
          >
            <p className="text-sm font-bold">{notice.message}</p>
          </div>
        )}

        {listError && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <p className="text-sm font-bold">{listError}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-center justify-between mb-5 md:mb-8 bg-white dark:bg-slate-900 p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-3 md:gap-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto w-full no-scrollbar">
            <div className="flex min-w-full sm:min-w-0">
              {["all", "student", "signatory", "admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold capitalize transition-all whitespace-nowrap ${
                    roleFilter === role
                      ? "bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm"
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

        <div className="mb-4 md:mb-6">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
          <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {paginatedUsers.length === 0 ? (
              <div className="px-4 py-8 sm:px-6 sm:py-12 text-center">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  No users found for the selected filter.
                </p>
              </div>
            ) : (
              paginatedUsers.map((u) => (
                <div
                  key={u.user_id}
                  className={`p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 ${
                    u.account_status === "inactive" ? "opacity-60 grayscale-[0.5]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/20 shrink-0">
                      {u.first_name[0]}
                      {u.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className={`font-bold text-slate-800 dark:text-slate-200 text-sm truncate ${isProtectedAdminAction(u) ? "italic" : ""}`}>
                        {u.first_name} {u.last_name}
                        {isProtectedAdminAction(u) && (
                          <span className="ml-2 text-[9px] font-black uppercase tracking-widest bg-brand-100 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 px-1.5 py-0.5 rounded-md align-middle">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2.5">
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {u.role}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          u.account_status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {u.account_status}
                      </span>
                    </div>

                      <div className="flex gap-3">
                        <ProtectedActionButton
                          disabled={busyUserId === u.user_id || isProtectedAdminAction(u)}
                          tooltip={SELF_PROTECTION_MESSAGE}
                          onClick={() => toggleStatus(u)}
                          className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase disabled:opacity-50"
                        >
                          {busyUserId === u.user_id
                            ? "Working..."
                            : u.account_status === "active"
                              ? "Deactivate"
                              : "Activate"}
                        </ProtectedActionButton>
                        <ProtectedActionButton
                          disabled={busyUserId === u.user_id || isProtectedAdminAction(u)}
                          tooltip={SELF_PROTECTION_MESSAGE}
                          onClick={() => handleOpenModal(u)}
                          className="text-brand-600 dark:text-brand-400 font-bold text-xs uppercase disabled:opacity-50"
                        >
                          Edit
                        </ProtectedActionButton>
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/50">
                <tr>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    User Table Data
                  </th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Login Access
                  </th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        No users found for the selected filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr
                      key={u.user_id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${
                        u.account_status === "inactive"
                          ? "bg-slate-50/50 dark:bg-slate-800/30"
                          : ""
                      }`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                              u.account_status === "active"
                                ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-100 dark:border-brand-500/20"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {u.first_name[0]}
                            {u.last_name[0]}
                          </div>
                          <div>
                            <div
                              className={`font-bold text-sm ${
                                u.account_status === "active"
                                  ? "text-slate-800 dark:text-slate-200"
                                  : "text-slate-400 italic"
                              } ${isProtectedAdminAction(u) ? "italic" : ""}`}
                            >
                              {u.first_name}
                              {u.middle_name ? ` ${u.middle_name}` : ""} {u.last_name}
                              {/*  "You" badge */}
                              {isProtectedAdminAction(u) && (
                                <span className="ml-2 text-[9px] font-black uppercase tracking-widest bg-brand-100 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 px-1.5 py-0.5 rounded-md align-middle">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-medium mt-0.5">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                          {u.role}
                        </span>
                      </td>

                      <td className="px-8 py-5">
                        <ProtectedActionButton
                          disabled={busyUserId === u.user_id || isProtectedAdminAction(u)}
                          tooltip={SELF_PROTECTION_MESSAGE}
                          onClick={() => toggleStatus(u)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                            u.account_status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                              : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.account_status === "active" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {busyUserId === u.user_id
                            ? "Updating..."
                            : u.account_status === "active"
                              ? "Enabled"
                              : "Deactivated"}
                        </ProtectedActionButton>
                      </td>

                      <td className="px-8 py-5 text-right space-x-3">
                        <ProtectedActionButton
                          disabled={busyUserId === u.user_id || isProtectedAdminAction(u)}
                          tooltip={SELF_PROTECTION_MESSAGE}
                          onClick={() => handleOpenModal(u)}
                          className="text-brand-600 dark:text-brand-400 font-bold text-xs hover:underline uppercase tracking-wider disabled:opacity-50"
                        >
                          Modify
                        </ProtectedActionButton>
                        <ProtectedActionButton
                          disabled={busyUserId === u.user_id || isProtectedAdminAction(u)}
                          tooltip={SELF_PROTECTION_MESSAGE}
                          onClick={() => deleteUser(u.user_id)}
                          className="text-rose-400 dark:hover:text-rose-500 font-bold text-xs hover:underline uppercase tracking-wider disabled:opacity-50"
                        >
                          {busyUserId === u.user_id ? "Working..." : "Remove"}
                        </ProtectedActionButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 md:px-8 py-4 md:py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="flex-1 sm:flex-none px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase disabled:opacity-40 transition-all hover:shadow-sm"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages || filteredUsers.length === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="flex-1 sm:flex-none px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase disabled:opacity-40 transition-all hover:shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                  {isEditing ? "Update Account" : "Register Account"}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {isEditing
                    ? "Update profile details and access settings."
                    : "Create a new account with auto-generated institutional credentials."}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 text-3xl font-light p-2"
              >
                &times;
              </button>
            </div>

            <div className="p-4 sm:p-5 md:p-8 space-y-4 md:space-y-5 overflow-y-auto">
              {modalError && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl">
                  <p className="text-sm font-bold">{modalError}</p>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-3">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isEditing
                    ? "Email updates automatically from the name fields. Password stays unchanged unless you provide a new one from a future reset flow."
                    : "Institutional email and initial password are generated automatically from the entered name and ID."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Student / Staff ID
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    disabled={isEditing}
                    value={form.user_id}
                    placeholder="Initial ID number"
                    onChange={(e) => updateFormFields("user_id", e.target.value)}
                    className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none transition-all disabled:opacity-60 ${
                      formErrors.user_id
                        ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                    }`}
                  />
                  <FieldError message={formErrors.user_id} />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => updateFormFields("first_name", e.target.value)}
                    className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none transition-all ${
                      formErrors.first_name
                        ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                    }`}
                  />
                  <FieldError message={formErrors.first_name} />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={form.middle_name}
                    onChange={(e) => updateFormFields("middle_name", e.target.value)}
                    className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none transition-all ${
                      formErrors.middle_name
                        ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                    }`}
                  />
                  <FieldError message={formErrors.middle_name} />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => updateFormFields("last_name", e.target.value)}
                    className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none transition-all ${
                      formErrors.last_name
                        ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                    }`}
                  />
                  <FieldError message={formErrors.last_name} />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Suffix <span className="text-brand-400 normal-case font-medium">(optional)</span>
                  </label>
                  <select
                    value={form.suffix}
                    onChange={(e) => updateFormFields("suffix", e.target.value)}
                    className="w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none transition-all border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                  >
                    {SUFFIXES.map((sfx) => (
                      <option key={sfx || "none"} value={sfx}>
                        {sfx || "None"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Institutional Email <span className="text-brand-400 normal-case font-medium">(auto-generated)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none cursor-not-allowed ${
                      formErrors.email
                        ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  <FieldError message={formErrors.email} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    {isEditing ? "Password Status" : "Default Password"}{" "}
                    <span className="text-brand-400 normal-case font-medium">
                      {isEditing ? "(unchanged on update)" : "(LastName + ID)"}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={isEditing ? "Password will remain unchanged" : form.password}
                    readOnly
                    className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none cursor-not-allowed ${
                      formErrors.password
                        ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  <FieldError message={formErrors.password} />
                </div>

                <div className="grid grid-cols-2 md:col-span-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      User Role
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none bg-white dark:bg-slate-900 ${
                        formErrors.role
                          ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                      }`}
                    >
                      <option value="student">Student</option>
                      <option value="signatory">Signatory</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <FieldError message={formErrors.role} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Initial Status
                    </label>
                    <select
                      value={form.account_status}
                      onChange={(e) => updateFormFields("account_status", e.target.value)}
                      className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none bg-white dark:bg-slate-900 ${
                        formErrors.account_status
                          ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Deactivated</option>
                    </select>
                    <FieldError message={formErrors.account_status} />
                  </div>
                </div>

                {form.role === "student" && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Program
                      </label>
                      <select
                        value={form.program}
                        onChange={(e) => updateFormFields("program", e.target.value)}
                        className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none bg-white dark:bg-slate-900 ${
                          formErrors.program
                            ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                        }`}
                      >
                        {Object.entries(PROGRAMS).map(([key, val]) => (
                          <option key={key} value={key}>
                            {key} — {val.label}
                          </option>
                        ))}
                      </select>
                      <FieldError message={formErrors.program} />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Year Level
                      </label>
                      <select
                        value={form.year_level}
                        onChange={(e) => updateFormFields("year_level", e.target.value)}
                        className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none bg-white dark:bg-slate-900 ${
                          formErrors.year_level
                            ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                        }`}
                      >
                        {Array.from({ length: years }, (_, i) => {
                          const year = i + 1;
                          return (
                            <option key={year} value={String(year)}>
                              {readYearLabel(year)} Year
                            </option>
                          );
                        })}
                      </select>
                      <FieldError message={formErrors.year_level} />
                    </div>
                  </>
                )}

                {form.role === "signatory" && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Department
                      </label>
                      <select
                        value={form.department}
                        onChange={(e) => updateFormFields("department", e.target.value)}
                        className={`w-full border-2 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none bg-white dark:bg-slate-900 ${
                          formErrors.department
                            ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                        }`}
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <FieldError message={formErrors.department} />
                    </div>

                    {/* Academic Credentials */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Academic Credentials <span className="text-brand-400 normal-case font-medium">(optional)</span>
                      </label>
                      <select
                        value={form.credentials}
                        onChange={(e) => updateFormFields("credentials", e.target.value)}
                        className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl p-3 md:p-3.5 text-sm font-bold outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-brand-500"
                      >
                        {CREDENTIALS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      {/* Preview how name will appear */}
                      {form.credentials && (
                        <p className="mt-2 text-[11px] font-bold text-brand-500">
                          Display: {form.credentials} {form.last_name || "LastName"}, {form.first_name || "FirstName"}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5 md:p-8 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="order-2 sm:order-1 px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={modifyUser}
                disabled={saving}
                className="order-1 sm:order-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-100 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving
                  ? isEditing
                    ? "Updating..."
                    : "Registering..."
                  : isEditing
                    ? "Update Info"
                    : "Register Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

            {/* HEADER */}
            <div className="p-4 sm:p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Import Users</h2>
                <p className="text-xs text-slate-400 mt-1">Bulk register accounts via CSV or Excel</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 text-3xl font-light p-2">&times;</button>
            </div>

            <div className="p-4 sm:p-5 md:p-8 space-y-4 md:space-y-6 overflow-y-auto">

              {/* FORMAT GUIDE */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Columns</p>
                <code className="block text-xs text-brand-600 dark:text-brand-400 font-mono bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  user_id, first_name, middle_name, last_name, role, program, year_level, department, credentials
                </code>
                <ul className="text-[10px] text-slate-400 space-y-1 leading-relaxed">
                  <li>• <strong>role</strong>: student / signatory / admin</li>
                  <li>• <strong>program</strong>: for students (e.g. BSIT, BSCS)</li>
                  <li>• <strong>department</strong>: for signatories (e.g. Library)</li>
                  <li>• <strong>credentials</strong>: for signatories (e.g. PhD, LPT, Atty.)</li>
                  <li>• <strong>password & email</strong>: auto-generated</li>
                </ul>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => downloadSample("csv")} className="text-[10px] font-black text-brand-600 dark:text-brand-400 hover:underline uppercase tracking-wider">↓ Sample CSV</button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button onClick={() => downloadSample("xlsx")} className="text-[10px] font-black text-brand-600 dark:text-brand-400 hover:underline uppercase tracking-wider">↓ Sample Excel</button>
                </div>
              </div>

              {/* FILE UPLOAD */}
              {!importResult && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Select File <span className="text-brand-400 normal-case font-medium">(CSV or Excel)</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-2xl p-6 transition-colors ${importFile ? "border-brand-400 bg-brand-50/30 dark:bg-brand-500/10" : "border-slate-200 dark:border-slate-700 hover:border-brand-300"}`}>
                    <input type="file" accept=".csv,.xlsx" onChange={handleImportFile} className="hidden" id="import-upload" />
                    <label htmlFor="import-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <span className="text-3xl">{importFile ? (fileType === "xlsx" ? "📊" : "📄") : "📁"}</span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 text-center">
                        {importFile ? importFile.name : "Click to browse"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {importFile ? `${fileType?.toUpperCase()} selected` : "CSV or Excel (.xlsx) only"}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* PREVIEW TABLE */}
              {importPreview.length > 0 && !importResult && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview — First 5 rows</p>
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                          {Object.keys(importPreview[0]).map(h => (
                            <th key={h} className="px-4 py-2 font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {importPreview.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{String(val) || "—"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* RESULT */}
              {importResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 text-center border border-emerald-100 dark:border-emerald-500/20">
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{importResult.imported}</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mt-1">Imported</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 text-center border border-amber-100 dark:border-amber-500/20">
                      <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{importResult.skipped.length}</p>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider mt-1">Skipped</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl p-4 text-center border border-rose-100 dark:border-rose-500/20">
                      <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{importResult.errors.length}</p>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider mt-1">Errors</p>
                    </div>
                  </div>

                  {(importResult.skipped.length > 0 || importResult.errors.length > 0) && (
                    <div>
                      <div className="flex gap-2 mb-3">
                        {importResult.skipped.length > 0 && (
                          <button onClick={() => setActiveResultTab("skipped")}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeResultTab === "skipped" ? "bg-amber-500 text-white" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                            Duplicates ({importResult.skipped.length})
                          </button>
                        )}
                        {importResult.errors.length > 0 && (
                          <button onClick={() => setActiveResultTab("errors")}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeResultTab === "errors" ? "bg-rose-500 text-white" : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                            Errors ({importResult.errors.length})
                          </button>
                        )}
                      </div>

                      {activeResultTab === "skipped" && importResult.skipped.length > 0 && (
                        <div className="rounded-2xl border border-amber-100 dark:border-amber-500/20 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-amber-50 dark:bg-amber-500/10">
                              <tr>
                                <th className="px-4 py-2 font-black text-amber-500 uppercase tracking-wider">User ID</th>
                                <th className="px-4 py-2 font-black text-amber-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2 font-black text-amber-500 uppercase tracking-wider">Reason</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-50 dark:divide-amber-500/10">
                              {importResult.skipped.map((s, i) => (
                                <tr key={i}>
                                  <td className="px-4 py-2 font-bold text-slate-600 dark:text-slate-300">{s.user_id}</td>
                                  <td className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300">{s.name}</td>
                                  <td className="px-4 py-2 text-amber-600 dark:text-amber-400 font-medium">{s.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activeResultTab === "errors" && importResult.errors.length > 0 && (
                        <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-500/20 space-y-1">
                          {importResult.errors.map((e, i) => (
                            <p key={i} className="text-xs text-rose-600 dark:text-rose-400 font-medium">{e}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => { setImportFile(null); setImportPreview([]); setImportResult(null); setFileType(null); }}
                    className="text-[10px] font-black text-brand-600 dark:text-brand-400 hover:underline uppercase tracking-wider"
                  >
                    ↑ Import Another File
                  </button>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-4 sm:p-5 md:p-8 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button onClick={() => setShowImportModal(false)}
                className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">
                {importResult ? "Close" : "Cancel"}
              </button>
              {!importResult && (
                <button onClick={handleImportSubmit} disabled={!importFile || importing}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">
                  {importing ? "Importing..." : "Import Users"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
