export interface DTOToken {
    jwtToken: string;
    id: number;
    authorities: string; // Roles separados por ;
}