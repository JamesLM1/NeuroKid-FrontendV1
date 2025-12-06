export interface ADMINEvaluacionListDTO {
  evaluacionId: number;
  fechaEvaluacion: string; // Formato: "yyyy-MM-dd" (LocalDate)
  puntaje: number; // 1-5
  comentario: string;
  nombrePsicologo: string;
  nombrePadre: string;
}

