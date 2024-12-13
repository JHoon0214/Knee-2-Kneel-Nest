import { IsBoolean, IsNumber, IsSemVer, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RemoveDTO {
  @IsString()
  dataName: String;

  @IsNumber()
  playerIndex: number;
}
