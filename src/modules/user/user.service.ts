import { injectable } from "tsyringe";
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateOrganizerDTO, UpdateUserDTO } from "./dto/update-user.dto";
import { PasswordService } from "../auth/password.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@injectable()
export class UserService {
  private prisma: PrismaService;
  private passwordService: PasswordService;
  private cloudinaryService: CloudinaryService;

  constructor(
    PrismaClient: PrismaService,
    PasswordService: PasswordService,
    CloudinaryService: CloudinaryService
  ) {
    this.prisma = PrismaClient;
    this.passwordService = PasswordService;
    this.cloudinaryService = CloudinaryService;
  }

  getUsers = async ( ) => {
    return await this.prisma.user.findMany()
  }

  getUser = async (authUserId: number) => {
    const user = await this.prisma.user.findMany({
      where: { id: authUserId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  };

  updateOrganizer = async (
    body: UpdateOrganizerDTO,
    authUserId: number,
    profilePict: Express.Multer.File
  ) => {
    const user = await this.prisma.user.findFirst({
      where: { id: authUserId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (user.role !== "ORGANIZER") {
      throw new ApiError("Your account role is not ORGANIZER", 403);
    }

    if (body.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: body.email },
      });

      if (existingEmail && existingEmail.id !== authUserId) {
        throw new ApiError("Email already exists", 400);
      }
    }
    const updateData: Partial<UpdateOrganizerDTO> = {};

    if (body.fullName) updateData.fullName = body.fullName;
    if (body.email) updateData.email = body.email;
    if (body.bankAccount) updateData.bankAccount = body.bankAccount;
    if (body.bankName) updateData.bankName = body.bankName;
    if (body.phoneNumber) updateData.phoneNumber = body.phoneNumber;

    if (profilePict) {
      const { secure_url } = await this.cloudinaryService.upload(profilePict);
      updateData.profilePict = secure_url;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: authUserId },
      data: updateData,
    });

    const { password, ...safeResult } = updatedUser;
    return safeResult;
  };

  updateUser = async (body: UpdateUserDTO, authUserId: number) => {
    await this.findUserOrThrow(authUserId);

    if (body.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: body.email },
      });

      if (existingEmail && existingEmail.id !== authUserId) {
        throw new ApiError("Email already exists", 400);
      }
    }
    const updateData: Partial<UpdateUserDTO> = {};

    if (body.fullName) updateData.fullName = body.fullName;
    if (body.email) updateData.email = body.email;

    if (body.password) {
      const hashedPassword = await this.passwordService.hashPassword(
        body.password
      );
      updateData.password = hashedPassword;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: authUserId },
      data: updateData,
    });

    const { password, ...safeResult } = updatedUser;
    return safeResult;
  };

  private async findUserOrThrow(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (user.role !== "USER") {
      throw new ApiError("Your account role is not USER", 403);
    }

    return user;
  }
}
