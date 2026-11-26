import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Product } from '../types/resale';

export interface QrSheetExportResult {
  count: number;
  pages: number;
  filename: string;
}

const formatAsciiBDT = (amount: number): string => {
  return `TK ${Math.round(amount).toLocaleString('en-US')}`;
};

export async function generateInventoryQrSheetPdf(
  items: Product[],
  filterSummary?: string
): Promise<QrSheetExportResult> {
  if (!items || items.length === 0) {
    throw new Error('No inventory SKUs available to export.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 12;
  const headerBottomY = 20;
  const bottomMargin = 10;

  const cols = 3;
  const rows = 5;
  const perPage = cols * rows;
  const gutterX = 4;
  const gutterY = 4;

  const cardWidth = (pageWidth - marginX * 2 - gutterX * (cols - 1)) / cols;
  const cardHeight =
    (pageHeight - headerBottomY - 2 - bottomMargin - gutterY * (rows - 1)) / rows;

  const totalPages = Math.ceil(items.length / perPage);
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10);
  const generatedLabel = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const qrDataUrls = await Promise.all(
    items.map((item) =>
      QRCode.toDataURL(item.sku, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 280,
        color: {
          dark: '#171513',
          light: '#FFFFFF'
        }
      })
    )
  );

  const drawPageHeader = (pageNum: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(23, 21, 19);
    doc.text('DHAKA ARCHIVE VAULT — PRINTABLE SKU HANGTAG SHEET', marginX, 11.5);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(122, 113, 101);
    const metaText = `${items.length} SKU${items.length === 1 ? '' : 's'} · Generated ${generatedLabel}${
      filterSummary ? ` · ${filterSummary}` : ''
    }`;
    doc.text(metaText.slice(0, 88), marginX, 16);

    doc.setFont('courier', 'bold');
    doc.text(`PAGE ${pageNum} / ${totalPages}`, pageWidth - marginX, 11.5, { align: 'right' });

    doc.setDrawColor(216, 209, 198);
    doc.setLineDashPattern([], 0);
    doc.setLineWidth(0.3);
    doc.line(marginX, headerBottomY, pageWidth - marginX, headerBottomY);
  };

  for (let idx = 0; idx < items.length; idx++) {
    const pageIndex = Math.floor(idx / perPage);
    const indexOnPage = idx % perPage;

    if (indexOnPage === 0) {
      if (pageIndex > 0) {
        doc.addPage();
      }
      drawPageHeader(pageIndex + 1);
    }

    const col = indexOnPage % cols;
    const row = Math.floor(indexOnPage / cols);
    const x = marginX + col * (cardWidth + gutterX);
    const y = headerBottomY + 2 + row * (cardHeight + gutterY);

    const product = items[idx];
    const qrDataUrl = qrDataUrls[idx];

    // Outer dashed cut guide border
    doc.setDrawColor(178, 168, 154);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([1.4, 1.4], 0);
    doc.rect(x, y, cardWidth, cardHeight);
    doc.setLineDashPattern([], 0);

    // Hangtag punch hole guide at top center
    doc.setDrawColor(195, 187, 175);
    doc.setLineWidth(0.2);
    doc.circle(x + cardWidth / 2, y + 2.8, 1.1);

    // Top micro-row: Brand & Size
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(158, 125, 71);
    doc.text(product.brand.toUpperCase().slice(0, 20), x + 2.5, y + 6.8);

    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(115, 106, 94);
    doc.text(product.sizeTag.slice(0, 14), x + cardWidth - 2.5, y + 6.8, { align: 'right' });

    // QR Code box (left)
    const qrSize = 25;
    const qrX = x + 2.5;
    const qrY = y + 9.2;
    doc.setDrawColor(230, 224, 214);
    doc.setLineWidth(0.2);
    doc.rect(qrX - 0.5, qrY - 0.5, qrSize + 1, qrSize + 1);
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Garment Details column (right of QR)
    const textX = qrX + qrSize + 2.8;
    const maxTextWidth = cardWidth - (qrSize + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(23, 21, 19);
    const wrappedTitle = doc.splitTextToSize(product.title, maxTextWidth).slice(0, 3);
    doc.text(wrappedTitle, textX, qrY + 3.2);

    const metaY = qrY + 3.2 + wrappedTitle.length * 3.1 + 1.5;
    doc.setFont('courier', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(110, 101, 90);
    doc.text(`${product.categoryName.slice(0, 15)} · ${product.era.replace('ERA_', '')}`, textX, metaY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(23, 21, 19);
    doc.text(formatAsciiBDT(product.priceBDT), textX, qrY + qrSize - 1.2);

    // Bottom SKU footer strip
    const footerLineY = y + cardHeight - 9.2;
    doc.setDrawColor(232, 226, 216);
    doc.setLineWidth(0.25);
    doc.line(x + 2, footerLineY, x + cardWidth - 2, footerLineY);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(23, 21, 19);
    doc.text(product.sku, x + cardWidth / 2, y + cardHeight - 4.2, { align: 'center' });
  }

  const filename = `dhaka-vault-qr-tags-${items.length}-skus-${dateStamp}.pdf`;
  doc.save(filename);

  return {
    count: items.length,
    pages: totalPages,
    filename
  };
}
