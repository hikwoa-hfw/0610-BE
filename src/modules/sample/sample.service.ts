import { injectable } from "tsyringe";
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";

@injectable()
export class SampleService {
  private prisma: PrismaService;

  constructor(PrismaClient: PrismaService) {
    this.prisma = PrismaClient;
  }

  getSamples = async () => {
    const tx = await this.prisma.user.findMany()
    return tx;
  };

  getSample = async (id: number) => {
    const sample = await this.findSampleOrThrow(id);

    return sample;
  };

  private async findSampleOrThrow(id: number) {
    const sample = await this.prisma.sample.findFirst({
      where: { id },
    });

    if (!sample) {
      throw new ApiError("Sample not found", 404);
    }

    return sample;
  }
}
