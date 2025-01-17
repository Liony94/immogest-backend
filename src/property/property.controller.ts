import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { JwtAuthGuard } from '../auth/jwh-auth.guard';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('new')
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertyService.create(createPropertyDto, req.user);
  }

  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(+id);
  }
}
