export const UPLOAD_CONFIG = {
  images: {
    destination: './uploads/properties/images',
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: /(jpg|jpeg|png|gif)$/,
  },
  documents: {
    destination: './uploads/properties/documents',
    maxFileSize: 15 * 1024 * 1024, // 15MB
    allowedExtensions: /(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif)$/,
  }
}; 