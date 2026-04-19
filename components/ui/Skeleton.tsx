import React from "react";


//  Base animated skeleton block
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-xl ${className}`}
    />
  );
}

//   Skeleton for stat cards (used in Admin Dashboard + Clearance Progress)
export function SkeletonStatCard() {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
      <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

//   Skeleton for table rows
export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-8 py-5">
          <Skeleton className={`h-4 ${i === 0 ? "w-40" : "w-24"}`} />
          {i === 0 && <Skeleton className="h-3 w-28 mt-2" />}
        </td>
      ))}
    </tr>
  );
}

//   Skeleton for user table rows (with avatar)
export function SkeletonUserRow() {
  return (
    <tr className="border-b border-slate-50">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </td>
      <td className="px-8 py-5"><Skeleton className="h-6 w-20 rounded-md" /></td>
      <td className="px-8 py-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
      <td className="px-8 py-5 text-right">
        <div className="flex justify-end gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </td>
    </tr>
  );
}

//   Skeleton for clearance status cards (Student page)
export function SkeletonSignatoryCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* Card header */}
      <div className="p-5 bg-slate-100 animate-pulse flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-slate-200" />
          <Skeleton className="h-3 w-36 bg-slate-200" />
        </div>
        <Skeleton className="w-11 h-11 rounded-xl bg-slate-200 shrink-0" />
      </div>
      {/* Card body */}
      <div className="p-6 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      {/* Card footer */}
      <div className="px-5 py-4 border-t border-slate-100 flex justify-between items-center">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

//   Skeleton for admin dashboard table rows (with avatar)
export function SkeletonDashboardRow() {
  return (
    <tr className="border-b border-slate-50">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="px-8 py-5"><Skeleton className="h-4 w-16" /></td>
      <td className="px-8 py-5"><Skeleton className="h-4 w-20" /></td>
      <td className="px-8 py-5"><Skeleton className="h-6 w-24 rounded-full" /></td>
      <td className="px-8 py-5 text-right"><Skeleton className="h-8 w-16 rounded-xl ml-auto" /></td>
    </tr>
  );
}

//   Skeleton for clearance progress table rows (with progress bar)
export function SkeletonProgressRow() {
  return (
    <tr className="border-b border-slate-50">
      <td className="px-8 py-6">
        <Skeleton className="h-4 w-36 mb-2" />
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-8 py-6">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-3 w-16" />
      </td>
      <td className="px-8 py-6 w-64">
        <div className="flex items-center gap-3">
          <Skeleton className="flex-1 h-2 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      </td>
      <td className="px-8 py-6"><Skeleton className="h-6 w-24 rounded-lg" /></td>
    </tr>
  );
}

//  Skeleton for chart area
export function SkeletonChart() {
  return (
    <div className="animate-pulse space-y-3 pt-4">
      <div className="flex items-end gap-4 h-48 px-4">
        {[60, 80, 45, 90, 55, 70, 40].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end gap-1">
            <div className="bg-slate-200 rounded-t-md" style={{ height: `${h}%` }} />
            <div className="bg-slate-100 rounded-t-md" style={{ height: `${100 - h}%` }} />
          </div>
        ))}
      </div>
      <div className="flex justify-around px-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-10" />
        ))}
      </div>
    </div>
  );
}

// Skeleton for Clearance Period table rows
export function SkeletonPeriodRow() {
  return (
    <tr className="border-b border-slate-50">
      <td className="px-8 py-6">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-8 py-6">
        <Skeleton className="h-4 w-48" />
      </td>
      <td className="px-8 py-6">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="px-8 py-6">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="px-8 py-6">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </td>
    </tr>
  );
}

// Skeleton for Clearance Period form panel
export function SkeletonPeriodForm() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl animate-pulse space-y-6">
      <Skeleton className="h-6 w-36" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  );
}

// Skeleton for User Management header + filter bar
export function SkeletonUserHeader() {
  return (
    <div className="animate-pulse space-y-6 mb-8 md:mb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-36 rounded-2xl" />
          <Skeleton className="h-12 w-44 rounded-2xl" />
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center gap-4">
        <div className="flex gap-2 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 flex-1 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-4 w-32 hidden sm:block" />
      </div>
    </div>
  );
}