import type { NotificationRole, NotificationType } from "@/lib/notificationTypes";

/**
 * Canonical in-app path for a notification (no query params).
 * Used by the notifications API, push payloads, and header navigation.
 */
export function getNotificationBasePath(
  role: NotificationRole,
  type: NotificationType,
  targetId?: number | null
): string {
  if (type === "password_reset_requested") {
    if (targetId) {
      return `/admin/user-accounts?search=${encodeURIComponent(String(targetId))}`;
    }
    return "/admin/user-accounts";
  }
  if (type === "password_reset_completed") {
    return "/login";
  }

  if (role === "student") {
    if (
      (type === "submission_approved" || type === "submission_rejected") &&
      targetId
    ) {
      return `/student/signatories/${targetId}`;
    }
    if (type === "period_closed") {
      return "/student/home";
    }
    if (type === "period_opened") {
      return "/student/signatories";
    }
    return "/student/home";
  }

  if (role === "signatory") {
    if (type === "submission_received" && targetId) {
      return `/signatory/review-submissions?requirementId=${targetId}`;
    }
    if (type === "period_opened" || type === "period_closed") {
      return "/signatory/review-submissions";
    }
    return "/signatory/home";
  }

  if (role === "admin") {
    if (type === "period_opened" || type === "period_closed") {
      return "/admin/clearance-periods";
    }
    return "/admin/home";
  }

  return "/";
}

export function appendNotificationReadParam(path: string, notificationId: number): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}notificationId=${notificationId}`;
}
