import { Module } from '@nestjs/common';
import { PromotionsController } from './controllers/promotions.controller';
import { PromotionsService } from './services/promotions.service';
import { RulesEngineService } from './services/rules-engine.service';
import { PromotionRuleEvaluatorService } from './services/promotion-rule-evaluator.service';
import { PromotionEventHandlers } from './events/promotion.handlers';
import { PrismaService } from '../catalog/services/prisma.service';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [CatalogModule],
  controllers: [PromotionsController],
  providers: [
    PromotionsService,
    RulesEngineService,
    PromotionRuleEvaluatorService,
    PromotionEventHandlers,
  ],
  exports: [PromotionsService, RulesEngineService, PromotionRuleEvaluatorService],
})
export class PromotionsModule {}

