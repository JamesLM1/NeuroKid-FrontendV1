export interface PADRESolicitudCitaDTO {
  menorId: number;
  psicologoId: number;
  fecha: string; // YYYY-MM-DD format
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estado?: string;
}
