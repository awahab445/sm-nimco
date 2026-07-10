import { Module } from '@nestjs/common';
import { PromotionsController } from './controllers/promotions.controller';
import { PromotionsService } from './services/promotions.service';
import { RulesEngineService } from './services/rules-engine.service';
import { PromotionRuleEvaluatorService } from './services/promotion-rule-evaluator.service';
import { PromotionEventHandlers } from './events/promotion.handlers';
import { PrismaService } from '../catalog/services/prisma.service';
import { CatalogModule } from '../catalog/catalog.module';
import { AuthModule } from '../auth/auth.module';
import { AdminJwtAuthGuard } from '../admin/guards/admin-jwt-auth.guard';
import { AdminPermissionsGuard } from '../admin/guards/admin-permissions.guard';
import { AdminRbacService } from '../admin/services/admin-rbac.service';

@Module({
  imports: [CatalogModule, AuthModule],
  controllers: [PromotionsController],
  providers: [
    PromotionsService,
    RulesEngineService,
    PromotionRuleEvaluatorService,
    PromotionEventHandlers,
    AdminRbacService,
    AdminJwtAuthGuard,
    AdminPermissionsGuard,
  ],
  exports: [
    PromotionsService,
    RulesEngineService,
    PromotionRuleEvaluatorService,
  ],
})
export class PromotionsModule {}
