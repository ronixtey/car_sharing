import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, Max, Min } from 'class-validator';
import { RentOptions } from '../rates';

export class CreateRentDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  readonly carId: number;

  @ApiProperty({
    type: 'string',
    format: 'date'
  })
  @Type(() => Date)
  @IsDate()
  readonly startDate: Date

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(RentOptions.max_rent_days)
  readonly days: number;
}