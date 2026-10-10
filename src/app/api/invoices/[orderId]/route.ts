import { NextRequest, NextResponse } from 'next/server';
import { StoreService } from '@/lib/data/store-service';
import { generateInvoicePdf } from '@/lib/pdf/invoice-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    const order = StoreService.getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const settings = StoreService.getSettings();
    const doc = generateInvoicePdf(order, settings);

    // Generate PDF array buffer
    const pdfOutput = doc.output('arraybuffer');
    const invoiceNumber = order.invoices?.[0]?.invoice_number || `INV-${order.order_number}`;

    return new NextResponse(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Error al generar la factura en PDF', details: error.message },
      { status: 500 }
    );
  }
}
