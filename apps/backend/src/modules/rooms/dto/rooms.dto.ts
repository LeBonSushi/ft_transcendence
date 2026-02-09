import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from "class-validator"
import { MemberRole, VoteType, ActivityCategory } from '@travel-planner/shared';

// CRUD

export class CreateRoomDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description: string;
}

export class UpdateRoomDto {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description: string;
}

// roomMembers

export class UpdateRoleDto {
    @IsEnum(MemberRole)
    role: MemberRole;
}

// Availabilities

export class CreateAvailabilityDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateAvailabilityDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

// Proposals

export class CreateProposalDto {
  @IsString()
  destination: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  budgetEstimate?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateProposalDto {
  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  budgetEstimate?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

// Votes

export class VoteDto {
  @IsEnum(VoteType)
  vote: VoteType;
}

// Activities

export class CreateActivityDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @IsOptional()
  @IsNumber()
  estimatedPrice?: number;
}

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ActivityCategory)
  category?: ActivityCategory;

  @IsOptional()
  @IsNumber()
  estimatedPrice?: number;
}
