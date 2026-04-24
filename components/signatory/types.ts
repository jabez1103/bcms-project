export type ReqStatus = "active" | "draft" | "archived";
export type RequirementFormat = "Physical" | "Digital";

export interface Requirement {
  id: string;
  format: RequirementFormat;
  title: string;
  description: string;
  allowFileUpload: boolean;
  allowStudentNotes: boolean;
  targetYear: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  itemsToBring?: string;
  // Physical logistics
  officeLocation?: string;
  roomNumber?: string;
  officerName?: string;
  availableSchedule?: string;
  requiredDocuments?: string;
  // Meta
  reqStatus: ReqStatus;
}

export const DEFAULT_FORM: Omit<Requirement, "id"> = {
  format: "Digital",
  title: "", description: "",
  allowFileUpload: true, allowStudentNotes: false,
  targetYear: "All Years",
  startDate: "", endDate: "", location: "", itemsToBring: "",
  officeLocation: "", roomNumber: "", officerName: "",
  availableSchedule: "", requiredDocuments: "", reqStatus: "draft"
};
