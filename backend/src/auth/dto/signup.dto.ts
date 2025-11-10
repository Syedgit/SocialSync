import { IsEmail, IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(10)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).*/, {
    message:
      'Password must include upper & lowercase letters, a number, and a special character',
  })
  @IsNotEmpty()
  password: string;

  @IsString()
  @MinLength(2)
  @IsNotEmpty()
  name: string;
}

