export interface PSICOLOGODisponibilidadDTO {
    disponibilidadId?: number; // Opcional al crear
    psicologoId: number;
    diaSemana: string;
    horaInicio: string; // LocalTime se mapea a string
    horaFin: string;
}