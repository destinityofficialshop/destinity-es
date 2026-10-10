import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, StoreSettings } from '@/types/database.types';

export function generateInvoicePdf(order: Order, settings: StoreSettings): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const invoiceNum = order.invoices?.[0]?.invoice_number || `INV-${order.order_number.replace('DES-', '')}`;
  const issueDate = new Date(order.created_at).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // --- BRAND HEADER ---
  // Top luxury bar (Champagne gold)
  doc.setFillColor(184, 144, 83); // brand-500
  doc.rect(0, 0, 210, 5, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(18, 20, 24); // Obsidian
  doc.text('DESTINITY ES', 20, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(111, 120, 150);
  doc.text('Colección Exclusiva & Alta Marroquinería', 20, 30);

  // Invoice Title & Meta (Right Aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(184, 144, 83);
  doc.text('FACTURA SIMPLIFICADA', 190, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`Nº Factura: ${invoiceNum}`, 190, 28, { align: 'right' });
  doc.text(`Nº Pedido: ${order.order_number}`, 190, 33, { align: 'right' });
  doc.text(`Fecha: ${issueDate}`, 190, 38, { align: 'right' });

  // Divider line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.4);
  doc.line(20, 44, 190, 44);

  // --- FISCAL & CUSTOMER BOXES ---
  // Emisor (Empresa)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(18, 20, 24);
  doc.text('DATOS FISCALES EMISOR', 20, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(settings.legal_name || 'Destinity Luxury Goods S.L.', 20, 58);
  doc.text(`CIF/NIF: ${settings.cif_nif || 'B-88776655'}`, 20, 63);
  doc.text(`${settings.fiscal_address || 'Paseo de la Castellana 140'}`, 20, 68);
  doc.text(`${settings.postal_code || '28046'} ${settings.city || 'Madrid'} (${settings.province || 'Madrid'}), ${settings.country || 'España'}`, 20, 73);
  doc.text(`Email: ${settings.email || 'contacto@destinity.es'} | Tel: ${settings.phone || '+34 910 00 22 33'}`, 20, 78);

  // Receptor (Cliente)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(18, 20, 24);
  doc.text('DATOS DEL CLIENTE / RECEPTOR', 115, 52);

  const bill = order.billing_address || order.shipping_address;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(order.customer_name || bill.fullName || 'Cliente Particular', 115, 58);
  if (bill.dniNie) {
    doc.text(`NIF/DNI: ${bill.dniNie}`, 115, 63);
  }
  doc.text(`${bill.street || ''}`, 115, bill.dniNie ? 68 : 63);
  doc.text(`${bill.postalCode || ''} ${bill.city || ''} (${bill.province || ''}), ${bill.country || 'España'}`, 115, bill.dniNie ? 73 : 68);
  doc.text(`Email: ${order.customer_email}`, 115, bill.dniNie ? 78 : 73);
  if (order.customer_phone || bill.phone) {
    doc.text(`Teléfono: ${order.customer_phone || bill.phone}`, 115, bill.dniNie ? 83 : 78);
  }

  // --- ITEMS TABLE ---
  const tableStartY = 92;
  const tableRows = (order.order_items || []).map((item) => {
    let variantText = '';
    if (item.variant_selected && typeof item.variant_selected === 'object') {
      variantText = Object.entries(item.variant_selected)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ');
    }

    const titleWithVariant = variantText
      ? `${item.product_title}\n(${variantText})`
      : item.product_title;

    // Unit base without tax
    const unitPriceGross = item.price;
    const unitBase = unitPriceGross / 1.21;
    const lineTotal = item.price * item.quantity;

    return [
      titleWithVariant,
      item.quantity.toString(),
      `${unitBase.toFixed(2)} €`,
      '21%',
      `${lineTotal.toFixed(2)} €`,
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 20, right: 20 },
    head: [['Concepto / Producto', 'Uds.', 'Base Unit.', 'IVA', 'Total']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [18, 20, 24],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50],
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
    },
    styles: {
      lineColor: [235, 235, 235],
      lineWidth: 0.1,
    },
  });

  // Calculate position after table
  const finalY = (doc as any).lastAutoTable?.finalY || 140;

  // --- SUMMARY / TOTALS BOX ---
  const boxTop = finalY + 8;
  const subtotalBase = (order.subtotal / 1.21);
  const taxAmount = order.tax_amount || (order.subtotal - subtotalBase);
  const shippingAmount = order.shipping_amount || 0;
  const total = order.total;

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(120, boxTop, 70, 42, 2, 2, 'F');
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(120, boxTop, 70, 42, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);

  doc.text('Base Imponible:', 125, boxTop + 8);
  doc.text(`${subtotalBase.toFixed(2)} €`, 185, boxTop + 8, { align: 'right' });

  doc.text('IVA Régimen General (21%):', 125, boxTop + 15);
  doc.text(`${taxAmount.toFixed(2)} €`, 185, boxTop + 15, { align: 'right' });

  doc.text('Gastos de Envío:', 125, boxTop + 22);
  doc.text(shippingAmount > 0 ? `${shippingAmount.toFixed(2)} €` : 'GRATIS', 185, boxTop + 22, { align: 'right' });

  // Divider
  doc.setDrawColor(210, 210, 210);
  doc.line(125, boxTop + 27, 185, boxTop + 27);

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 20, 24);
  doc.text('TOTAL FACTURA:', 125, boxTop + 35);
  doc.setTextColor(184, 144, 83); // brand gold
  doc.text(`${total.toFixed(2)} €`, 185, boxTop + 35, { align: 'right' });

  // Payment details note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const methodLabel =
    order.payment_method === 'stripe' ? 'Tarjeta Bancaria (Stripe)' :
    order.payment_method === 'bizum' ? 'Bizum Móvil' :
    order.payment_method === 'paypal' ? 'PayPal Checkout' : 'Apple Pay / Google Pay';
  doc.text(`Método de Pago: ${methodLabel}`, 20, boxTop + 8);
  doc.text(`Estado del Pago: ${order.payment_status === 'paid' ? 'PAGADO (Completado con éxito)' : 'Pendiente'}`, 20, boxTop + 14);

  // --- FOOTER NOTICE ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  const footerNote = settings.invoice_footer_note || 'Inscrita en el Registro Mercantil de Madrid. IVA incluido al 21% según el Régimen General.';
  doc.text(footerNote, 105, 280, { align: 'center' });
  doc.text('Destinity ES — Plataforma Oficial de Comercio Electrónico — www.destinity.es', 105, 285, { align: 'center' });

  return doc;
}
