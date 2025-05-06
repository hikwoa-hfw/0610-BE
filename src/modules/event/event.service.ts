import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { GetEventBySlugDTO } from "./dto/get.event.by.slug.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { GetEventsListByOrganizerDTO } from "./dto/get-events-list-by-organizer.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { generateSlug } from "../../utils/generate-slug";

@injectable()
export class EventService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor(
    PrismaClient: PrismaService,
    CloudinaryService: CloudinaryService
  ) {
    this.prisma = PrismaClient;
    this.cloudinaryService = CloudinaryService;
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
    console.log("tidak kena");

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
    const event = await this.prisma.event.findFirst({
      where: { slug, deletedAt: null },
    });

    if (!event) {
      throw new ApiError("Event tidak ditemukan", 404);
    }

    return event;
  };

  getEventOrganizerBySlug = async (slug: string) => {
    const event = await this.prisma.event.findFirst({
      where: { slug, deletedAt: null },
    });

    if (!event) {
      throw new ApiError("Event not found", 404);
    }

    return event;
  };

  updateEvent = async (
    body: UpdateEventDto,
    authUserId: number,
    slug: string,
    thumbnail?: Express.Multer.File
  ) => {
    const event = await this.prisma.event.findFirst({
      where: { slug },
    });

    if (!event) {
      throw new ApiError("Event not found", 404);
    }

    if (event.userId !== authUserId) {
      throw new ApiError("UNAUTHORIZED", 401);
    }

    let newSlug = event.slug;

    if (body.name) {
      const eventName = await this.prisma.event.findFirst({
        where: { name: body.name },
      });

      if (eventName) {
        throw new ApiError("Event name already exists", 400);
      }

      newSlug = generateSlug(body.name);
    }

    let newThumbnail = event.thumbnail;

    if (thumbnail) {
      if (event.thumbnail) {
        await this.cloudinaryService.remove(event.thumbnail);
      }

      const { secure_url } = await this.cloudinaryService.upload(thumbnail);
      newThumbnail = secure_url;
    }

    let newCategory = event.category;

    if (body.category) {
      newCategory = body.category;
    }

    return await this.prisma.event.update({
      where: { slug },
      data: {
        ...body,
        slug: newSlug,
        thumbnail: newThumbnail,
        category: newCategory,
      },
    });
  };

  deleteEvent = async (slug: string, authUserId: number) => {
    const event = await this.prisma.event.findFirst({
      where: { slug },
    });

    if (!event) {
      throw new ApiError("Invalid event", 404);
    }

    if (event.userId !== authUserId) {
      throw new ApiError("forbidden", 403);
    }

    if (event.deletedAt !== null) {
      throw new ApiError(`event has been deleted at ${event.deletedAt}`, 404);
    }

    await this.cloudinaryService.remove(event.thumbnail)

    await this.prisma.event.update({
      where: { slug },
      data: { deletedAt: new Date(), thumbnail: "" },
    });

    return {message:"delete event success"}
  };
}
