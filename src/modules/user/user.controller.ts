import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('id/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get('/tenants')
  findUserByRoleTenant() {
    return this.userService.findUserByRoleTenant();
  }

  @Get('/lastname/:lastName')
  findTenantByLastName(@Param('lastName') lastName: string) {
    return this.userService.findTenantByLastName(lastName);
  }
}
