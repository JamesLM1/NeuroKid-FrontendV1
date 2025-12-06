export interface ADMINPadreDTO {
    padreId: number;
    nombre: string;
    apellido: string;
    tipoDocumento: string;
    dni: string; // Ahora funciona como numeroDocumento genérico
    email: string;
    telefono: string;
    tipoParentesco: string;
    claveVisible?: string; // Contraseña en texto plano para mostrar al admin
    usuarioActivo?: boolean; // Estado del usuario (enabled/disabled)
    fechaRegistro: string;
}