import { User } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { hashPassword } from "../../lib/argon";
import dayjs from "dayjs";
import { nanoid } from "nanoid";

interface RegisterPayload extends User {
  referralCodeUsed?: string;
}

export const registerService = async (body: RegisterPayload) => {
  const existingEmail = await prisma.user.findFirst({
    where: { email: body.email },
  });

  if (existingEmail) {
    throw new ApiError("Email already exists", 400);
  }

  body.referralCodeUsed = body.referralCodeUsed?.trim();

  const hashedPassword = await hashPassword(body.password);
  const newReferralCode = nanoid(6);

  const result = await prisma.$transaction(async (tx) => {
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
