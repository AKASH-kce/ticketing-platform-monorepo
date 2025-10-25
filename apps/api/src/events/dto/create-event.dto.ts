import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// Time-based pricing rule
class TimeBasedRuleDto {
  @IsNumber()
  @Type(() => Number)
  daysBefore: number;

  @IsNumber()
  @Type(() => Number)
  multiplier: number;
}

class TimeBasedPricingDto {
  @IsBoolean()
  @Type(() => Boolean)
  enabled: boolean;

  @IsNumber()
  @Type(() => Number)
  weight: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeBasedRuleDto)
  rules: TimeBasedRuleDto[];
}

class DemandBasedPricingDto {
  @IsBoolean()
  @Type(() => Boolean)
  enabled: boolean;

  @IsNumber()
  @Type(() => Number)
  weight: number;

  @IsNumber()
  @Type(() => Number)
  threshold: number;

  @IsNumber()
  @Type(() => Number)
  multiplier: number;
}

class InventoryBasedPricingDto {
  @IsBoolean()
  @Type(() => Boolean)
  enabled: boolean;

  @IsNumber()
  @Type(() => Number)
  weight: number;

  @IsNumber()
  @Type(() => Number)
  threshold: number;

  @IsNumber()
  @Type(() => Number)
  multiplier: number;
}

export class PricingRulesDto {
  @ValidateNested()
  @Type(() => TimeBasedPricingDto)
  timeBased: TimeBasedPricingDto;

  @ValidateNested()
  @Type(() => DemandBasedPricingDto)
  demandBased: DemandBasedPricingDto;

  @ValidateNested()
  @Type(() => InventoryBasedPricingDto)
  inventoryBased: InventoryBasedPricingDto;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsDateString()
  eventDate: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  totalTickets: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  basePrice: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  priceFloor: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  priceCeiling: number;

  @ValidateNested()
  @Type(() => PricingRulesDto)
  pricingRules: PricingRulesDto;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
