export interface PSICOLOGOInformeDTO {
    informeId?: number; // Opcional al crear
    asignacionId: number;
    psicologoId: number;
    titulo: string;
    contenido: string;
    // Campos clínicos detallados
    motivoConsulta?: string;
    antecedentes?: string;
    pruebasAplicadas?: string;
    observacionConducta?: string;
    resultados?: string;
    conclusiones?: string;
    recomendaciones?: string;
    fechaCreacion: string;
    calificacionEficacia: number;
    // Campo enriquecido para mejor visualización
    nombreMenor?: string;
}