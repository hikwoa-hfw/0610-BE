import { injectable } from "tsyringe";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";
import { createEventDTO } from "./dto/event.create.dto";

@injectable()
export class EventService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  createEvent = async (body: createEventDTO) => {
    const { name } = body;

    const event = await this.prisma.event.findFirst({
      where: { name },
    });

    if (event) {
      throw new ApiError("Event already created", 400);
    }

    const newEvent = await this.prisma.event.create({
      data: { ...body },
    });
    return newEvent;
  };
}
