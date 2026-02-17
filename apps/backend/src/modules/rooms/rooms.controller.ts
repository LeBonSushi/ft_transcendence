import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { 
  CreateRoomDto, 
  UpdateRoomDto, 
  UpdateRoleDto, 
  CreateAvailabilityDto, 
  UpdateAvailabilityDto, 
  CreateProposalDto,
  UpdateProposalDto,
  VoteDto,
  CreateActivityDto,
  UpdateActivityDto
} from './dto/rooms.dto'

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  // CRUD ROOMS
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @GetUser('id') userId: string, 
    @Body() body: CreateRoomDto
  ) {
    return this.roomsService.create(userId, body); 
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Put(':id')
  async updateRoom(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateRoomDto
  ) {
    return this.roomsService.updateRoom(id, userId, dto);
  }

  @Delete(':id')
  async deleteRoom(
    @Param('id') id: string,
    @GetUser('id') userId: string
  ) {
    return this.roomsService.deleteRoom(id, userId);
  }

  // RoomMembers
  @Post(':id/join')
  async joinRoom(
    @Param('id') roomId: string,
    @GetUser('id') userId: string
  ) {
    return this.roomsService.joinRoom(roomId, userId);
  }

  @Post(':id/leave')
  async leaveRoom(
    @Param('id') roomId: string,
    @GetUser('id') userId: string
  ) {
    return this.roomsService.leaveRoom(roomId, userId);
  }

  @Get(':id/members')
  async getMembers(@Param('id') roomId: string) {
    return this.roomsService.getMembers(roomId);
  }

  @Put(':roomId/members/:userId/role')
  async updateMemberRole(
    @Param('roomId') roomId: string,
    @Param('userId') targetUserId: string,
    @GetUser('id') requesterId: string,
    @Body() dto: UpdateRoleDto
  ) {
    return this.roomsService.updateMemberRole(
      roomId,
      targetUserId,
      dto.role,
      requesterId
    );
  }

  @Delete(':roomId/members/:userId')
  async kickMember(
    @Param('roomId') roomId: string,
    @Param('userId') targetUserId: string,
    @GetUser('id') requesterId: string
  ) {
    return this.roomsService.kickMember(roomId, targetUserId, requesterId);
  }

  // Avalabilities

  @Get(':roomId/availability')
  async getAvailabilities(@Param('roomId') roomId: string) {
    return this.roomsService.getAvailabilities(roomId);
  }

  @Post(':roomId/availability')
  @HttpCode(HttpStatus.CREATED)
  async createAvailability(
  @Param('roomId') roomId: string,
  @GetUser('id') userId: string,
  @Body() dto: CreateAvailabilityDto
  ) {
    return this.roomsService.createAvailability(roomId, userId, dto);
  }


  @Put(':roomId/availability/:id')
  async updateAvailability(
  @Param('id') availabilityId: string,
  @GetUser('id') userId: string,
  @Body() dto: UpdateAvailabilityDto
  ) {
    return this.roomsService.updateAvailability(availabilityId, userId, dto);
  }


  @Delete(':roomId/availability/:id')
  async deleteAvailability(
  @Param('id') availabilityId: string,
  @GetUser('id') userId: string
  ) {
    return this.roomsService.deleteAvailability(availabilityId, userId);
  }

  // Proposals

  @Get(':roomId/proposals')
  async getProposals(@Param('roomId') roomId: string) {
    return this.roomsService.getProposals(roomId);
  }

  @Post(':roomId/proposals')
  @HttpCode(HttpStatus.CREATED)
  async createProposal(
    @Param('roomId') roomId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateProposalDto
  ) {
    return this.roomsService.createProposal(roomId, userId, dto);
  }

  @Put(':roomId/proposals/:id')
  async updateProposal(
    @Param('id') proposalId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateProposalDto
  ) {
    return this.roomsService.updateProposal(proposalId, userId, dto);
  }

  @Delete(':roomId/proposals/:id')
  async deleteProposal(
    @Param('id') proposalId: string,
    @GetUser('id') userId: string
  ) {
    return this.roomsService.deleteProposal(proposalId, userId);
  }

  @Post(':roomId/proposals/:id/select')
  async selectProposal(
    @Param('id') proposalId: string,
    @GetUser('id') userId: string
  ) {
    return this.roomsService.selectProposal(proposalId, userId);
  }

  // Vote

  @Get(':roomId/proposals/:proposalId/votes')
  async getVotes(@Param('proposalId') proposalId: string) {
    return this.roomsService.getVotes(proposalId);
  }

  @Post(':roomId/proposals/:proposalId/vote')
  @HttpCode(HttpStatus.CREATED)
  async voteOnProposal(
    @Param('proposalId') proposalId: string,
    @GetUser('id') userId: string,
    @Body() dto: VoteDto
  ) {
    return this.roomsService.voteOnProposal(proposalId, userId, dto.vote);
  }

  @Put(':roomId/proposals/:proposalId/vote')
  async updateVote(
    @Param('proposalId') proposalId: string,
    @GetUser('id') userId: string,
    @Body() dto: VoteDto
  ) {
    return this.roomsService.updateVote(proposalId, userId, dto.vote);
  }

  @Delete(':roomId/proposals/:proposalId/vote')
  async deleteVote(
    @Param('proposalId') proposalId: string,
    @GetUser('id') userId: string
  ) {
    return this.roomsService.deleteVote(proposalId, userId);
  }

  //  Activities
  @Get(':roomId/proposals/:proposalId/activities')
  async getActivities(@Param('proposalId') proposalId: string) {
    return this.roomsService.getActivities(proposalId);
  }

  @Post(':roomId/proposals/:proposalId/activities')
  @HttpCode(HttpStatus.CREATED)
  async createActivity(
    @Param('proposalId') proposalId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateActivityDto
  ) {
    return this.roomsService.createActivity(proposalId, userId, dto);
  }

  @Put(':roomId/proposals/:proposalId/activities/:id')
  async updateActivity(
    @Param('id') activityId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateActivityDto
  ) {
    return this.roomsService.updateActivity(activityId, userId, dto);
  }

  @Delete(':roomId/proposals/:proposalId/activities/:id')
  async deleteActivity(
    @Param('id') activityId: string,
    @GetUser('id') userId: string
  ) {
    return this.roomsService.deleteActivity(activityId, userId);
  }

}
