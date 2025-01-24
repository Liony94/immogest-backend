import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Owner } from 'src/entities/owner.entity';
import { Tenant } from 'src/entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Owner, Tenant])
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
