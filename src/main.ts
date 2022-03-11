import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { InitDB } from './db';

require('dotenv').config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const options = new DocumentBuilder()
		.setTitle('Car rent')
		.setDescription('The Rent API description')
		.setVersion('1.0')
		.addTag('rent')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('api', app, document);


	// DB
	try {
		InitDB();
	} catch (error) {
		console.log(error);
	}


	app.useGlobalPipes(new ValidationPipe());


	await app.listen(3000);
	console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();