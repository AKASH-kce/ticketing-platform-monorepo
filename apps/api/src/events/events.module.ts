import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PricingService } from './pricing.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, PricingService],
  exports: [EventsService, PricingService],
})
export class EventsModule {}
