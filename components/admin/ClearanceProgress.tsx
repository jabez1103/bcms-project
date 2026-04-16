"use client";

import React, { useState } from 'react';
import { Footer } from '../Footer';

export default function ClearanceProgress() {
  // 1. Filter States
  const [filters, setFilters] = useState({
    department: "All Departments",
    program: "All Programs",
    yearLevel: "All Years"
  });

  // 2. Mock Summary Stats
  const stats = [
    { label: "Total Students", value: "1,240", icon: "👥", color: "bg-blue-50 text-blue-600" },
    { label: "Completed", value: "856", icon: "✅", color: "bg-emerald-50 text-emerald-600" },
    { label: "Pending Review", value: "124", icon: "⏳", color: "bg-amber-50 text-amber-600" },
    { label: "Incomplete", value: "260", icon: "❌", color: "bg-rose-50 text-rose-600" },
  ];

  // 3. Mock Student Data
  const studentProgress = [
    { id: "2023-001", name: "Alice Johnson", program: "BSCS", year: "3rd Year", progress: 100, status: "Completed" },
    { id: "2023-042", name: "Bob Smith", program: "BSIT", year: "4th Year", progress: 65, status: "Pending" },
    { id: "2024-112", name: "Charlie Davis", program: "BSEE", year: "2nd Year", progress: 20, status: "Incomplete" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Clearance Progress</h1>
          <p className="text-slate-500 mt-1 text-lg">Real-time overview of student requirement fulfillment.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
              <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Actions Bar */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              <select 
                className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              >
                <option>All Departments</option>
                <option>College of Engineering</option>
                <option>College of Arts & Sciences</option>
              </select>

              <select 
                className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.program}
                onChange={(e) => setFilters({...filters, program: e.target.value})}
              >
                <option>All Programs</option>
                <option>BSCS</option>
                <option>BSIT</option>
              </select>

              <select 
                className="bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={filters.yearLevel}
                onChange={(e) => setFilters({...filters, yearLevel: e.target.value})}
              >
                <option>All Years</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
            
            <button className="w-full lg:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200">
              Generate Report
            </button>
          </div>
        </section>

        {/* Detailed Progress Table */}
        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Year / Program</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studentProgress.map((student) => (
                  <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-800">{student.name}</p>
                      <p className="text-xs font-medium text-slate-400">{student.id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-600">{student.year}</p>
                      <p className="text-xs text-slate-400">{student.program}</p>
                    </td>
                    <td className="px-8 py-6 w-64">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              student.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-400 w-8">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                         student.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                         student.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                       }`}>
                         {student.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-xs font-bold text-indigo-600 hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center text-xs font-bold text-slate-400">
            <p>Showing 1-3 of 1,240 students</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border border-slate-200 rounded-md shadow-sm hover:text-indigo-600 transition-colors">Prev</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded-md shadow-sm hover:text-indigo-600 transition-colors">Next</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}