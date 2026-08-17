/** Narrow Multer memory-upload shape used by FilesService (avoids ambient Express.Multer). */
export type UploadedImageFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
