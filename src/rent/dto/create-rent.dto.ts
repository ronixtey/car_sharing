import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, Max, MAX, Min } from 'class-validator';

export class CreateRentDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
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
  @Max(30)
  readonly days: number;
}
