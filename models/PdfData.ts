import mongoose, { Document, Model, Schema } from 'mongoose';

interface IPdfData extends Document {
  inputValue: string;
  pdfFileId: mongoose.Types.ObjectId;
}

const PdfDataSchema: Schema<IPdfData> = new Schema({
  inputValue: { type: String },
  pdfFileId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'pdfs.files' },
});

const PdfData: Model<IPdfData> = mongoose.models.PdfData || mongoose.model('PdfData', PdfDataSchema);

export default PdfData;
