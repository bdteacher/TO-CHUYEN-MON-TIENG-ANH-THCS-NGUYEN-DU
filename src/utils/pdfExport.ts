import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  landscape?: boolean;
  pageTitle?: string;
  leftMarginMm?: number;
  rightMarginMm?: number;
  topMarginMm?: number;
  bottomMarginMm?: number;
}

/**
 * Standard Vietnamese administrative margins according to Nghị định 30/2020/NĐ-CP:
 * Top: 20-25mm, Bottom: 20-25mm, Left: 30-35mm, Right: 15-20mm
 */
const DEFAULT_MARGINS = {
  top: 15,
  bottom: 15,
  left: 20,
  right: 15,
};

/**
 * Exports an HTML element representing an administrative report to a standard A4 PDF
 * using html2canvas and jsPDF to ensure 100% accurate Vietnamese diacritics,
 * standard administrative borders, fonts, and table layouts.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = 'Bao_cao_hanh_chinh.pdf',
    landscape = false,
    leftMarginMm = DEFAULT_MARGINS.left,
    rightMarginMm = DEFAULT_MARGINS.right,
    topMarginMm = DEFAULT_MARGINS.top,
    bottomMarginMm = DEFAULT_MARGINS.bottom,
  } = options;

  // A4 dimensions in mm
  const pdfWidthMm = landscape ? 297 : 210;
  const pdfHeightMm = landscape ? 210 : 297;

  const contentWidthMm = pdfWidthMm - leftMarginMm - rightMarginMm;
  const contentHeightMm = pdfHeightMm - topMarginMm - bottomMarginMm;

  // Create a clone in a wrapper with standard paper styling for rendering
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = '800px';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.color = '#111827';
  wrapper.style.fontFamily = '"Times New Roman", Times, serif';
  wrapper.style.fontSize = '14px';
  wrapper.style.lineHeight = '1.5';
  wrapper.style.padding = '24px';
  wrapper.style.boxSizing = 'border-box';
  wrapper.className = 'official-pdf-export-wrapper';

  const clonedNode = element.cloneNode(true) as HTMLElement;

  // Remove any elements marked with 'no-print' in the cloned node
  const noPrintElements = clonedNode.querySelectorAll('.no-print');
  noPrintElements.forEach((el) => el.remove());

  wrapper.appendChild(clonedNode);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2, // High resolution (retina)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF({
      orientation: landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Calculate scaling
    const imgWidth = contentWidthMm;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = topMarginMm;

    // First page
    pdf.addImage(imgData, 'PNG', leftMarginMm, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= contentHeightMm;

    // Multi-page handling if content exceeds one A4 page
    let pageNumber = 1;
    while (heightLeft > 0) {
      position = topMarginMm - pageNumber * contentHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', leftMarginMm, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= contentHeightMm;
      pageNumber++;
    }

    // Save PDF
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    // Clean up temporary DOM element
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}
