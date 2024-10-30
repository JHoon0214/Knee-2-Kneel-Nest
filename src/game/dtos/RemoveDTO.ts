import { IsBoolean, IsNumber, IsSemVer, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// MoveDTO: move 필드를 정의한 클래스
export class MoveDTO {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class PositionDTO {
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

export class RemoveDTO {
  @IsString()
  dataName: String;

//   @IsNumber()
//   playerIndex: number;
}
