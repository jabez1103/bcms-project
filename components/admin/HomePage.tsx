"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Check,
  AlertCircle,
  Search,
  X,
  ShieldCheck,
  BookOpen,
  Wallet,
  FlaskConical,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ================= TYPES & MOCK DATA ================= */

type StudentStatus = "Cleared" | "Not Cleared";
type YearLevel = "1st Year" | "2nd Year" | "3rd Year" | "4th Year";

interface Student {
  id: string;
  name: string;
  level: YearLevel;
  section: "A" | "B" | "C";
  program: string;
  status: StudentStatus;
  initials: string;
  color: string;
}

const INITIAL_DATABASE: Student[] = [
  { id: "2021-0001", name: "Mariana Alcantara", level: "3rd Year", section: "A", program: "BSCS", status: "Cleared", initials: "MA", color: "bg-purple-100 text-purple-600" },
  { id: "2022-0412", name: "Rafael Jimenez", level: "1st Year", section: "B", program: "BS-Math", status: "Not Cleared", initials: "RJ", color: "bg-orange-100 text-orange-600" },
  { id: "2021-0882", name: "Kristine Lopez", level: "2nd Year", section: "A", program: "Education", status: "Cleared", initials: "KL", color: "bg-rose-100 text-rose-600" },
  { id: "2023-1102", name: "John Doe", level: "1st Year", section: "A", program: "BSCS", status: "Not Cleared", initials: "JD", color: "bg-blue-100 text-blue-600" },
  { id: "2021-0994", name: "Sarah Smith", level: "3rd Year", section: "A", program: "BSHM", status: "Cleared", initials: "SS", color: "bg-emerald-100 text-emerald-600" },
  { id: "2020-0551", name: "Leonel Messi", level: "4th Year", section: "C", program: "BSES", status: "Cleared", initials: "LM", color: "bg-indigo-100 text-indigo-600" },
  { id: "2022-0010", name: "Angela White", level: "2nd Year", section: "B", program: "BSCS", status: "Cleared", initials: "AW", color: "bg-cyan-100 text-cyan-600" },
  { id: "2021-0332", name: "Carlos Sainz", level: "3rd Year", section: "B", program: "BS-Math", status: "Not Cleared", initials: "CS", color: "bg-red-100 text-red-600" },
  { id: "2023-0192", name: "Lando Norris", level: "1st Year", section: "C", program: "BSHM", status: "Cleared", initials: "LN", color: "bg-yellow-100 text-yellow-600" },
  { id: "2020-0099", name: "Lewis Hamilton", level: "4th Year", section: "A", program: "Education", status: "Not Cleared", initials: "LH", color: "bg-slate-100 text-slate-600" },
];

const PROGRAMS = ["BSCS", "BSES", "BSHM", "BS-Math", "Education"];

/* ================= COMPONENT ================= */

export default function HomeContent() {
  const [students, setStudents] = useState<Student[]>(INITIAL_DATABASE);
  const [globalLevelFilter, setGlobalLevelFilter] = useState<YearLevel | "All">("All");
  const [tableSearch, setTableSearch] = useState("");
  const [tableLevelFilter, setTableLevelFilter] = useState<YearLevel | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const globalFilteredData = useMemo(() => {
    return globalLevelFilter === "All" 
      ? students 
      : students.filter(s => s.level === globalLevelFilter);
  }, [students, globalLevelFilter]);

  const chartData = useMemo(() => {
    return PROGRAMS.map((prog) => ({
      name: prog,
      cleared: globalFilteredData.filter(s => s.program === prog && s.status === "Cleared").length,
      notCleared: globalFilteredData.filter(s => s.program === prog && s.status === "Not Cleared").length,
    }));
  }, [globalFilteredData]);

  const tableResults = useMemo(() => {
    const q = tableSearch.toLowerCase();
    return students.filter((s) => {
      const matchLevel = tableLevelFilter === "All" || s.level === tableLevelFilter;
      const matchSearch = s.name.toLowerCase().includes(q) || s.id.includes(q);
      return matchLevel && matchSearch;
    });
  }, [students, tableSearch, tableLevelFilter]);

  useEffect(() => { setCurrentPage(1); }, [tableSearch, tableLevelFilter]);

  const totalPages = Math.ceil(tableResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = tableResults.slice(startIndex, startIndex + itemsPerPage);

  const toggleStudentStatus = useCallback((id: string) => {
    setStudents((prev) => prev.map((s) => 
      s.id === id ? { ...s, status: s.status === "Cleared" ? "Not Cleared" : "Cleared" } : s
    ));
    setSelectedStudent((prev) => prev && prev.id === id 
      ? { ...prev, status: prev.status === "Cleared" ? "Not Cleared" : "Cleared" } 
      : prev
    );
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      
      {/* ================= MODAL ================= */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
             <div className={`p-6 sm:p-8 ${selectedStudent.color} flex justify-between items-start`}>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{selectedStudent.name}</h2>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{selectedStudent.id}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-bold">
                 <div className="p-4 bg-slate-50 rounded-2xl">Program: {selectedStudent.program}</div>
                 <div className="p-4 bg-slate-50 rounded-2xl">{selectedStudent.level}</div>
              </div>
              <button
                onClick={() => toggleStudentStatus(selectedStudent.id)}
                className="w-full py-4 rounded-2xl font-black text-xs uppercase text-white bg-indigo-600 active:scale-95 transition-transform"
              >
                Toggle Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= GLOBAL ANALYTICS SECTION ================= */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div className="col-span-12 lg:col-span-9 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
               <h3 className="font-black uppercase text-[10px] sm:text-xs tracking-widest text-slate-400">Institutional Overview</h3>
               <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Real-time clearance tracking</p>
            </div>
            <div className="bg-slate-50 px-3 py-1 rounded-xl border flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-slate-400" />
              <select 
                className="bg-transparent text-[10px] sm:text-[11px] font-black uppercase tracking-wider p-2 outline-none cursor-pointer flex-grow"
                value={globalLevelFilter} 
                onChange={(e) => setGlobalLevelFilter(e.target.value as any)}
              >
                <option value="All">All Levels</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} 
                    dy={10} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="cleared" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={window?.innerWidth < 640 ? 12 : 24} />
                <Bar dataKey="notCleared" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={window?.innerWidth < 640 ? 12 : 24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Population</p>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter">{globalFilteredData.length}</h2>
          </div>

          <div className="bg-indigo-600 p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <ShieldCheck className="absolute -right-2 -bottom-2 opacity-10" size={80} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Cleared</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter">
              {globalFilteredData.filter(s => s.status === "Cleared").length}
            </h2>
          </div>
        </div>
      </div>

      {/* ================= INDEPENDENT STUDENT DIRECTORY ================= */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800">Student Directory</h2>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 mt-1">Independent search and filters</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-slate-50 px-4 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center">
              <select 
                value={tableLevelFilter}
                onChange={(e) => setTableLevelFilter(e.target.value as any)}
                className="bg-transparent text-[11px] font-bold outline-none py-3 cursor-pointer w-full"
              >
                <option value="All">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 focus:bg-white transition-all outline-none font-medium text-xs sm:text-sm"
                placeholder="Search..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* MOBILE CARDS VIEW (Visible only on small screens) */}
        <div className="block md:hidden divide-y divide-slate-50">
           {paginatedStudents.map((s) => (
               <div key={s.id} className="p-5 space-y-4">
                   <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 shrink-0 rounded-xl ${s.color} flex items-center justify-center font-black text-sm`}>{s.initials}</div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-700 text-sm truncate">{s.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{s.id}</p>
                        </div>
                   </div>
                   <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{s.level}</span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded ${s.status === "Cleared" ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{s.status}</span>
                        </div>
                        <button onClick={() => setSelectedStudent(s)} className="text-indigo-600 font-black text-[10px] uppercase">View Details</button>
                   </div>
               </div>
           ))}
        </div>

        {/* DESKTOP TABLE VIEW (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center font-black text-xs shadow-sm`}>{s.initials}</div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{s.level}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">{s.program}</td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      s.status === "Cleared" ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
                    >
                      <Eye size={14} className="inline mr-2" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedStudents.length === 0 && (
            <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest">No results found</div>
        )}

        {/* ================= PAGINATION ================= */}
        <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
            {tableResults.length} filtered entries
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-[10px] font-black transition-all ${
                    currentPage === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                >
                    {page}
                </button>
                ))}
            </div>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}