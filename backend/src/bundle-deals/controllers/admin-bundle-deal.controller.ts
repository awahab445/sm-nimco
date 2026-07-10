import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Body,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { BundleDealService } from '../services/bundle-deal.service';
import { BundleDealPricingService } from '../services/bundle-deal-pricing.service';
import { CreateBundleDealDto } from '../dto/create-bundle-deal.dto';
import { UpdateBundleDealDto } from '../dto/update-bundle-deal.dto';
import { PreviewBundlePricingDto } from '../dto/preview-bundle-pricing.dto';
import { ListBundleDealsQueryDto } from '../dto/list-bundle-deals-query.dto';
import { AdminJwtAuthGuard } from '../../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../../admin/guards/admin-permissions.guard';
import { RequirePermissions } from '../../admin/decorators/require-permissions.decorator';

function dealImagePublicPath(file: {
  path?: string;
  filename: string;
}): string {
  const normalizedPath = (file.path ?? '').replace(/\\/g, '/');
  return normalizedPath.startsWith('uploads/')
    ? `/${normalizedPath}`
    : `/uploads/deals/${file.filename}`;
}

const dealImageUploadOptions = {
  fileFilter: (
    _req: unknown,
    file: { mimetype?: string; originalname?: string },
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowedMime = /^image\/(jpeg|png|webp|gif)$/i.test(
      file.mimetype || '',
    );
    const allowedExt = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname || '');
    if (allowedMime && allowedExt) {
      cb(null, true);
      return;
    }
    cb(
      new BadRequestException(
        'Only PNG, JPEG, WEBP, and GIF image files are allowed',
      ) as any,
      false,
    );
  },
  storage: diskStorage({
    destination: 'uploads/deals',
    filename: (_req, file, cb) => {
      const extension = extname(file.originalname || '').toLowerCase();
      cb(null, `${randomUUID()}${extension}`);
    },
  }),
};

const optionalDealImagePipe = new ParseFilePipeBuilder()
  .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
  .build({ fileIsRequired: false });

@Controller('admin/deals')
@UseGuards(AdminJwtAuthGuard, AdminPermissionsGuard)
@RequirePermissions('deals.manage')
export class AdminBundleDealController {
  constructor(
    private readonly bundleDealService: BundleDealService,
    private readonly pricingService: BundleDealPricingService,
  ) {}

  @Get()
  async list(@Query() query: ListBundleDealsQueryDto) {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const featured = query.featured === 'true' || query.featured === '1';

    return this.bundleDealService.listDeals({
      q: query.q,
      status: query.status,
      featured: featured || undefined,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 20,
    });
  }

  @Post('preview-pricing')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async previewPricing(@Body() dto: PreviewBundlePricingDto) {
    return this.pricingService.preview(dto.items, dto.dealPrice);
  }

  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file', dealImageUploadOptions))
  @HttpCode(HttpStatus.CREATED)
  async uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ fileIsRequired: true }),
    )
    file: {
      path?: string;
      filename: string;
    },
  ) {
    return {
      url: dealImagePublicPath(file),
      filename: file.filename,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.bundleDealService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', dealImageUploadOptions))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() dto: CreateBundleDealDto,
    @UploadedFile(optionalDealImagePipe)
    image?: { path?: string; filename: string },
  ) {
    if (image) {
      dto.imageUrl = dealImagePublicPath(image);
    }
    return this.bundleDealService.create(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image', dealImageUploadOptions))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBundleDealDto,
    @UploadedFile(optionalDealImagePipe)
    image?: { path?: string; filename: string },
  ) {
    if (image) {
      dto.imageUrl = dealImagePublicPath(image);
    }
    return this.bundleDealService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.bundleDealService.remove(id);
  }
}
