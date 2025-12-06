import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINPsicologoDTO } from '../../../models/admin-psicologo.dto';

@Component({
  selector: 'app-add-edit-psicologo',
  standalone: false,
  templateUrl: './add-edit-psicologo.html',
  styleUrls: ['./add-edit-psicologo.css']
})
export class AddEditPsicologoComponent implements OnInit {

  addEditForm!: FormGroup;
  psicologoId: number | null = null;
  title: string = 'Nuevo Psicólogo';

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

  // Lista de especialidades
  especialidades = [
    'Neuropsicología Infantil', 
    'Psicología Clínica', 
    'Psicología Educativa', 
    'Terapia del Lenguaje', 
    'Terapia Ocupacional', 
    'Psicopedagogía'
  ];

  paisSeleccionado = this.paises[0]; // Perú por defecto

  // Getter para obtener los dígitos requeridos dinámicamente
  get digitosRequeridos(): number {
    return this.paisSeleccionado.digitos;
  }

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEditPsicologoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number | null }
  ) {
    this.psicologoId = data.id;
  }

  ngOnInit(): void {
    this.CargarFormulario();
    if (this.psicologoId) {
      this.title = 'Editar Psicólogo';
      this.CargarDatosParaEditar();
    } else {
      this.title = 'Nuevo Psicólogo';
    }
  }

  CargarFormulario(): void {
    this.addEditForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      tipoDocumento: ['DNI', Validators.required], // Valor default: 'DNI'
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]], // Validación inicial para DNI
      email: ['', [Validators.required, Validators.pattern(/^[^@]+$/)]], // Solo usuario, sin @
      dominioEmail: ['@gmail.com', Validators.required], // Dominio por defecto
      prefijo: ['+51', Validators.required], // Valor por defecto +51
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]*$/), Validators.minLength(9), Validators.maxLength(9)]],
      especialidad: ['', Validators.required],
      claveVisible: ['', Validators.required] // Contraseña visible
    });

    // Implementar validaciones dinámicas
    this.actualizarValidacionTelefono();
    this.actualizarValidacionDocumento();
    
    // Generar contraseña inicial si es modo crear
    if (!this.psicologoId) {
      this.generarClave();
    }
  }

  CargarDatosParaEditar(): void {
    this.adminService.getPsicologoById(this.psicologoId!).subscribe({
      next: (data: ADMINPsicologoDTO) => {
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
          especialidad: data.especialidad,
          claveVisible: data.claveVisible || '' // Cargar contraseña existente
        });
      },
      error: (err) => {
        this.snackBar.open('Error al cargar los datos del psicólogo', 'OK', { duration: 3000 });
      }
    });
  }

  Grabar(): void {
    if (this.addEditForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.addEditForm.controls).forEach(key => {
        this.addEditForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'OK', { 
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return; 
    }

    const psicologoData: ADMINPsicologoDTO = {
      psicologoId: this.psicologoId || 0,
      nombre: this.addEditForm.value.nombre.trim(),
      apellido: this.addEditForm.value.apellido.trim(),
      tipoDocumento: this.addEditForm.value.tipoDocumento,
      dni: this.addEditForm.value.dni.trim(),
      email: this.addEditForm.value.email + this.addEditForm.value.dominioEmail, // Concatenar usuario + dominio
      telefono: this.addEditForm.value.prefijo + ' ' + this.addEditForm.value.telefono, // Concatenar prefijo y teléfono
      especialidad: this.addEditForm.value.especialidad.trim(),
      claveVisible: this.addEditForm.value.claveVisible, // Incluir contraseña
      FechaRegistro: '' // El backend no debe actualizar esto
    };

    if (this.psicologoId) {
      // Modo EDITAR
      this.adminService.editPsicologo(this.psicologoId, psicologoData).subscribe({
        next: (data) => {
          this.snackBar.open('Psicólogo actualizado con éxito', 'OK', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          let errorMessage = 'Error al actualizar el psicólogo';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 404) {
            errorMessage = 'Psicólogo no encontrado';
          } else if (err.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor';
          }
          this.snackBar.open(`ERROR: ${errorMessage}`, 'OK', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Error al actualizar psicólogo:', err);
        }
      });
    } else {
      // Modo CREAR
      this.adminService.newPsicologo(psicologoData).subscribe({
        next: (data) => {
          this.snackBar.open('Psicólogo creado con éxito', 'OK', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          let errorMessage = 'Error al crear el psicólogo';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 400) {
            errorMessage = 'Datos inválidos. Verifique la información ingresada.';
          } else if (err.status === 409) {
            errorMessage = 'El psicólogo ya existe (DNI o email duplicado)';
          } else if (err.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor';
          }
          this.snackBar.open(`ERROR: ${errorMessage}`, 'OK', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Error al crear psicólogo:', err);
        }
      });
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
          numeroTelefono: telefonoCompleto.substring(pais.codigo.length).trim()
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

  onCancel(): void {
    this.dialogRef.close(false);
  }
}