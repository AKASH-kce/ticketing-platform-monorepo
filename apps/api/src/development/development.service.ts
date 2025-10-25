import { Injectable } from '@nestjs/common';
import { seed } from '@repo/database';

@Injectable()
export class DevelopmentService {
  async seedDatabase() {
    try {
      await seed();
      return { message: 'Database seeded successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to seed database: ${errorMessage}`);
    }
  }
}
