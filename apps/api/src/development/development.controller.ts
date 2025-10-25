import { Controller, Post } from '@nestjs/common';
import { DevelopmentService } from './development.service';

@Controller('dev')
export class DevelopmentController {
  constructor(private readonly developmentService: DevelopmentService) {}

  @Post('seed')
  async seedDatabase() {
    return this.developmentService.seedDatabase();
  }
}
