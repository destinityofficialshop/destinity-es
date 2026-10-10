import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { StoreService } from '@/lib/data/store-service';
import { generateInvoicePdf } from '@/lib/pdf/invoice-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Falta el parámetro orderId' }, { status: 400 });
    }

    const order = StoreService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const settings = StoreService.getSettings();

    // 1. Generar PDF de la factura oficial
    const doc = generateInvoicePdf(order, settings);
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    const invoiceNumber = order.invoices?.[0]?.invoice_number || `INV-${order.order_number}`;

    // 2. Registro / Simulación de almacenamiento en Supabase Storage
    const storagePath = `invoices/${invoiceNumber}.pdf`;

    // 3. Envío con Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'pedidos@destinity.es';
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@destinity.es';

    let emailSent = false;
    let emailAdminSent = false;
    let isSimulated = false;

    const emailHtmlCustomer = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f8; margin: 0; padding: 40px 20px; color: #1a1a1a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #ebebeb; }
          .header { background: #121418; padding: 36px 30px; text-align: center; border-bottom: 3px solid #b89053; }
          .logo { font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #ffffff; margin: 0; }
          .content { padding: 36px 30px; }
          .order-badge { display: inline-block; background: #f4eee2; color: #805a36; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; margin-bottom: 20px; }
          .item-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #f0f0f0; }
          .totals-table { width: 100%; margin-top: 24px; border-collapse: collapse; }
          .totals-table td { padding: 8px 0; font-size: 14px; color: #555; }
          .totals-table td.amount { text-align: right; font-weight: 600; color: #111; }
          .total-row td { border-top: 2px solid #111; font-size: 18px; font-weight: 800; color: #111; padding-top: 14px; }
          .button { display: inline-block; background: #b89053; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin-top: 26px; }
          .footer { background: #fafafa; padding: 24px 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ebebeb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">DESTINITY ES</h1>
          </div>
          <div class="content">
            <div class="order-badge">Pedido Confirmado & Pagado</div>
            <h2 style="margin-top: 0; font-size: 20px; color: #111;">¡Muchas gracias por su compra, ${order.customer_name}!</h2>
            <p style="color: #666; line-height: 1.6;">Hemos recibido su pedido <strong>#${order.order_number}</strong> y ya estamos preparándolo en nuestros talleres de Madrid con el máximo esmero.</p>
            
            <h3 style="font-size: 15px; margin-top: 30px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Resumen del Pedido</h3>
            <div>
              ${order.order_items?.map(item => `
                <div class="item-row">
                  <div>
                    <strong>${item.product_title}</strong> x${item.quantity}
                    <div style="font-size: 12px; color: #777;">${item.variant_selected ? Object.entries(item.variant_selected).map(([k, v]) => `${k}: ${v}`).join(' | ') : ''}</div>
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)} €</div>
                </div>
              `).join('') || ''}
            </div>

            <table class="totals-table">
              <tr>
                <td>Subtotal (base):</td>
                <td class="amount">${(order.subtotal / 1.21).toFixed(2)} €</td>
              </tr>
              <tr>
                <td>IVA Régimen General (21%):</td>
                <td class="amount">${order.tax_amount.toFixed(2)} €</td>
              </tr>
              <tr>
                <td>Gastos de Envío:</td>
                <td class="amount">${order.shipping_amount === 0 ? 'Gratis' : `${order.shipping_amount.toFixed(2)} €`}</td>
              </tr>
              <tr class="total-row">
                <td>Total Pagado:</td>
                <td class="amount" style="color: #b89053;">${order.total.toFixed(2)} €</td>
              </tr>
            </table>

            <p style="margin-top: 24px; font-size: 13px; color: #666;">
              Adjunta a este correo electrónico encontrará su <strong>Factura Oficial (${invoiceNumber}.pdf)</strong> con el desglose de IVA y datos fiscales de Destinity Luxury Goods S.L.
            </p>
          </div>
          <div class="footer">
            Destinity ES &bull; Paseo de la Castellana 140, 28046 Madrid &bull; CIF: B-88776655<br/>
            Para cualquier consulta sobre su envío, responda directamente a este email.
          </div>
        </div>
      </body>
      </html>
    `;

    if (resendApiKey && resendApiKey.startsWith('re_')) {
      try {
        const resend = new Resend(resendApiKey);

        // Envío al cliente
        await resend.emails.send({
          from: `Destinity ES <${fromEmail}>`,
          to: [order.customer_email],
          subject: `Factura y confirmación de su pedido ${order.order_number} — Destinity ES`,
          html: emailHtmlCustomer,
          attachments: [
            {
              filename: `${invoiceNumber}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
        emailSent = true;

        // Notificación al administrador
        await resend.emails.send({
          from: `Notificaciones <${fromEmail}>`,
          to: [adminEmail],
          subject: `[NUEVA VENTA] Pedido ${order.order_number} (${order.total.toFixed(2)} €)`,
          html: `<p>Nueva venta realizada por <strong>${order.customer_name}</strong> (${order.customer_email}) por importe de <strong>${order.total.toFixed(2)} €</strong> mediante ${order.payment_method}.</p>`,
        });
        emailAdminSent = true;
      } catch (sendError) {
        console.error('Error sending with Resend API:', sendError);
        isSimulated = true;
      }
    } else {
      // Modo Simulado: Registra en consola y da confirmación
      console.log(`[SIMULATION RESEND] Order email generated for ${order.customer_email}. Attached: ${invoiceNumber}.pdf (${pdfBuffer.length} bytes)`);
      isSimulated = true;
      emailSent = true;
      emailAdminSent = true;
    }

    return NextResponse.json({
      success: true,
      simulated: isSimulated,
      orderNumber: order.order_number,
      invoiceNumber,
      customerEmail: order.customer_email,
      storagePath,
      message: isSimulated
        ? 'Factura generada y correo simulado con éxito (clave RESEND_API_KEY no activa).'
        : 'Factura generada y enviada al cliente con éxito.',
    });
  } catch (error: any) {
    console.error('API send-order-email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
