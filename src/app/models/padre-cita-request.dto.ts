export interface PADRECitaRequestDTO {
    asignacionId: number;
    fecha: string;
    horaInicio: string; // 'Time' de Java se mapea a string
    horaFin: string;
    motivo: string;
    estado: string;
}