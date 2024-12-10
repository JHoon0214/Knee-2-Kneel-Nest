import { IsBoolean, IsNumber, IsSemVer, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MoveDTO, PositionDTO } from './PlayerActionDTO';


// Main DTO 클래스
export class PlayerActionDTO {
  @IsNumber()
  info: number;

  @ValidateNested()
  @Type(() => PositionDTO)
  position: PositionDTO;
}
