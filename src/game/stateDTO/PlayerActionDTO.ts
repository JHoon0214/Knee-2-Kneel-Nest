import { IsBoolean, IsNumber, IsSemVer, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// MoveDTO: move 필드를 정의한 클래스
export class MoveDTO {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

// LookDTO: look 필드를 정의한 클래스
export class LookDTO {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

// Main DTO 클래스
export class PlayerActionDTO {
  @IsNumber()
  roomId: number;

  @IsNumber()
  playerIndex: number;

  @IsString()
  dataName: String;

  @ValidateNested()
  @Type(() => MoveDTO)
  move: MoveDTO;

  @IsBoolean()
  jump: boolean;

  @IsBoolean()
  sprint: boolean;

  @IsBoolean()
  kick: boolean;
}
