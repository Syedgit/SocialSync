import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    try {
      const { email, password, name } = signupDto;

      // Check if user already exists
      const existingUser = await this.usersRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = this.usersRepository.create({
        email,
        password: hashedPassword,
        name,
      });

      await this.usersRepository.save(user);

      // Generate JWT token
      const payload = { sub: user.id, email: user.email };
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
      const accessToken = this.jwtService.sign(payload, { secret: jwtSecret });

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      };
    } catch (error) {
      console.error('AuthService signup error:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
    const accessToken = this.jwtService.sign(payload, { secret: jwtSecret });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return user;
  }
}
