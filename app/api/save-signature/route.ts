import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { dbConnect, gfs } from '@/lib/mongodb';
import PdfData from '@/models/PdfData';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { inputValue, pdfData } = await req.json();

  try {
    const pdfBuffer = await Buffer.from(pdfData, 'base64');
    const readablePdfStream = new Readable();
    readablePdfStream.push(pdfBuffer);
    readablePdfStream.push(null);

    const gfsObj = await gfs();

    const uploadStream = gfsObj.openUploadStream('signedPdf');
    readablePdfStream.pipe(uploadStream);

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', async () => {
        try {
          const newPdfData = new PdfData({
            inputValue,
            pdfFileId: uploadStream.id,
          });
          await newPdfData.save();

          resolve(NextResponse.json({ message: 'Data saved successfully' }));
        } catch (error) {
          console.error('Error saving PDF data:', error);
          reject(NextResponse.json({ message: 'Failed to save data', error }, { status: 500 }));
        }
      });

      uploadStream.on('error', (error) => {
        console.error('Error uploading PDF:', error);
        reject(NextResponse.json({ message: 'Failed to upload PDF', error }, { status: 500 }));
      });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: 'Failed to process request', error }, { status: 500 });
  }
}