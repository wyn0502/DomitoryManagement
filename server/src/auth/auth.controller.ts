import { Controller, Post, Body, Get, UseGuards, Request, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response, Request as ExpressRequest } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  // --- API TEST COOKIES (Yêu cầu 1) ---
  @Get('set-cookie')
  setCookie(@Res() res: Response) {
    res.cookie('test_cookie', 'NestJSCookieValue123', {
      maxAge: 900000, // 15 phút
      httpOnly: true,
      signed: true, // sử dụng cookie được ký bằng secret
    });
    return res.send({
      success: true,
      message: 'Cookie [test_cookie] đã được thiết lập thành công!',
    });
  }

  @Get('get-cookie')
  getCookie(@Req() req: ExpressRequest) {
    // Đọc signed cookies hoặc cookies thường
    const signedCookie = req.signedCookies['test_cookie'];
    const normalCookie = req.cookies['test_cookie'];
    return {
      success: true,
      message: 'Đọc Cookie thành công!',
      signedCookies: signedCookie || 'Không tìm thấy signed cookie',
      normalCookies: normalCookie || 'Không tìm thấy normal cookie',
    };
  }

  // --- API TEST SESSION (Yêu cầu 2) ---
  @Get('set-session')
  setSession(@Req() req: any) {
    req.session.visits = (req.session.visits || 0) + 1;
    req.session.test_data = 'DormitorySessionValue2026';
    return {
      success: true,
      message: 'Session đã được cập nhật!',
      visits: req.session.visits,
      testData: req.session.test_data,
    };
  }

  @Get('get-session')
  getSession(@Req() req: any) {
    return {
      success: true,
      message: 'Đọc Session thành công!',
      visits: req.session.visits || 0,
      testData: req.session.test_data || 'Không tìm thấy dữ liệu trong session',
    };
  }
}
