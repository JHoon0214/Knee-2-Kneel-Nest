import { IsNumber, IsString } from "class-validator";

export class PlayerDTO {
    @IsString()
    address: string

    @IsNumber()
    port: number

    @IsNumber()
    lastActive: number

    @IsNumber()
    playerIndex: number

    @IsNumber()
    role: number
}