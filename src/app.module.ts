import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { Property } from './entities/property.entity';
import { UserModule } from './user/user.module';
import { PropertyModule } from './property/property.module';
import { Owner } from './entities/owner.entity';
import { Tenant } from './entities/tenant.entity';

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
        entities: [User, Property, Owner, Tenant],
        synchronize: process.env.NODE_ENV !== 'production',
        dropSchema: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Property, Owner, Tenant]),
    AuthModule,
    UserModule,
    PropertyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
