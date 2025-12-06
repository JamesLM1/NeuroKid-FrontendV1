export interface PSICOLOGOCitaResponseDTO {
    citaId: number;
    asignacionId: number;
    psicologoId: number;
    nombrePsicologo: string;
    padreId: number;
    nombreCompletoPadre: string;
    emailPadre: string;
    menorId: number;
    nombreCompletoMenor: string;
    fechaNacimientoMenor: string;
    fechaHoraCita: string;
    horaInicio: string;
    horaFin: string;
    motivoCita: string;
    estado: string;
    hallazgos: string;
    observaciones?: string;
    diagnostico?: string;
    planTratamiento?: string;
}