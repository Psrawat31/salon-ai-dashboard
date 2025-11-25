// src/pages/api/call-sheet.js
import PDFDocument from "pdfkit";
import blobStream from "blob-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const { customers } = await req.json();

    const doc = new PDFDocument({ margin: 30 });
    const stream = doc.pipe(blobStream());

    doc.fontSize(20).text("Daily Call Sheet", { underline: true });
    doc.moveDown();

    customers.forEach((c, idx) => {
      const days = c.daysSinceLastVisit ?? "-";
      doc
        .fontSize(14)
        .text(`${idx + 1}. ${c.name} — ₹${c.revenue}`, { bold: true });

      doc.fontSize(12).text(`Service: ${c.service}`);
      doc.text(`Days Since Visit: ${days}`);
      doc.text(`Offer: ${c.offer}`);
      doc.text(`Script: ${c.script}`);
      doc.moveDown(1.2);
    });

    doc.end();

    const buffer = await new Response(stream.toBlob("application/pdf")).arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=call-sheet.pdf",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
