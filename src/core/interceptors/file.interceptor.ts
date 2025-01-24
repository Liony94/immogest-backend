import { UPLOAD_CONFIG } from '../../config/upload.config';
import { createStorage, createFileFilter } from '../../utils/file.utils';

export const imageStorage = createStorage(UPLOAD_CONFIG.images.destination);
export const documentStorage = createStorage(UPLOAD_CONFIG.documents.destination);

export const imageFileFilter = createFileFilter(
  UPLOAD_CONFIG.images.allowedExtensions,
  'Seuls les fichiers image sont autorisés!'
);

export const documentFileFilter = createFileFilter(
  UPLOAD_CONFIG.documents.allowedExtensions,
  'Format de fichier non autorisé!'
);

export const imageInterceptorOptions = {
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: UPLOAD_CONFIG.images.maxFileSize },
};

export const documentInterceptorOptions = {
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: UPLOAD_CONFIG.documents.maxFileSize },
}; 