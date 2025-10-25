import { Controller, Get, Post, Body, Query, Param, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  async findByEventId(@Query('eventId', ParseIntPipe) eventId: number) {
    return this.bookingsService.findByEventId(eventId);
  }

  @Get('user/:email')
  async findByUserEmail(@Param('email') email: string) {
    return this.bookingsService.findByUserEmail(email);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }
}
