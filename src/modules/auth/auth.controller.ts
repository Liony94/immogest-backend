import { Controller, Post, Body, Get, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false
  }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req): Promise<User> {
    return this.authService.getCurrentUser(req.user.id);
  }
}
