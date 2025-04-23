import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { hashPassword } from "../../lib/argon";
import { RegisterOrganizerDTO, RegisterUserDTO } from "./dto/register.dto";
import { body } from "express-validator";
import { loginDTO } from "./dto/login.dto";
import { JWT_SECRET_KEY } from "../../config";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";


@injectable()
export class AuthService {
  private prisma: PrismaService;

  private passwordService: PasswordService;
  private tokenService: TokenService;

  constructor(
    PrismaClient: PrismaService,
    PasswordService: PasswordService,
    TokenService: TokenService
  ) {
    this.prisma = PrismaClient;
    this.passwordService = PasswordService;
    this.tokenService = TokenService;
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

  registerOrganizer = async (body: RegisterOrganizerDTO) => {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (existingEmail) {
      throw new ApiError("Email already exists", 400);
    }

    const hashedPassword = await hashPassword(body.password);

    const newUser = await this.prisma.user.create({
      data: {
        ...body,
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
      message: "lojin sukses",
      accessToken,
      user: userWithoutPassword,
    };
  };
}
