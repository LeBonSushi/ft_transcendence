import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsBoolean } from "class-validator"
import { 
  MemberRole, 
  VoteType, 
  ActivityCategory,
  CreateRoomDto as ICreateRoomDto,
  UpdateRoomDto as IUpdateRoomDto,
  UpdateRoleDto as IUpdateRoleDto,
  CreateAvailabilityDto as ICreateAvailabilityDto,
  UpdateAvailabilityDto as IUpdateAvailabilityDto,
  CreateProposalDto as ICreateProposalDto,
  UpdateProposalDto as IUpdateProposalDto,
  CreateActivityDto as ICreateActivityDto,
  UpdateActivityDto as IUpdateActivityDto,
  CreateVoteDto as ICreateVoteDto
} from '@travel-planner/shared';

// CRUD

export class CreateRoomDto implements ICreateRoomDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isPrivate?: boolean;
}

export class UpdateRoomDto implements IUpdateRoomDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

// roomMembers

export class UpdateRoleDto implements IUpdateRoleDto {
    @IsEnum(MemberRole)
    role: MemberRole;
}

// Availabilities

export class CreateAvailabilityDto implements ICreateAvailabilityDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateAvailabilityDto implements IUpdateAvailabilityDto {
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

export class CreateProposalDto implements ICreateProposalDto {
    @IsString()
    destination: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @IsNumber()
    budgetEstimate?: number;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class UpdateProposalDto implements IUpdateProposalDto {
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
    @IsNumber()
    budgetEstimate?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}

// Vote

export class CreateVoteDto implements ICreateVoteDto {
    @IsEnum(VoteType)
    vote: VoteType;
}

// Activities

export class CreateActivityDto implements ICreateActivityDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsEnum(ActivityCategory)
    category: 'RESTAURANT' | 'MUSEUM' | 'NIGHTLIFE' | 'OUTDOOR' | 'OTHER';

    @IsOptional()
    @IsNumber()
    estimatedPrice?: number;
}

export class UpdateActivityDto implements IUpdateActivityDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(ActivityCategory)
    category?: 'RESTAURANT' | 'MUSEUM' | 'NIGHTLIFE' | 'OUTDOOR' | 'OTHER';

    @IsOptional()
    @IsNumber()
    estimatedPrice?: number;
}
