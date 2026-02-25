import jsPDF from "jspdf";
import { format } from "date-fns";

export const generateResultPDF = (result) => {
  if (!result) return;

  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* ================= COLORS ================= */

  const NAVY = [11, 35, 74];
  const ORANGE = [234, 142, 10];
  const GRAY = [110, 110, 110];
  /* ================= PREMIUM DIAGONAL GRADIENT ================= */
  const gradX = 25;
  const gradY = 25;
  const gradWidth = pageWidth - 50;
  const gradHeight = pageHeight - 50;

  // Diagonal Gradient (Top-left → Bottom-right)
  const startColor = [245, 248, 255]; // light bluish white
  const endColor = [255, 255, 255]; // pure white

  for (let y = 0; y < gradHeight; y++) {
    for (let x = 0; x < gradWidth; x += 8) {
      const ratio = (x + y) / (gradWidth + gradHeight);

      const r = startColor[0] + (endColor[0] - startColor[0]) * ratio;
      const g = startColor[1] + (endColor[1] - startColor[1]) * ratio;
      const b = startColor[2] + (endColor[2] - startColor[2]) * ratio;

      doc.setFillColor(r, g, b);
      doc.rect(gradX + x, gradY + y, 8, 1, "F");
    }
  }

  /* ================= DOUBLE BORDER ================= */

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(2);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  /* ================= DATA ================= */

  const studentName = result?.student?.name ?? "Student Name";
  const examTitle = result?.exam?.title ?? "Course Title";
  const schoolName = result?.student?.school ?? "Partner School";

  try {
    doc.addImage("/logo.png", "PNG", 20, 18, 45, 20);
  } catch (err) {}

  /* ================= TITLE ================= */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...NAVY);
  doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 55, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...GRAY);
  doc.text("This is to formally certify that", pageWidth / 2, 70, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...ORANGE);
  doc.text(studentName, pageWidth / 2, 85, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);
  doc.text(`a student of ${schoolName}`, pageWidth / 2, 95, {
    align: "center",
  });

  doc.setFontSize(14);
  doc.setTextColor(...GRAY);
  doc.text(
    "has successfully completed the prescribed assessment requirements for",
    pageWidth / 2,
    110,
    { align: "center" },
  );

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(examTitle, pageWidth / 2, 120, {
    align: "center",
    maxWidth: pageWidth - 80,
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...NAVY);

  doc.text(
    `Achieved Score: ${result?.result?.score ?? 0} out of ${result?.result?.totalMarks ?? 0}`,
    pageWidth / 2,
    135,
    { align: "center" },
  );

  doc.text(
    `Overall Percentage: ${result?.result?.percentage ?? 0}%`,
    pageWidth / 2,
    143,
    { align: "center" },
  );

  const issueDate = result?.result?.verifiedAt || result?.result?.submittedAt;

  doc.setFontSize(11);
  doc.setTextColor(...NAVY);

  if (issueDate) {
    doc.text(
      `Issued on: ${format(new Date(issueDate), "dd MMMM yyyy")}`,
      25,
      pageHeight - 30,
    );
  }

  if (result?.result?.certificateId) {
    doc.text(
      `Certificate ID: ${result.result.certificateId}`,
      pageWidth - 90,
      pageHeight - 30,
    );
  }

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "This certificate has been electronically generated and validated by the authorized assessment authority. No physical signature is required.",
    pageWidth / 2,
    pageHeight - 18,
    { align: "center" },
  );

  const safeStudentName = studentName.replace(/[^a-zA-Z0-9]/g, "_");

  doc.save(
    `${safeStudentName}_Certificate_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`,
  );
};
