import {
  Document, Paragraph, TextRun,
  Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, Packer,
} from "docx";
import { saveAs } from "file-saver";

/* ─── Types ─────────────────────────────────────────── */
export interface ClearanceRecord {
  name: string;
  studentId: string;
  program: string;
  year: string;
  section: string;
}
export interface SignatoryProgress {
  name: string;
  role: string;
  status: string;
}

/* ─── Border helpers ────────────────────────────────── */
const N = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const cellBorder = { top: N, bottom: N, left: N, right: N };
const tableBorder = { top: N, bottom: N, left: N, right: N, insideH: N, insideV: N };

/* ─── Spacing helper ────────────────────────────────── */
const sp = (before = 0, after = 0) => ({ before, after });

/* ─── Blank paragraph ───────────────────────────────── */
const blank = (h = 120) =>
  new Paragraph({ spacing: sp(0, h), children: [new TextRun({ text: " " })] });

/* ═══════════════════════════════════════════════════════
   SIGNATURE BLOCK helpers
   Each block: sig line → NAME underlined bold → Role italic
════════════════════════════════════════════════════════ */
function sigBlock(
  sig: SignatoryProgress | undefined,
  fallback: string,
  dateToday: string,
  topSpacing = 320,
): Paragraph[] {
  const approved = sig?.status === "Approved";
  return [
    new Paragraph({
      spacing: sp(topSpacing, 0),
      children: approved
        ? [
            new TextRun({ text: "DIGITALLY APPROVED", bold: true, color: "16a34a", size: 18 }),
            new TextRun({ text: `  ${dateToday}`, italics: true, color: "16a34a", size: 14 }),
          ]
        : [new TextRun({ text: "_______________________________", size: 20 })],
    }),
    new Paragraph({
      spacing: sp(0, 0),
      children: [
        new TextRun({
          text: (sig?.name || "").toUpperCase(),
          bold: true,
          underline: { type: "single" },
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      spacing: sp(0, 80),
      children: [
        new TextRun({ text: sig?.role || fallback, italics: true, size: 16, color: "444444" }),
      ],
    }),
  ];
}

function sigCell(
  sig: SignatoryProgress | undefined,
  fallback: string,
  dateToday: string,
  widthPct: number,
  topSpacing = 320,
): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: cellBorder,
    children: sigBlock(sig, fallback, dateToday, topSpacing),
  });
}

function emptyCell(widthPct: number): TableCell {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    borders: cellBorder,
    children: [new Paragraph({ children: [new TextRun({ text: " " })] })],
  });
}

/* ═══════════════════════════════════════════════════════
   DOCUMENT 1 — SAS INTERNAL CLEARANCE
   • 2-column grid of all non-key SAS signatories
   • Last signatory centered alone at the bottom
════════════════════════════════════════════════════════ */
function buildInternalClearance(
  record: ClearanceRecord,
  sasGroup: SignatoryProgress[],
  semAY: string,
  courseYrSec: string,
  dateToday: string,
): (Paragraph | Table)[] {
  // Split into pairs; if odd, last one is alone (centered)
  const paired: (SignatoryProgress | null)[][] = [];
  const last = sasGroup.length % 2 === 1 ? sasGroup[sasGroup.length - 1] : null;
  const body = last ? sasGroup.slice(0, -1) : sasGroup;
  for (let i = 0; i < body.length; i += 2)
    paired.push([body[i], body[i + 1] ?? null]);

  const gridRows = paired.map(
    ([a, b]) =>
      new TableRow({
        children: [
          sigCell(a ?? undefined, "", dateToday, 50),
          b ? sigCell(b, "", dateToday, 50) : emptyCell(50),
        ],
      }),
  );

  return [
    /* ── Header ── */
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: sp(0, 40),
      children: [
        new TextRun({ text: "STUDENT AFFAIRS AND SERVICES OFFICE", bold: true, size: 26, font: "Times New Roman" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: sp(0, 40),
      children: [new TextRun({ text: semAY, size: 22, font: "Times New Roman" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: sp(0, 280),
      children: [
        new TextRun({ text: "INTERNAL CLEARANCE", bold: true, size: 24, underline: { type: "single" }, font: "Times New Roman" }),
      ],
    }),

    /* ── Student info ── */
    new Paragraph({
      spacing: sp(0, 80),
      children: [
        new TextRun({ text: "Name of Student :  ", bold: true, size: 22 }),
        new TextRun({ text: record.name, underline: { type: "single" }, size: 22 }),
      ],
    }),
    new Paragraph({
      spacing: sp(0, 300),
      children: [
        new TextRun({ text: "Course, Year and Section :  ", bold: true, size: 22 }),
        new TextRun({ text: courseYrSec, underline: { type: "single" }, size: 22 }),
      ],
    }),

    /* ── 2-col signature grid ── */
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorder,
      rows: gridRows,
    }),

    /* ── Last signatory centered ── */
    ...(last
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: sp(360, 0),
            children: last.status === "Approved"
              ? [
                  new TextRun({ text: "DIGITALLY APPROVED", bold: true, color: "16a34a", size: 18 }),
                  new TextRun({ text: `  ${dateToday}`, italics: true, color: "16a34a", size: 14 }),
                ]
              : [new TextRun({ text: "_______________________________", size: 20 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: sp(0, 0),
            children: [
              new TextRun({ text: last.name.toUpperCase(), bold: true, underline: { type: "single" }, size: 18 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: sp(0, 120),
            children: [new TextRun({ text: last.role, italics: true, size: 16, color: "444444" })],
          }),
        ]
      : []),

    /* ── Footer ── */
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: sp(400, 0),
      children: [
        new TextRun({ text: `Generated by BCMS  •  ${dateToday}`, italics: true, size: 14, color: "888888" }),
      ],
    }),
  ];
}

/* ═══════════════════════════════════════════════════════
   DOCUMENT 2 — CLEARANCE FOR NON-GRADUATING STUDENTS
   Layout per copy (3-column table):
     Col 1 (33%) │ Col 2 (33%)   │ Col 3 (33%)
     ─────────── │ ─────────────  │ ─────────────
     Report Card │ Cashier sig   │ Librarian sig
     Received by │               │
     ___  Student│               │
     Date: ___   │ Director SAS  │ Dean sig
     Sem: ___    │               │
     A.Y.: ___   │               │
════════════════════════════════════════════════════════ */
function nonGradCopyBlock(
  copyLabel: string,
  record: ClearanceRecord,
  courseYrSec: string,
  cashier: SignatoryProgress | undefined,
  librarian: SignatoryProgress | undefined,
  dean: SignatoryProgress | undefined,
  dirSAS: SignatoryProgress | undefined,
  dateToday: string,
): (Paragraph | Table)[] {
  /* Left column — Report Card & Semester info */
  const leftCol = new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    borders: cellBorder,
    children: [
      new Paragraph({ spacing: sp(0, 60), children: [new TextRun({ text: "Report Card", size: 20 })] }),
      new Paragraph({ spacing: sp(0, 60), children: [new TextRun({ text: "Received by:", size: 20 })] }),
      new Paragraph({ spacing: sp(0, 0), children: [new TextRun({ text: "__________________________", size: 20 })] }),
      new Paragraph({ spacing: sp(0, 200), children: [new TextRun({ text: "Student", italics: true, size: 18 })] }),
      new Paragraph({ spacing: sp(0, 60), children: [new TextRun({ text: "Date: ___________________", size: 18 })] }),
      new Paragraph({ spacing: sp(0, 60), children: [new TextRun({ text: "Semester: _______________", size: 18 })] }),
      new Paragraph({ spacing: sp(0, 0), children: [new TextRun({ text: "A.Y.:  __________________", size: 18 })] }),
    ],
  });

  /* Middle column — Cashier (top), Director SAS (bottom) */
  const midCol = new TableCell({
    width: { size: 33, type: WidthType.PERCENTAGE },
    borders: cellBorder,
    children: [
      ...sigBlock(cashier, "Cashier", dateToday, 0),
      blank(180),
      ...sigBlock(dirSAS, "Director, SAS", dateToday, 0),
    ],
  });

  /* Right column — Librarian (top), Dean (bottom) */
  const rightCol = new TableCell({
    width: { size: 34, type: WidthType.PERCENTAGE },
    borders: cellBorder,
    children: [
      ...sigBlock(librarian, "Librarian", dateToday, 0),
      blank(180),
      ...sigBlock(dean, "Dean", dateToday, 0),
    ],
  });

  return [
    /* Copy label top-right */
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: sp(200, 0),
      children: [new TextRun({ text: copyLabel, bold: true, italics: true, size: 18 })],
    }),

    /* Title */
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: sp(0, 100),
      children: [
        new TextRun({ text: "CLEARANCE FOR NON-GRADUATING STUDENTS", bold: true, size: 22, font: "Times New Roman" }),
      ],
    }),

    /* Certification text */
    new Paragraph({
      spacing: sp(0, 160),
      children: [
        new TextRun({ text: "This is to certify that  ", size: 20 }),
        new TextRun({ text: record.name, bold: true, underline: { type: "single" }, size: 20 }),
        new TextRun({ text: `  (${courseYrSec})`, size: 20 }),
        new TextRun({
          text: "  is cleared from financial obligations and property accountability / liability from:",
          size: 20,
        }),
      ],
    }),

    /* 3-column signature table */
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorder,
      rows: [new TableRow({ children: [leftCol, midCol, rightCol] })],
    }),

    /* Dashed separator */
    new Paragraph({
      spacing: sp(220, 0),
      children: [new TextRun({ text: "- ".repeat(55), color: "bbbbbb", size: 14 })],
    }),
  ];
}

/* ═══════════════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════════════════ */
export async function downloadClearanceDoc(
  record: ClearanceRecord,
  signatories: SignatoryProgress[],
): Promise<void> {
  if (!record || signatories.length === 0) return;

  const dateToday = new Date().toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
  });
  const semAY = "2nd Semester, A.Y. 2024–2025";
  const courseYrSec = `${record.program} ${record.year} – Sec. ${record.section}`;

  /* Split signatories into groups */
  const KEY = ["dean", "librarian", "cashier", "director, sas", "student affairs services"];
  const isKey = (role: string) => KEY.some(k => (role || "").toLowerCase().includes(k));

  const sasGroup = signatories.filter(s => !isKey(s.role));
  const cashier  = signatories.find(s => (s.role || "").toLowerCase().includes("cashier"));
  const librarian = signatories.find(s => (s.role || "").toLowerCase().includes("librarian"));
  const dean     = signatories.find(s => (s.role || "").toLowerCase().includes("dean"));
  const dirSAS   = signatories.find(s =>
    (s.role || "").toLowerCase().includes("director, sas") ||
    (s.role || "").toLowerCase().includes("student affairs services"),
  );

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [
      /* Page 1 — Internal Clearance */
      {
        properties: {},
        children: buildInternalClearance(record, sasGroup, semAY, courseYrSec, dateToday),
      },
      /* Page 2 — Non-Graduating Clearance (3 copies) */
      {
        properties: {},
        children: [
          ...nonGradCopyBlock("Registrar's Copy", record, courseYrSec, cashier, librarian, dean, dirSAS, dateToday),
          ...nonGradCopyBlock("Dean's Copy",       record, courseYrSec, cashier, librarian, dean, dirSAS, dateToday),
          ...nonGradCopyBlock("Student's Copy",    record, courseYrSec, cashier, librarian, dean, dirSAS, dateToday),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: sp(80, 0),
            children: [
              new TextRun({ text: "F-SAS-REG-012  |  Rev. 2  |  07/01/24  |  Page 1 of 1", size: 14, color: "888888" }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Clearance_${record.studentId}_${record.name.replace(/ /g, "_")}.docx`);
}
