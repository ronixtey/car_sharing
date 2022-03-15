import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRentDto } from './dto/create-rent.dto';
import { Rent } from './entities/rent.entity';
import { RentOptions } from './rates';
import { client } from 'src/db';
import { Car } from './entities/car.entity';

@Injectable()
export class RentService {
	async create(create_rent: CreateRentDto): Promise<Rent> {
		// проверка на выходные дни
		const start_date = new Date(create_rent.startDate);
		if (this.isWeekend(start_date))
			throw new BadRequestException('Starting date is weekend');

		const end_date = this.calcEndDate(start_date, create_rent.days);
		if (this.isWeekend(end_date))
			throw new BadRequestException('End date is weekend');


		// проверка на доступность
		if (!(await this.isAvailable(create_rent.carId, start_date)))
			return;



		// инсерт в базу
		const car_id = create_rent.carId;
		const cost = this.calcCost(create_rent.days);
		try {
			const res = await client.query(`
				insert into rent (car_id, start_date, end_date, cost)
				values ($1, $2, $3, $4)
				returning *`,
				[car_id, start_date.toLocaleDateString(), end_date.toLocaleDateString(), cost]
			);


			// по хорошему сделать в триггере после insert into car
			await client.query(`update car set status = false where id=$1`, [car_id]);

			return res.rows[0];
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}



	private async isAvailable(car_id: number, start_date: Date): Promise<boolean> {
		let res;

		try {
			res = await client.query(
				`select 
					car.status,
					(select max(end_date) from rent where car_id = car.id) as last_rent
				from car
				where car.id = $1`,
				[car_id]);
		} catch (error) {
			console.log(error.stack);
		}

		// машина доступна?
		if (!res.rowCount)
			throw new BadRequestException('Car not found');
		if (!res.rows[0].status)
			throw new BadRequestException('Car is already rented');


		// пауза в 3 дня между арендами
		if (res.rows[0].last_rent) {	// not null
			const diff = Math.floor(start_date.getTime() - res.rows[0].last_rent.getTime()) / (1000 * 60 * 60 * 24);
			if (diff < RentOptions.rent_interval)
				throw new BadRequestException(`Car can be rented after 3 days since the last rent (last rent: ${res.rows[0].last_rent.toLocaleDateString()})`);
		}

		return true;
	}


	// расчет даты окончания
	private calcEndDate(start_date: Date, days: number): Date {
		return new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate() + days);
	}

	private isWeekend(date: Date): boolean {
		const day = date.getDay();

		return !day || day == 6;
	}

	// расчет стоимости аренды
	private calcCost(days: number): number { 	
		let cost = 0;
		for (let i = 1; i <= days; i++)
			cost += RentOptions.cost - (RentOptions.cost * this.getDiscount(i) / 100);

		return cost;
	}

	// получить скидку
	private getDiscount(for_day: number): number {
		/*
		rates: [
			{ from: 1, to: 4, discount: 0 },
			{ from: 5, to: 9, discount: 5 },
			{ from: 10, to: 17, discount: 10 },
			{ from: 18, to: 29, discount: 15 }
		]
			*/
		const rate = RentOptions.rates.find((rate) => {
			return for_day >= rate.from && for_day <= rate.to
		});

		return rate.discount;
	}



	async getCars(): Promise<Car[]> {
		let res;
		try {
			res = await client.query('select * from car');
		} catch (error) {
			throw new BadRequestException(error.message)
		}

		return res.rows;
	}

	async getCarById(car_id: number): Promise<Car> {
		let res;
		try {
			res = await client.query(`select * from car where id=$1`, [car_id]);
		} catch (error) {
			throw new BadRequestException(error.message);
		}

		if (!res.rowCount)
			throw new NotFoundException();

		return res.rows[0];
	}


	async getReport(for_months: number) {
		try {
			const res = await client.query(`
				-- месяцы
				with recursive months as (
					select date_trunc('month', current_date - interval '$1 month') as month
					
					union all
					
					select month + interval '1 month' as month
					from months  	
					where months.month < date_trunc('month', current_date)
				)

				select 
					to_char(m.month, 'Month YYYY') as month, 
					c.number as car_number,
					-- % дней аренды за каждый месяц
					floor(
							extract(day from sum(least(r.end_date, m.month + interval '1 month' - interval '1 day') - greatest(r.start_date, m.month) + interval '1 day')) / 
							date_part('days', m.month + '1 month'::interval - '1 day'::interval) * 
							100) 
					as rent_days 
					
				from months m
				join rent r
					on m.month between date_trunc('month', r.start_date) and date_trunc('month', r.end_date)
				join car c
					on r.car_id = c.id

				group by m.month, c.id
				order by m.month
			`, 
			[for_months]);

			return res.rows;

		} catch (error) {
			throw new BadRequestException(error.message);	
		}
	}
}