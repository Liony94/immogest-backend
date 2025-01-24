import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { Property } from './entities/property.entity';
import { PropertyModule } from './modules/property/property.module';
import { Owner } from './entities/owner.entity';
import { Tenant } from './entities/tenant.entity';
import { Payment } from './entities/payment.entity';
import { PaymentSchedule } from './entities/payment-schedule.entity';
import { UserModule } from './modules/user/user.module';
import { PaymentModule } from './modules/payment/payment.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: [User, Property, Owner, Tenant, Payment, PaymentSchedule],
        synchronize: process.env.NODE_ENV !== 'production',
        dropSchema: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Property, Owner, Tenant, Payment, PaymentSchedule]),
    AuthModule,
    UserModule,
    PropertyModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
