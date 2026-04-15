import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
      fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf/i;
        if (allowed.test(extname(file.originalname)) && allowed.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('이미지(jpg/png/gif/webp) 또는 PDF 파일만 업로드 가능합니다.'), false);
        }
      },
    }),
  )
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    return (files ?? []).map((f) => ({
      url: `${baseUrl}/uploads/${f.filename}`,
      fileName: Buffer.from(f.originalname, 'latin1').toString('utf8'),
      mimeType: f.mimetype,
      fileSize: f.size,
    }));
  }
}
