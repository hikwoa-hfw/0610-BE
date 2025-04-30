import { injectable } from "tsyringe";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import {
  BASE_URL_FE,
  JWT_SECRET_KEY,
  JWT_SECRET_KEY_FORGOT_PASSWORD,
} from "../../config";
import { hashPassword } from "../../lib/argon";
import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { forgotPasswordDTO } from "./dto/forgot-password.dto";
import { loginDTO } from "./dto/login.dto";
import { RegisterOrganizerDTO, RegisterUserDTO } from "./dto/register.dto";
import { ResetPasswordDTO } from "./dto/reset-password.dto";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

@injectable()
export class AuthService {
  private prisma: PrismaService;
  private mailService: MailService;
  private passwordService: PasswordService;
  private tokenService: TokenService;
  private cloudinaryService: CloudinaryService;

  constructor(
    PrismaClient: PrismaService,
    MailService: MailService,
    PasswordService: PasswordService,
    TokenService: TokenService,
    CloudinaryService: CloudinaryService
  ) {
    this.prisma = PrismaClient;
    this.mailService = MailService;
    this.passwordService = PasswordService;
    this.tokenService = TokenService;
    this.cloudinaryService = CloudinaryService;
  }

  registerUser = async (body: RegisterUserDTO) => {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("Email already exists", 400);
    }

    body.referralCodeUsed = body.referralCodeUsed?.trim();

    const hashedPassword = await hashPassword(body.password);
    const newReferralCode = nanoid(6);

    const result = await this.prisma.$transaction(async (tx) => {
      let newUser;

      if (body.referralCodeUsed) {
        const refererUser = await tx.user.findFirst({
          where: { referralCode: body.referralCodeUsed },
        });

        if (!refererUser) {
          throw new ApiError("Referral code is invalid", 400);
        }
        const { referralCodeUsed, ...bodyWithoutReferralUsed } = body;
        newUser = await tx.user.create({
          data: {
            ...bodyWithoutReferralUsed,
            password: hashedPassword,
            referralCode: newReferralCode,
          },
        });

        await tx.coupon.create({
          data: {
            userId: newUser.id,
            code: `DISKON-${nanoid(6).toUpperCase()}`,
            amount: 5000,
            validUntil: dayjs().add(3, "month").toDate(),
          },
        });

        const findPoint = await tx.point.findFirst({
          where: { userId: refererUser.id },
        });

        if (findPoint) {
          await tx.point.update({
            where: { id: findPoint.id },
            data: {
              amount: findPoint.amount + 10000,
              validUntil: dayjs().add(3, "month").toDate(),
            },
          });
        } else {
          await tx.point.create({
            data: {
              userId: refererUser.id,
              amount: 10000,
              validUntil: dayjs().add(3, "month").toDate(),
            },
          });
        }

        await tx.referralHistory.create({
          data: {
            referrerId: refererUser.id,
            referredUserId: newUser.id,
            amount: 10000,
          },
        });
      } else {
        newUser = await tx.user.create({
          data: {
            ...body,
            password: hashedPassword,
            referralCode: newReferralCode,
          },
        });
      }

      const { password, deletedAt, ...safeResult } = newUser;
      return safeResult;
    });

    return result;
  };

  registerOrganizer = async (
    body: RegisterOrganizerDTO,
    profilePict: Express.Multer.File
  ) => {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("Email already exists", 400);
    }

    const hashedPassword = await hashPassword(body.password);
    
    const { secure_url } = await this.cloudinaryService.upload(profilePict);

    const newUser = await this.prisma.user.create({
      data: {
        ...body,
        role: "ORGANIZER",
        profilePict: secure_url,
        password: hashedPassword,
      },
    });

    const { password, deletedAt, ...safeResult } = newUser;
    return safeResult;
  };

  login = async (body: loginDTO) => {
    const { email, password } = body;

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new ApiError("Invalid credentials", 400);
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError("Invalid credentials", 400);
    }

    const accessToken = this.tokenService.generateToken(
      { id: user.id, role: user.role },
      JWT_SECRET_KEY!,
      { expiresIn: "1h" }
    );

    const { password: gg, ...userWithoutPassword } = user;
    return {
      accessToken,
      ...userWithoutPassword,
    };
  };

  forgotPassword = async (body: forgotPasswordDTO) => {
    const { email } = body;

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new ApiError("Invalid credentials", 400);
    }

    const token = this.tokenService.generateToken(
      { id: user.id },
      JWT_SECRET_KEY_FORGOT_PASSWORD!,
      { expiresIn: "1h" }
    );

    const link = `${BASE_URL_FE}/reset-password/${token}`;

    this.mailService.sendEmail(
      email,
      "Link reset password",
      "forgot-password",
      { fullName: user.fullName, resetLink: link, expiryTime: 1 }
    );

    return { message: "Send email success" };
  };

  resetPassword = async (body: ResetPasswordDTO, authUserId: number) => {
    const user = await this.prisma.user.findFirst({
      where: { id: authUserId },
    });

    if (!user) {
      throw new ApiError("Invalid credentials", 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(
      body.password
    );

    await this.prisma.user.update({
      where: { id: authUserId },
      data: { password: hashedPassword },
    });

    return { message: "Reset password success" };
  };
}
