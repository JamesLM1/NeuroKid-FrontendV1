export interface DisponibilidadSlotDTO {
  psicologoId: number;
  nombrePsicologo: string;
  fecha: string; // YYYY-MM-DD format
  horariosDisponibles: string[]; // Array de horarios en formato "HH:mm"
  totalSlots: number;
  slotsOcupados: number;
  slotsDisponibles: number;
}
