import { scheduleJob } from "node-schedule";
import prisma from "../../config/prisma";

// point valid until
scheduleJob("validate-expired-point", "0 0 * * *", async () => {
  console.log("Running cron job to validate expired user points...");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredPoints = await prisma.point.findMany({
      where: {
        validUntil: {
          lte: today, 
        },
        amount: {
          gt: 0, 
        },
      },
    });

    for (const point of expiredPoints) {
      await prisma.point.update({
        where: { id: point.id },
        data: {
          amount: 0, 
        },
      });

      console.log(`Point ID ${point.id} has been updated to 0 due to expiration.`);
    }

    console.log("Cron job completed successfully.");
  } catch (error) {
    console.error("Error occurred while running cron job:", error);
  }
});

// Coupon valid until
scheduleJob("validate-expired-coupon", "0 0 * * *", async () => {
    console.log("Running cron job to validate expired user coupons...");
  
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const expiredCoupons = await prisma.coupon.findMany({
        where: {
          validUntil: {
            lte: today, 
          },
          amount: {
            gt: 0, 
          },
        },
      });
  
      for (const coupon of expiredCoupons) {
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            amount: 0, 
          },
        });
  
        console.log(`Coupon ID ${coupon.id} has been updated to 0 due to expiration.`);
      }
  
      console.log("Cron job completed successfully.");
    } catch (error) {
      console.error("Error occurred while running cron job:", error);
    }
  });