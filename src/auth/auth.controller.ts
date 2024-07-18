import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.usersService.findByEmail(registerUserDto.email);
    if (user) {
      throw new BadRequestException('Email already registered');
    }
    registerUserDto.password = await bcrypt.hash(registerUserDto.password, 10);
    return this.usersService.createUser(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.findByEmail(loginUserDto.email);
    console.log(user);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isPasswordMatching = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    console.log(isPasswordMatching);
    if (!isPasswordMatching) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
//this.jwtService.sign(payload)
