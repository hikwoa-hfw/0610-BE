import { injectable } from "tsyringe";
import { ApiError } from "../../utils/api-error";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { GetTransactionDTO } from "./dto/get-transaction.dto";

@injectable()
export class TransactionService {
  private prisma: PrismaService;
  private mailService: MailService;

  constructor(PrismaClient: PrismaService, MailService: MailService) {
    this.prisma = PrismaClient;
    this.mailService = MailService;
  }

  getTransactionsByOrganizer = async (
    authUserId: number,
    query: GetTransactionDTO
  ) => {
    const { page, sortBy, sortOrder, take, search } = query;

    const transactions = await this.prisma.transaction.findMany({
      where: { events: { userId: authUserId } },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
      include: {
        users: { select: { fullName: true, email: true } },
        transaction_details: {
          select: {
            qty: true,
            price: true,
            tickets: { select: { type: true } },
          },
        },
      },
    });

    const count = await this.prisma.transaction.count({
      where: { events: { userId: authUserId }, deletedAt: null },
    });

    return {
      data: transactions,
      meta: { page, take, total: count },
    };
  };

  getTransactionsByEventSlug = async (
    slug: string,
    query: GetTransactionDTO
  ) => {
    console.log("tidak kena slug");
    const { page, sortBy, sortOrder, take, search } = query;

    const transactions = await this.prisma.transaction.findMany({
      where: { events: { slug } },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
    });

    if (!transactions) {
      throw new ApiError("Transaction not found", 400);
    }

    const count = await this.prisma.transaction.count({
      where: { events: { slug } },
    });

    return { data: transactions, meta: { page, take, total: count } };
  };

  getTransactionsDetail = async (uuid: string) => {
    console.log("tidak kena");

    const transaction = await this.prisma.transaction.findUnique({
      where: { uuid },
      include: {
        vouchers: { select: { code: true } },
        transaction_details: { select: { name: true, qty: true, price: true } },
        users: { select: { fullName: true, email: true } },
      },
    });

    if (!transaction) {
      throw new ApiError("Transaction not found", 400);
    }

    return transaction;
  };

  getTransactionsPaid = async (
    authUserId: number,
    query: GetTransactionDTO
  ) => {
    const { page, sortBy, sortOrder, take, search } = query;

    console.log("kena");

    const transactions = await this.prisma.transaction.findMany({
      where: { events: { userId: authUserId }, status: "PAID" },
    });

    const count = await this.prisma.transaction.count({
      where: {
        events: { userId: authUserId },
        deletedAt: null,
        status: "PAID",
      },
    });

    return {
      data: transactions,
      meta: { page, take, total: count },
    };
  };

  getTransactionsPaidNoPage = async (authUserId: number) => {
    const transactions = await this.prisma.transaction.findMany({
      where: { events: { userId: authUserId }, status: "PAID" },
      select: {uuid: true, createdAt: true, userId: true, status: true}
    });

    return transactions
  };

  getTotalRevenue = async (authUserId: number) => {
    const transactions = await this.prisma.transaction.aggregate({
      where: { events: { userId: authUserId }, status: "PAID" },
      _sum: {
        totalPrice: true,
      },
    });

    console.log(transactions);

    return transactions;
  };

  rejectTransaction = async (authUserId: number, transactionUuid: string) => {
    try {
      const transaction = await this.prisma.transaction.findFirst({
        where: { uuid: transactionUuid, deletedAt: null },
        include: {
          transaction_details: true,
          users: { omit: { password: true } },
        },
      });

      if (!transaction) {
        throw new ApiError("Transaction not found", 400);
      }

      if (transaction.status !== "WAITING_CONFIRMATION") {
        throw new ApiError("Transaction not provide to confirm", 400);
      }

      const transactionDetails = await this.prisma.transactionDetail.findMany({
        where: { transactionId: transaction.id },
        include: {
          tickets: {
            include: {
              events: {
                select: {
                  id: true,
                  name: true,
                  users: { omit: { password: true } },
                },
              },
            },
          },
        },
      });

      if (!transactionDetails || transactionDetails.length === 0) {
        throw new ApiError("Transaction Ticket not found", 400);
      }

      transactionDetails.map((validating_ticket) => {
        if (validating_ticket.tickets.events.users.id !== authUserId) {
          throw new ApiError("unauthorize", 400);
        }
      });

      await this.prisma.$transaction(async (tx) => {
        if (
          transaction.transaction_details &&
          transaction.transaction_details.length > 0
        ) {
          await Promise.all(
            transaction.transaction_details.map(
              async ({ ticketId, qty }, index) => {
                if (!qty || qty <= 0) {
                  throw new ApiError(
                    `Invalid ticket quantity for ticket ID: ${ticketId}`,
                    400
                  );
                }
                console.log(
                  await tx.ticket.findFirst({
                    where: { id: ticketId },
                  })
                );

                await tx.ticket.update({
                  where: { id: ticketId },
                  data: { sold: { decrement: qty } },
                });
              }
            )
          );
        }

        if (
          transaction.voucherId !== null &&
          transaction.voucherAmount &&
          transaction.voucherAmount > 0
        ) {
          if (transaction.voucherId && transaction.voucherAmount > 0) {
            const voucher = await tx.voucher.findFirst({
              where: { id: transaction.voucherId },
            });

            if (!voucher) {
              throw new ApiError("Voucher not found.", 400);
            }

            if (voucher.claimed <= 0) {
              throw new ApiError("Voucher already restored.", 400);
            }

            const updateVoucher = await tx.voucher.update({
              where: { id: voucher.id },
              data: { claimed: { decrement: 1 } },
            });

            if (!updateVoucher) {
              throw new ApiError("Failed to restore voucher.", 400);
            }
          }
        }

        if (
          transaction.couponId !== null &&
          transaction.couponAmount &&
          transaction.couponAmount > 0
        ) {
          const coupon = await tx.coupon.findFirst({
            where: { id: transaction.couponId },
          });

          if (!coupon) {
            throw new ApiError("Coupon not found.", 400);
          }

          if (!coupon.usedAt) {
            throw new ApiError("Coupon is not used yet.", 400);
          }

          if (coupon) {
            const updateCoupon = await tx.coupon.update({
              where: { id: transaction.couponId },
              data: {
                usedAt: null,
              },
            });

            if (!updateCoupon) {
              throw new ApiError("failed to restore coupon", 400);
            }
          }
        }

        if (transaction.pointAmount && transaction.pointAmount > 0) {
          const point = await tx.point.findFirst({
            where: { userId: transaction.userId },
          });

          if (point) {
            const updatePoint = await tx.point.update({
              where: { userId: transaction.userId },
              data: {
                amount: { increment: transaction.pointAmount },
              },
            });
            if (!updatePoint) {
              throw new ApiError("failed to restore point", 400);
            }
          }
        }

        await tx.transaction.update({
          where: { uuid: transactionUuid },
          data: { status: "REJECT" },
        });
      });

      const userEmail = transaction.users.email;
      const fullName = transaction.users.fullName;
      this.mailService.sendEmail(
        userEmail,
        "Transaction Confirmation",
        "reject-transaction",
        { fullName, transactionUuid, linkUrl: "http://localhost:3000/" }
      );

      // organizerConfirmationQueue.remove(transactionUuid) JOB REMOVE

      return { message: "Reject transaction success" };
    } catch (error) {
      throw new ApiError("Transaction rejection failed.", 400);
    }
  };

  acceptTransaction = async (authUserId: number, transactionUuid: string) => {
    try {
      console.log("kena");

      const transaction = await this.prisma.transaction.findFirst({
        where: { uuid: transactionUuid, deletedAt: null },
        include: {
          transaction_details: true,
          users: { omit: { password: true } },
        },
      });

      if (!transaction) {
        throw new ApiError("Transaction not found", 400);
      }

      if (transaction.status !== "WAITING_CONFIRMATION") {
        throw new ApiError("Transaction not provide to confirm", 400);
      }

      const transactionDetails = await this.prisma.transactionDetail.findMany({
        where: { transactionId: transaction.id },
        include: {
          tickets: {
            include: {
              events: {
                select: {
                  id: true,
                  name: true,
                  users: { omit: { password: true } },
                },
              },
            },
          },
        },
      });

      if (!transactionDetails || transactionDetails.length === 0) {
        throw new ApiError("Transaction Ticket not found", 400);
      }

      transactionDetails.map((validating_ticket) => {
        if (validating_ticket.tickets.events.users.id !== authUserId) {
          throw new ApiError("unauthorize", 400);
        }
      });

      await this.prisma.transaction.update({
        where: { uuid: transactionUuid },
        data: { status: "PAID" },
      });

      const userEmail = transaction.users.email;
      const fullName = transaction.users.fullName;
      this.mailService.sendEmail(
        userEmail,
        "Transaction Confirmation",
        "accept-transaction",
        { fullName, transactionUuid, linkUrl: "http://localhost:3000/" }
      );

      return { message: "Accept transaction success" };
    } catch (error) {
      throw new ApiError("Transaction acception failed.", 400);
    }
  };
}
