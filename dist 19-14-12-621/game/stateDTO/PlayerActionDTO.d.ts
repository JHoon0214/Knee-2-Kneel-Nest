export declare class MoveDTO {
    x: number;
    y: number;
}
export declare class PositionDTO {
    x: number;
    y: number;
}
export declare class LookDTO {
    x: number;
    y: number;
}
export declare class PlayerActionDTO {
    roomId: number;
    playerIndex: number;
    dataName: String;
    move: MoveDTO;
    jump: boolean;
    sprint: boolean;
    kick: boolean;
    position: PositionDTO;
}
