export interface Signatory {
  id: number;
  person: {
    id: number;
    name: string;
    avatar: string;
  };
  role: string;
  status: 'Approved' | 'Pending' | 'Not Submitted'; 
  subStatus?: 'In Queue' | 'Rejected' | '';        
  rejectionComment?: string;                       
  requirements: string[];
  description: string;
}

// Mock Data Array
export const signatories: Signatory[] = [
  {
    id: 1,
    person: {
      id: 1,
      name: "Rebecca C. Remulta",
      avatar: "/avatars/rebecca.png",
    },
    role: "Cashier",
    status: "Approved",
    requirements: [
      "Official Receipt Verification",
      "Tuition Balance Check",
      "Cash Clearance Stamp"
    ],
    description: "Responsible for verifying tuition and miscellaneous payments."
  },
  {
    id: 2,
    person: {
      id: 2,
      name: "Carmella C. Sarabello",
      avatar: "/avatars/carmella.png",
    },
    role: "Librarian",
    status: "Pending",
    subStatus: "In Queue",
    requirements: [
      "Return borrowed books",
      "Pay overdue fines",
      "Library clearance slip"
    ],
    description: "Oversees book returns and library obligations."
  },
  {
    id: 3,
    person: {
      id: 3,
      name: "Rey Anthony G. Godmalin",
      avatar: "/avatars/rey.png",
    },
    role: "Dean",
    status: "Pending",
    subStatus: "Rejected",
    rejectionComment: "The uploaded clearance form is missing the department seal.",
    requirements: ["Final Interview", "Grade Verification"],
    description: "Responsible for endorsing graduation eligibility."
  },
  {
    id: 14,
    person: {
      id: 14,
      name: "Dr. Jose Rizal",
      avatar: "/avatars/rizal.png",
    },
    role: "Clinic / Medical",
    status: "Not Submitted",
    subStatus: "", 
    rejectionComment: undefined, 
    requirements: ["Medical Clearance Form", "Health Certificate"],
    description: "Responsible for endorsing medical clearance for students."
  }
];