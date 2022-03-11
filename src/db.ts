import { Pool, Client } from 'pg'
import { RentOptions } from './rent/rates';

export const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5431
});

export const InitDB = () => {
    client.connect();


    // создаем нужные объекты
    client.query(`CREATE SEQUENCE IF NOT EXISTS public.car_id_seq
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 2147483647
        CACHE 1;`
    );

    client.query(`CREATE TABLE IF NOT EXISTS public.car
		(
			id integer NOT NULL DEFAULT nextval('car_id_seq':: regclass),
			status boolean NOT NULL DEFAULT true,
			"number" character varying(32) COLLATE pg_catalog."default",
       	    CONSTRAINT car_pkey PRIMARY KEY(id),
            CONSTRAINT car_number_key UNIQUE ("number")
  		)`
    );



    client.query(`CREATE SEQUENCE IF NOT EXISTS public.rent_id_seq
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 2147483647
        CACHE 1;`
    );


    client.query(`CREATE TABLE IF NOT EXISTS public.rent
        (
            id integer NOT NULL DEFAULT nextval('rent_id_seq'::regclass),
            car_id integer NOT NULL,
            start_date date DEFAULT CURRENT_DATE,
            end_date date DEFAULT CURRENT_DATE,
            cost numeric DEFAULT 0,
            CONSTRAINT rent_pkey PRIMARY KEY (id),
            CONSTRAINT rent_id_fkey FOREIGN KEY (car_id)
                REFERENCES public.car (id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
        )
    `);


    client.query('select 1 from car', (err, res) => {
        if (!res.rowCount)  // если пусто
            // Заполняем автопарк   
            for (let i = 1; i <= RentOptions.max_cars; i++)
                client.query(`insert into car (number) values ('Car #$1')`, i);

    });
}