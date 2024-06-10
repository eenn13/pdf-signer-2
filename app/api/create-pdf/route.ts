import { PDFDocument, rgb } from 'pdf-lib';
import { NextResponse } from 'next/server';

export async function GET() {
  const pdfDoc = await PDFDocument.create();

  // İlk sayfa
  const page1 = pdfDoc.addPage([600, 500]);
  page1.drawText('Bu bir test metnidir - Sayfa 1', {
    x: 50,
    y: 350,
    size: 30,
    color: rgb(0, 0, 0),
  });

  // İkinci sayfa
  const page2 = pdfDoc.addPage([600, 500]);
  page2.drawText('Bu bir test metnidir - Sayfa 2', {
    x: 50,
    y: 350,
    size: 30,
    color: rgb(0, 0, 0),
  });

  // Üçüncü sayfa
  const page3 = pdfDoc.addPage([600, 500]);
  page3.drawText('Bu bir test metnidir - Sayfa 3', {
    x: 50,
    y: 350,
    size: 30,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  const response = new NextResponse(Buffer.from(pdfBytes));
  response.headers.set('Content-Type', 'application/pdf');
  response.headers.set('Content-Disposition', 'attachment; filename=test.pdf');
  return response;
}
