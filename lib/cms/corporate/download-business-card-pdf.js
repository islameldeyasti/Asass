/**
 * Export printable front/back business cards to PDF (85×55mm each).
 */

export async function downloadBusinessCardPdf({
  rootSelector = '.bc-print-root',
  fileName = 'ASAS-Business-Card.pdf',
  onProgress,
} = {}) {
  const root = document.querySelector(rootSelector);
  if (!root) throw new Error('Business card preview not found');
  const faces = Array.from(root.querySelectorAll('.bc-face'));
  if (!faces.length) throw new Error('No card faces to export');

  onProgress?.('Preparing PDF…');
  const [{jsPDF}, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  const html2canvas = html2canvasModule.default || html2canvasModule;

  const pdf = new jsPDF({
    unit: 'mm',
    format: [85, 55],
    orientation: 'landscape',
    compress: true,
  });

  for (let i = 0; i < faces.length; i += 1) {
    onProgress?.(`Rendering ${i === 0 ? 'front' : 'back'}…`);
    const canvas = await html2canvas(faces[i], {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    const img = canvas.toDataURL('image/jpeg', 0.95);
    if (i > 0) pdf.addPage([85, 55], 'landscape');
    pdf.addImage(img, 'JPEG', 0, 0, 85, 55, undefined, 'FAST');
  }

  onProgress?.('Saving…');
  const safe = String(fileName || 'ASAS-Business-Card')
    .replace(/[^\w\u0600-\u06FF\- ]+/g, '')
    .trim()
    .slice(0, 80);
  pdf.save(`${safe || 'ASAS-Business-Card'}.pdf`);
}
