/**
 * Client-side A4 PDF download from letterhead pages (no browser print UI).
 */

export async function downloadLetterheadPdf({
  rootSelector = '.lh-print-root',
  fileName = 'ASAS-Letter.pdf',
  onProgress,
} = {}) {
  const root = document.querySelector(rootSelector);
  if (!root) {
    throw new Error('Letter document not found');
  }

  const pages = Array.from(root.querySelectorAll('.lh-a4-page'));
  if (!pages.length) {
    throw new Error('No A4 pages to export');
  }

  onProgress?.('Preparing PDF…');

  const [{jsPDF}, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  const html2canvas = html2canvasModule.default || html2canvasModule;

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true,
  });

  for (let i = 0; i < pages.length; i += 1) {
    onProgress?.(`Rendering page ${i + 1} of ${pages.length}…`);
    const page = pages[i];
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
    });
    const img = canvas.toDataURL('image/jpeg', 0.92);
    if (i > 0) pdf.addPage();
    pdf.addImage(img, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  onProgress?.('Saving…');
  const safeName = String(fileName || 'ASAS-Letter')
    .replace(/[^\w\u0600-\u06FF\- ]+/g, '')
    .trim()
    .slice(0, 80);
  pdf.save(`${safeName || 'ASAS-Letter'}.pdf`);
}
