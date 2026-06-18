import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    userRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      userRepositoryMock.findOne.mockResolvedValue({ id: 1, username: 'testuser' });

      await expect(
        service.register({ username: 'testuser', password: 'password', email: 'test@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully register a user and return user info without password', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);
      const userInstance = { username: 'testuser', email: 'test@example.com', role: 'student' };
      userRepositoryMock.create.mockReturnValue(userInstance);
      userRepositoryMock.save.mockResolvedValue({
        id: 1,
        ...userInstance,
        password: 'hashed_password',
      });

      const result = await service.register({
        username: 'testuser',
        password: 'password',
        email: 'test@example.com',
      });

      expect(result).toEqual({ id: 1, username: 'testuser', email: 'test@example.com', role: 'student' });
      expect(userRepositoryMock.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if username does not exist', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.login({ username: 'unknown', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const dbUser = { username: 'testuser', password: 'hashed_password' };
      userRepositoryMock.findOne.mockResolvedValue(dbUser);
      
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        service.login({ username: 'testuser', password: 'wrong_password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token if credentials are valid', async () => {
      const dbUser = { id: 1, username: 'testuser', password: 'hashed_password', email: 'test@example.com', role: 'student', room_id: null, room: null };
      userRepositoryMock.findOne.mockResolvedValue(dbUser);
      
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jwtServiceMock.signAsync.mockResolvedValue('mocked_jwt_token');

      const result = await service.login({ username: 'testuser', password: 'correct_password' });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mocked_jwt_token');
      expect(result.user.username).toBe('testuser');
    });
  });
});
