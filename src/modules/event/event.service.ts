import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { GetEventBySlugDTO } from "./dto/get.event.by.slug.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { GetEventsListByOrganizerDTO } from "./dto/get-events-list-by-organizer.dto";

@injectable()
export class EventService {
  private prisma: PrismaService;

  constructor(
    PrismaClient: PrismaService,
    cloudinaryService: CloudinaryService
  ) {
    this.prisma = PrismaClient;
  }

  createEvent = async (body: any) => {
    const { name } = body;

    const event = await this.prisma.event.findFirst({
      where: { name },
    });

    if (event) {
      throw new ApiError("Event already created", 400);
    }
  };

  getEventsListByOrganizer = async (
    authUserId: number,
    query: GetEventsListByOrganizerDTO
  ) => {
    // console.log("tidak kena");

    const { page, sortBy, sortOrder, take, search } = query;

    const events = await this.prisma.event.findMany({
      where: { userId: authUserId, deletedAt: null },
      include: {
        transactions: {
          select: {
            uuid: true,
            couponAmount: true,
            voucherAmount: true,
            pointAmount: true,
            paymentProof: true,
            transaction_details: {
              select: { qty: true, tickets: { select: { type: true } } },
            },
          },
        },
        reviews: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take,
    });

    // console.log(events);

    if (!events) {
      throw new ApiError("Events not found", 400);
    }

    const count = await this.prisma.event.count({
      where: { userId: authUserId, deletedAt: null },
    });

    return {
      data: events,
      meta: { page, take, total: count },
    };
  };

  getEvents = async () => {
    const events = await this.prisma.event.findMany({
      where: { deletedAt: null },
    });
    return { events: events };
  };

  getEventBySlug = async (slug: string) => {
    const eventBySlug = await this.prisma.event.findFirst({
      where: { slug, deletedAt: null },
    });

    if (!eventBySlug) {
      throw new ApiError("Event tidak ditemukan", 404);
    }

    return { event: eventBySlug };
  };
}
