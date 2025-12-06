import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINPadreDTO } from '../../../models/admin-padre.dto';

@Component({
  selector: 'app-add-edit-padre',
  standalone: false,
  templateUrl: './add-edit-padre.html',
  styleUrls: ['./add-edit-padre.css']
})
export class AddEditPadreComponent implements OnInit {

  addEditForm!: FormGroup;
  padreId: number | null = null;
  title: string = 'Nuevo Padre/Apoderado';

  // Lista de países con códigos y validaciones
  paises = [
    { nombre: 'Perú', codigo: '+51', digitos: 9, bandera: '🇵🇪' },
    { nombre: 'México', codigo: '+52', digitos: 10, bandera: '🇲🇽' },
    { nombre: 'Colombia', codigo: '+57', digitos: 10, bandera: '🇨🇴' },
    { nombre: 'Chile', codigo: '+56', digitos: 9, bandera: '🇨🇱' },
    { nombre: 'Argentina', codigo: '+54', digitos: 10, bandera: '🇦🇷' },
    { nombre: 'EE.UU.', codigo: '+1', digitos: 10, bandera: '🇺🇸' },
    { nombre: 'España', codigo: '+34', digitos: 9, bandera: '🇪🇸' }
  ];

  // Lista de tipos de documento
  tiposDocumento = ['DNI', 'Carné de Extranjería', 'Pasaporte'];

  // Lista de dominios de email comunes
  dominios = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];

  paisSeleccionado = this.paises[0]; // Perú por defecto

  // Getter para obtener los dígitos requeridos dinámicamente
  get digitosRequeridos(): number {
    return this.paisSeleccionado.digitos;
  }

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEditPadreComponent>,
    // MAT_DIALOG_DATA inyecta los datos que pasamos al abrir (ej: el ID)
    @Inject(MAT_DIALOG_DATA) public data: { id: number | null }
  ) {
    this.padreId = data.id;
  }

  ngOnInit(): void {
    this.CargarFormulario();
    if (this.padreId) {
      this.title = 'Editar Padre/Apoderado';
      this.CargarDatosParaEditar();
    }
  }

  CargarFormulario(): void {
    this.addEditForm = this.fb.group({
      // No incluimos el ID ni fechaRegistro en el formulario, 
      // ya que son manejados por el backend.
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      tipoDocumento: ['DNI', Validators.required], // Valor default: 'DNI'
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]], // Validación inicial para DNI
      email: ['', [Validators.required, Validators.pattern(/^[^@]+$/)]], // Solo usuario, sin @
      dominioEmail: ['@gmail.com', Validators.required], // Dominio por defecto
      prefijo: ['+51', Validators.required], // Valor por defecto +51
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]*$/), Validators.minLength(9), Validators.maxLength(9)]],
      tipoParentesco: ['', Validators.required],
      claveVisible: ['', Validators.required] // Contraseña visible
    });

    // Implementar validaciones dinámicas
    this.actualizarValidacionTelefono();
    this.actualizarValidacionDocumento();
    
    // Generar contraseña inicial si es modo crear
    if (!this.padreId) {
      this.generarClave();
    }
  }

  actualizarValidacionTelefono(): void {
    // Suscribirse a los cambios de prefijo
    this.addEditForm.get('prefijo')?.valueChanges.subscribe(prefijo => {
      // Buscar el país seleccionado en la lista paises
      const paisSeleccionado = this.paises.find(p => p.codigo === prefijo) || this.paises[0];
      
      // Actualizar los validadores del control telefono
      const telefonoControl = this.addEditForm.get('telefono');
      if (telefonoControl) {
        telefonoControl.setValidators([
          Validators.required,
          Validators.pattern(/^[0-9]*$/), // Solo números
          Validators.minLength(paisSeleccionado.digitos),
          Validators.maxLength(paisSeleccionado.digitos)
        ]);
        
        // Actualizar validación
        telefonoControl.updateValueAndValidity();
      }
      
      // Actualizar país seleccionado para uso en template
      this.paisSeleccionado = paisSeleccionado;
    });
  }

  actualizarValidacionDocumento(): void {
    // Suscribirse a los cambios de tipoDocumento
    this.addEditForm.get('tipoDocumento')?.valueChanges.subscribe(tipoDocumento => {
      const documentoControl = this.addEditForm.get('dni');
      if (documentoControl) {
        if (tipoDocumento === 'DNI') {
          // DNI: Exactamente 8 números
          documentoControl.setValidators([
            Validators.required,
            Validators.pattern(/^[0-9]{8}$/)
          ]);
        } else if (tipoDocumento === 'Pasaporte' || tipoDocumento === 'Carné de Extranjería') {
          // Pasaporte/CE: 3-15 caracteres
          documentoControl.setValidators([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(15)
          ]);
        }
        
        // Actualizar validación
        documentoControl.updateValueAndValidity();
      }
    });
  }

  CargarDatosParaEditar(): void {
    this.adminService.getPadreById(this.padreId!).subscribe({
      next: (data: ADMINPadreDTO) => {
        // Separar prefijo y número de teléfono
        const { codigoPais, numeroTelefono } = this.separarTelefono(data.telefono);
        
        // Separar email en usuario y dominio
        const { usuario, dominio } = this.separarEmail(data.email);
        
        // Usamos patchValue para llenar el formulario con los datos
        this.addEditForm.patchValue({
          nombre: data.nombre,
          apellido: data.apellido,
          tipoDocumento: data.tipoDocumento || 'DNI', // Default si no existe
          dni: data.dni,
          email: usuario, // Solo la parte del usuario
          dominioEmail: dominio, // Solo el dominio
          prefijo: codigoPais,
          telefono: numeroTelefono,
          tipoParentesco: data.tipoParentesco,
          claveVisible: data.claveVisible || '' // Cargar contraseña existente
        });
      },
      error: (err) => {
        this.snackBar.open('Error al cargar los datos del padre', 'OK', { duration: 3000 });
      }
    });
  }

  Grabar(): void {
    if (this.addEditForm.invalid) {
      return; // Si el formulario es inválido, no hacer nada
    }

    // Construimos el DTO desde el formulario
    const padreData: ADMINPadreDTO = {
      padreId: this.padreId || 0, // 0 si es nuevo, o el ID si es edición
      nombre: this.addEditForm.value.nombre,
      apellido: this.addEditForm.value.apellido,
      tipoDocumento: this.addEditForm.value.tipoDocumento,
      dni: this.addEditForm.value.dni, // Ahora es numeroDocumento genérico
      email: this.addEditForm.value.email + this.addEditForm.value.dominioEmail, // Concatenar usuario + dominio
      telefono: this.addEditForm.value.prefijo + ' ' + this.addEditForm.value.telefono, // Concatenar prefijo y teléfono
      tipoParentesco: this.addEditForm.value.tipoParentesco,
      claveVisible: this.addEditForm.value.claveVisible, // Incluir contraseña
      fechaRegistro: '' // El backend la maneja, la enviamos vacía
    };

    if (this.padreId) {
      // Modo EDITAR
      this.adminService.editPadre(this.padreId, padreData).subscribe({
        next: (data) => {
          this.snackBar.open('Padre actualizado con éxito', 'OK', { duration: 3000 });
          this.dialogRef.close(true); // Cerramos el diálogo y enviamos 'true'
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Error al actualizar';
          this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', { duration: 5000 });
        }
      });
    } else {
      // Modo CREAR
      this.adminService.newPadre(padreData).subscribe({
        next: (data) => {
          this.snackBar.open('Padre creado con éxito', 'OK', { duration: 3000 });
          this.dialogRef.close(true); // Cerramos el diálogo y enviamos 'true'
        },
        error: (err) => {
          const errorMsg = err.error?.message || 'Error al crear';
          this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', { duration: 5000 });
        }
      });
    }
  }

  // Validador personalizado para teléfono según el país seleccionado
  validarTelefono(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Si está vacío, lo maneja el validator 'required'
    }

    const telefono = control.value.toString();
    const digitosEsperados = this.paisSeleccionado.digitos;

    // Verificar que solo contenga números
    if (!/^\d+$/.test(telefono)) {
      return { soloNumeros: true };
    }

    // Verificar longitud exacta según el país
    if (telefono.length !== digitosEsperados) {
      return { 
        longitudIncorrecta: { 
          actual: telefono.length, 
          esperada: digitosEsperados,
          pais: this.paisSeleccionado.nombre 
        } 
      };
    }

    return null; // Válido
  }

  // Método para obtener el teléfono completo con código de país
  getTelefonoCompleto(): string {
    const codigo = this.addEditForm.get('codigoPais')?.value || '';
    const numero = this.addEditForm.get('telefono')?.value || '';
    return `${codigo}${numero}`;
  }

  // Método para separar un teléfono completo en código de país y número
  separarTelefono(telefonoCompleto: string): { codigoPais: string, numeroTelefono: string } {
    if (!telefonoCompleto) {
      return { codigoPais: this.paises[0].codigo, numeroTelefono: '' };
    }

    // Buscar qué código de país coincide con el inicio del teléfono
    for (const pais of this.paises) {
      if (telefonoCompleto.startsWith(pais.codigo)) {
        return {
          codigoPais: pais.codigo,
          numeroTelefono: telefonoCompleto.substring(pais.codigo.length)
        };
      }
    }

    // Si no encuentra coincidencia, asumir que es solo el número (sin código)
    return { codigoPais: this.paises[0].codigo, numeroTelefono: telefonoCompleto };
  }

  // Método para separar un email completo en usuario y dominio
  separarEmail(emailCompleto: string): { usuario: string, dominio: string } {
    if (!emailCompleto || !emailCompleto.includes('@')) {
      return { usuario: emailCompleto || '', dominio: this.dominios[0] };
    }

    const partes = emailCompleto.split('@');
    const usuario = partes[0];
    const dominioCompleto = '@' + partes[1];

    // Verificar si el dominio está en nuestra lista
    const dominioEncontrado = this.dominios.find(d => d === dominioCompleto);
    
    return {
      usuario: usuario,
      dominio: dominioEncontrado || this.dominios[0] // Si no está en la lista, usar el primero
    };
  }

  // Método para generar contraseña aleatoria
  generarClave(): void {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let resultado = '';
    for (let i = 0; i < 6; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    // Asignar la nueva contraseña al formulario
    this.addEditForm.patchValue({
      claveVisible: resultado
    });
    
    console.log('Nueva contraseña generada:', resultado);
  }

  onCancel(): void {
    this.dialogRef.close(false); // Cerramos el diálogo y enviamos 'false'
  }
}
