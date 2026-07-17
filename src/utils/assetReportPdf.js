import { formatDate, formatDateTime, formatCurrency } from "@/utils/format";

const INK = [16, 21, 27];
const AMBER = [242, 169, 59];
const MUTED = [110, 120, 130];

/** Generates and downloads a professional maintenance report PDF for one asset. */
export async function generateAssetReportPDF({ asset, health, history = [] }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  // Header band
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(...AMBER);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MaintainIQ", margin, 40);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Asset Maintenance Report", margin, 56);
  doc.setTextColor(...MUTED);
  doc.setFontSize(9);
  doc.text(`Generated ${formatDateTime(new Date())}`, pageWidth - margin, 56, { align: "right" });

  y = 100;

  // Asset summary
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(asset.name, margin, y);
  y += 18;

  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(asset.assetCode, margin, y);
  y += 20;

  const summaryRows = [
    ["Category", asset.category || "—"],
    ["Location", asset.location || "—"],
    ["Condition", asset.condition || "—"],
    ["Status", asset.status || "—"],
    ["Last service", formatDate(asset.lastServiceDate)],
    ["Next service", formatDate(asset.nextServiceDate)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 9, textColor: INK, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 100 } },
    body: summaryRows,
  });

  y = doc.lastAutoTable.finalY + 20;

  // AI health analysis
  if (health) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text("AI Predictive Health Analysis", margin, y);
    y += 16;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: INK, textColor: AMBER },
      head: [["Health score", "Failure risk", "Est. remaining life", "Confidence"]],
      body: [[
        `${health.healthScore ?? "—"} / 100`,
        health.failureProbability || "—",
        health.remainingUsefulLife || "—",
        health.confidence || "—",
      ]],
    });
    y = doc.lastAutoTable.finalY + 14;

    if (health.basedOn?.totalCost != null) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(
        `Based on ${health.basedOn.issueCount} issue(s) · ${formatCurrency(health.basedOn.totalCost)} spent to date`,
        margin,
        y
      );
      y += 16;
    }

    if (health.recurringPattern) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("Recurring pattern:", margin, y);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(health.recurringPattern, pageWidth - margin * 2 - 100);
      doc.text(lines, margin + 100, y);
      y += lines.length * 12 + 8;
    }

    if (health.recommendation) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("Recommendation:", margin, y);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(health.recommendation, pageWidth - margin * 2 - 100);
      doc.text(lines, margin + 100, y);
      y += lines.length * 12 + 16;
    }
  }

  // History table
  if (history.length > 0) {
    if (y > 680) {
      doc.addPage();
      y = 50;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text("Asset History", margin, y);
    y += 12;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "striped",
      styles: { fontSize: 8.5, cellPadding: 5 },
      headStyles: { fillColor: INK, textColor: AMBER },
      head: [["Date", "Event", "Details"]],
      body: history.map((h) => [
        formatDateTime(h.createdAt),
        h.action,
        h.details || "—",
      ]),
    });
  }

  // Footer disclaimer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      "AI-generated content is advisory. Final maintenance decisions remain with qualified staff.",
      margin,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  doc.save(`${asset.assetCode}-maintenance-report.pdf`);
}
