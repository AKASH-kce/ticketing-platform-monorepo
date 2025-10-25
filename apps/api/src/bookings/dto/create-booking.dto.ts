import { IsString, IsNotEmpty, IsEmail, IsNumber, Min } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
