import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common'

export const createStorage = (destination: string) => {
  return diskStorage({
    destination,
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  });
};

export const createFileFilter = (allowedExtensions: RegExp, errorMessage: string) => {
  return (req: any, file: Express.Multer.File, callback: Function) => {
    if (!file.originalname.toLowerCase().match(allowedExtensions)) {
      return callback(new BadRequestException(errorMessage), false);
    }
    callback(null, true);
  };
}; 