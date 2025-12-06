export interface PADREInformeDTO {
    informeId: number;
    id?: number; // Alias para compatibilidad
    menorId: number;
    nombreMenor: string;
    mes: number;
    anio: number;
    resumen: string;
    // Campos clínicos detallados
    motivoConsulta?: string;
    antecedentes?: string;
    pruebasAplicadas?: string;
    observacionConducta?: string;
    resultados?: string;
    conclusiones?: string;
    recomendaciones?: string;
    // Campos enriquecidos para mejor visualización
    fechaCreacion?: string;
    nombrePsicologo?: string;
    titulo?: string; // Título del informe (para búsqueda inteligente)
    calificacionEficacia?: number; // Puntaje del 1 al 5
}