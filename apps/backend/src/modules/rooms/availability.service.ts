import { Injectable, Inject, forwardRef, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from './dto/rooms.dto';
import { RoomsGateway } from './rooms.gateway';
import { USER_WITH_PROFILE } from './helpers/prisma-includes';

@Injectable()
export class AvailabilityService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => RoomsGateway))
    private roomsGateway: RoomsGateway,
  ) {}

  async getAvailabilities(roomId: string) {
    return this.prisma.userAvailability.findMany({
      where: { roomId },
      include: USER_WITH_PROFILE,
      orderBy: { startDate: 'asc' },
    });
  }

  async createAvailability(roomId: string, userId: string, data: CreateAvailabilityDto) {
    const availability = await this.prisma.userAvailability.create({
      data: {
        roomId,
        userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
      },
      include: USER_WITH_PROFILE,
    });

    this.roomsGateway.emitAvailabilityCreated(roomId, availability);

    return availability;
  }

  async updateAvailability(availabilityId: string, userId: string, data: UpdateAvailabilityDto) {
    const availability = await this.prisma.userAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.userId !== userId) {
      throw new ForbiddenException('You can only edit your own availability');
    }

    const updated = await this.prisma.userAvailability.update({
      where: { id: availabilityId },
      data: {
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        notes: data.notes,
      },
      include: USER_WITH_PROFILE,
    });

    this.roomsGateway.emitAvailabilityUpdated(availability.roomId, updated);

    return updated;
  }

  async deleteAvailability(availabilityId: string, userId: string) {
    const availability = await this.prisma.userAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.userId !== userId) {
      throw new ForbiddenException('You can only delete your own availability');
    }

    const result = await this.prisma.userAvailability.delete({
      where: { id: availabilityId },
    });

    this.roomsGateway.emitAvailabilityDeleted(availability.roomId, availabilityId);

    return result;
  }
}
