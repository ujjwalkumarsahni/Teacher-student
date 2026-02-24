// frontend/src/utils/resultPdfGenerator.js

import jsPDF from "jspdf";
import { format } from "date-fns";

export const generateResultPDF = (result) => {
  if (!result) return;

  const doc = new jsPDF("landscape");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* ================= COLORS ================= */
  const NAVY = [11, 35, 74];     // #0B234A
  const ORANGE = [234, 142, 10]; // #EA8E0A
  const RED = [226, 34, 19];     // #E22213

  /* ================= BACKGROUND ================= */

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 25, "F");

  doc.setFillColor(...ORANGE);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");

  /* ================= BORDER ================= */

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  /* ================= COMPANY LOGO ================= */

  try {
    doc.addImage("/logo.png", "PNG", 20, 12, 30, 12);
  } catch (err) {
    console.warn("Logo not found");
  }

  /* ================= TITLE ================= */

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("CERTIFICATE OF ACHIEVEMENT", pageWidth / 2, 17, {
    align: "center",
  });

  /* ================= MAIN BODY ================= */

  doc.setTextColor(...NAVY);
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("This is proudly presented to", pageWidth / 2, 55, {
    align: "center",
  });

  /* ================= STUDENT NAME ================= */

  doc.setFontSize(34);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ORANGE);
  doc.text(
    result?.student?.name ?? "Student Name",
    pageWidth / 2,
    75,
    { align: "center" }
  );

  /* ================= EMAIL ================= */

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(
    result?.student?.email ?? "student@email.com",
    pageWidth / 2,
    85,
    { align: "center" }
  );

  /* ================= CERT TEXT ================= */

  doc.setFontSize(16);
  doc.setTextColor(...NAVY);

  const certText = `for successfully completing "${result?.exam?.title ?? "-"}"
and demonstrating outstanding performance.`;

  doc.text(certText, pageWidth / 2, 105, {
    align: "center",
    maxWidth: pageWidth - 120,
  });

  /* ================= SCORE SECTION ================= */

  const scoreBoxWidth = 140;
  const scoreBoxX = pageWidth / 2 - scoreBoxWidth / 2;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(scoreBoxX, 120, scoreBoxWidth, 50, 6, 6, "F");

  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(2);
  doc.roundedRect(scoreBoxX, 120, scoreBoxWidth, 50, 6, 6, "S");

  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text("FINAL SCORE", pageWidth / 2, 135, { align: "center" });

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${result?.result?.score ?? 0} / ${result?.result?.totalMarks ?? 0}`,
    pageWidth / 2,
    150,
    { align: "center" }
  );

  /* ================= PERCENTAGE ================= */

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Percentage: ${result?.result?.percentage ?? 0}%`,
    pageWidth / 2,
    165,
    { align: "center" }
  );

  /* ================= STATUS BADGE ================= */

  const status = result?.result?.status ?? "-";
  const isPass = status === "PASS";

  doc.setFillColor(...(isPass ? ORANGE : RED));
  doc.roundedRect(pageWidth / 2 - 30, 175, 60, 18, 5, 5, "F");

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(status, pageWidth / 2, 187, { align: "center" });

  /* ================= CERTIFICATE ID ================= */

  if (result?.result?.certificateId) {
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.text(
      `Certificate ID: ${result.result.certificateId}`,
      pageWidth - 80,
      pageHeight - 30
    );
  }

  /* ================= DATE & SIGNATURE ================= */

  doc.setFontSize(12);
  doc.setTextColor(...NAVY);

  doc.text(
    `Date of Issue: ${format(
      new Date(result?.result?.verifiedAt || result?.result?.submittedAt),
      "dd MMMM yyyy"
    )}`,
    40,
    pageHeight - 35
  );

  doc.text("Authorized Signature", pageWidth - 80, pageHeight - 40);
  doc.setDrawColor(...NAVY);
  doc.line(pageWidth - 100, pageHeight - 45, pageWidth - 40, pageHeight - 45);

  /* ================= SAVE ================= */

  doc.save(
    `${result?.exam?.title ?? "Exam"}_Certificate_${format(
      new Date(),
      "yyyyMMdd_HHmm"
    )}.pdf`
  );
};