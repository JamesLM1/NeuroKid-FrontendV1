export interface ADMINCitaListDTO {
  citaId?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  motivo?: string;
  nombrePsicologo: string;
  nombreMenor: string;
  nombrePadre: string;
  psicologoId?: number;
  menorId?: number;
  padreId?: number;

  // Campos SOAP
  observaciones?: string;
  diagnostico?: string;
  planTratamiento?: string;
}

