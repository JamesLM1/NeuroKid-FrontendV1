export interface PADRECitaResponseDTO {
    citaId: number;
    asignacionId: number;
    nombreMenor: string;
    nombrePsicologo: string;
    fecha: string;
    horaInicio: string;
    motivo: string;
    hallazgos: string;
    observaciones?: string;
    diagnostico?: string;
    planTratamiento?: string;
    estado: string;
    tieneEvaluacion: boolean;
}