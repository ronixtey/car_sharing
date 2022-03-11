import { Module } from '@nestjs/common';
import { RentModule } from './rent/rent.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule.forRoot({ envFilePath: `${process.env.NODE_ENV}.env` }),
    RentModule
  ],
})
export class AppModule { }
