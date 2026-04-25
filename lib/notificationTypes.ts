export type NotificationRole = "student" | "admin" | "signatory";

export type NotificationType =
  | "submission_received"
  | "submission_approved"
  | "submission_rejected"
  | "period_opened"
  | "period_closed"
  | "password_reset_requested";
