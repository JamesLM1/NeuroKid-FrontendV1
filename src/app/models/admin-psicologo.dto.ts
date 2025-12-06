export interface ADMINPsicologoDTO {
    psicologoId: number;
    nombre: string;
    apellido: string;
    tipoDocumento?: string; // Tipo de documento (DNI, Pasaporte, CE)
    dni: string; // Número de documento genérico
    especialidad: string;
    email: string;
    telefono: string;
    claveVisible?: string; // Contraseña en texto plano para mostrar al admin
    usuarioActivo?: boolean; // Estado del usuario (enabled/disabled)
    FechaRegistro: string;
}