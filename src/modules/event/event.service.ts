import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { GetEventBySlugDTO } from "./dto/get.event.by.slug.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

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
