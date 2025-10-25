import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll() {
    console.log('🟢 EventsService.findAll() called');
     console.log('🔹 EventsController: GET /events called');
    return this.eventsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getEventWithPricing(id);
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  async create(@Body() createEventDto: CreateEventDto) {
    console.log('🔹 EventsController: post /events called');
    return this.eventsService.create(createEventDto);
  }
}
