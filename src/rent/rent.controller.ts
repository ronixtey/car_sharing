import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { RentService } from './rent.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { Rent } from './entities/rent.entity';

@ApiBearerAuth()
@ApiTags('rent')
@Controller('rent')
export class RentController {
	constructor(private readonly rentService: RentService) { }

	@Post()
	@ApiOperation({ summary: 'Create rent' })
	// @ApiResponse({ status: 403, description: 'Forbidden.' })
	async create(@Body() create_rent: CreateRentDto): Promise<Rent> {
		return this.rentService.create(create_rent);
	}


	@Get('/cars')
	getCars() {
		return this.rentService.getCars();
	}

	@Get('/cars/:carid')
	getCarById(@Param('carid') car_id: number) {
		return this.rentService.getCarById(car_id);
	}


	// check months (> 0)
	@Get('/report/:months') // query param
	getReport(@Param('months') for_months: number) {
		return this.rentService.getReport(for_months);
	}
}
