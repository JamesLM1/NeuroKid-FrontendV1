export interface PADREMenorDTO {
  menorId?: number;        // Opcional: undefined al crear nuevos registros
  padreId?: number;        // Opcional: inyectado por el servicio
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // String por compatibilidad con fechas
  diagnostico?: string;    // Opcional: campo adicional para diagnóstico
  edad?: number;           // Opcional: calculado dinámicamente
  gradoEscolar?: string;
  motivoConsulta?: string;
}