"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const APP_NAME = "BISU Clearance";

function titleFromPath(pathname: string): string {
  if (pathname === "/") return `Welcome | ${APP_NAME}`;
  if (pathname === "/login") return `Login | ${APP_NAME}`;
  if (pathname === "/helpandsupport") return `Help & Support | ${APP_NAME}`;
  if (pathname === "/unauthorized") return `Unauthorized | ${APP_NAME}`;

  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/home")) return `Admin Home | ${APP_NAME}`;
    if (pathname.startsWith("/admin/user-accounts")) return `User Accounts | ${APP_NAME}`;
    if (pathname.startsWith("/admin/clearance-periods")) return `Clearance Periods | ${APP_NAME}`;
    if (pathname.startsWith("/admin/clearance-progress")) return `Clearance Progress | ${APP_NAME}`;
    if (pathname.startsWith("/admin/profile")) return `Admin Profile | ${APP_NAME}`;
    return `Admin | ${APP_NAME}`;
  }

  if (pathname.startsWith("/student")) {
    if (pathname.startsWith("/student/home")) return `Student Home | ${APP_NAME}`;
    if (pathname.startsWith("/student/signatories/")) return `Signatory Requirement | ${APP_NAME}`;
    if (pathname.startsWith("/student/signatories")) return `Signatories | ${APP_NAME}`;
    if (pathname.startsWith("/student/activity-logs/recent-logs")) return `Recent Activity Logs | ${APP_NAME}`;
    if (pathname.startsWith("/student/activity-logs/system-history")) return `System History | ${APP_NAME}`;
    if (pathname.startsWith("/student/profile")) return `Student Profile | ${APP_NAME}`;
    return `Student | ${APP_NAME}`;
  }

  if (pathname.startsWith("/signatory")) {
    if (pathname.startsWith("/signatory/home")) return `Signatory Home | ${APP_NAME}`;
    if (pathname.startsWith("/signatory/manage-requirements")) return `Manage Requirements | ${APP_NAME}`;
    if (pathname.startsWith("/signatory/student-clearance-status")) return `Student Clearance Status | ${APP_NAME}`;
    if (pathname.startsWith("/signatory/review-submissions")) return `Review Submissions | ${APP_NAME}`;
    if (pathname.startsWith("/signatory/profile")) return `Signatory Profile | ${APP_NAME}`;
    return `Signatory | ${APP_NAME}`;
  }

  return APP_NAME;
}

export function RouteDocumentTitle() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    document.title = titleFromPath(pathname);
  }, [pathname]);

  return null;
}

