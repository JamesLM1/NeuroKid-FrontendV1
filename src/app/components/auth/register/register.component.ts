import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { DTOUser } from '../../../models/dto-user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: false,
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  // Listas Maestras
  roles: string[] = ['ROLE_PADRE', 'ROLE_PSICOLOGO'];

  tiposDocumento = [
    { valor: 'DNI', etiqueta: 'DNI' },
    { valor: 'CE', etiqueta: 'Carnet Ext.' },
    { valor: 'PASAPORTE', etiqueta: 'Pasaporte' }
  ];

  paises = [
    { codigo: '+51', bandera: '🇵🇪', pais: 'Perú' },
    { codigo: '+1', bandera: '🇺🇸', pais: 'USA' },
    { codigo: '+34', bandera: '🇪🇸', pais: 'España' },
    { codigo: '+52', bandera: '🇲🇽', pais: 'México' },
    { codigo: '+54', bandera: '🇦🇷', pais: 'Argentina' },
    { codigo: '+56', bandera: '🇨🇱', pais: 'Chile' },
    { codigo: '+57', bandera: '🇨🇴', pais: 'Colombia' }
  ];

  dominios = [
    '@gmail.com',
    '@hotmail.com',
    '@outlook.com',
    '@yahoo.com',
    '@icloud.com',
    '@neurokid.com'
  ];

  especialidades = [
    'Psicología Clínica',
    'Psicología Educativa',
    'Neuropsicología',
    'Psicología Infantil',
    'Terapia Cognitivo-Conductual',
    'Terapia Familiar'
  ];

  parentescos = [
    'Padre',
    'Madre',
    'Tutor Legal',
    'Abuelo/a',
    'Tío/a',
    'Otro'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarFormulario();
  }

  CargarFormulario(): void {
    this.registerForm = this.formBuilder.group({
      // Datos de Cuenta
      authorities: ['', Validators.required],

      // Datos Personales
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],

      // Documento (Compuesto)
      tipoDocumento: ['DNI', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.pattern('^[0-9A-Za-z]{8,12}$')]],

      // Teléfono (Compuesto)
      prefijo: ['+51', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],

      // Email (Compuesto)
      emailUser: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+$')]],
      dominioEmail: ['@gmail.com', Validators.required],

      // Contraseña
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],

      // Campos Específicos (Validación condicional)
      especialidad: [''],
      tipoParentesco: ['']
    }, { validator: this.passwordMatchValidator });

    // Suscribirse a cambios de rol para validaciones dinámicas
    this.registerForm.get('authorities')?.valueChanges.subscribe(rol => {
      this.actualizarValidaciones(rol);
    });
  }

  actualizarValidaciones(rol: string) {
    const especialidadControl = this.registerForm.get('especialidad');
    const parentescoControl = this.registerForm.get('tipoParentesco');

    if (rol === 'ROLE_PSICOLOGO') {
      especialidadControl?.setValidators([Validators.required]);
      parentescoControl?.clearValidators();
    } else if (rol === 'ROLE_PADRE') {
      parentescoControl?.setValidators([Validators.required]);
      especialidadControl?.clearValidators();
    } else {
      especialidadControl?.clearValidators();
      parentescoControl?.clearValidators();
    }

    especialidadControl?.updateValueAndValidity();
    parentescoControl?.updateValueAndValidity();
  }

  // Validador custom para que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  Grabar(): void {
    if (this.registerForm.valid) {
      // Validar contraseñas nuevamente por seguridad
      if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
        this.snackBar.open('Las contraseñas no coinciden', 'OK', { duration: 3000 });
        return;
      }

      const formValues = this.registerForm.value;

      // Construir datos compuestos
      const emailCompleto = `${formValues.emailUser}${formValues.dominioEmail}`;
      const telefonoCompleto = `${formValues.prefijo} ${formValues.telefono}`;

      // Crear DTOUser
      const user: DTOUser = {
        username: emailCompleto,
        password: formValues.password,
        authorities: formValues.authorities,
        nombre: formValues.nombre,
        apellido: formValues.apellido,
        dni: formValues.numeroDocumento, // Mapeamos numeroDocumento a dni del DTO
        telefono: telefonoCompleto,
        tipoDocumento: formValues.tipoDocumento,
        // Campos opcionales según rol
        especialidad: formValues.authorities === 'ROLE_PSICOLOGO' ? formValues.especialidad : undefined,
        tipoParentesco: formValues.authorities === 'ROLE_PADRE' ? formValues.tipoParentesco : undefined
      };

      // Llamada al servicio
      this.authService.register(user).subscribe({
        next: (data: DTOUser) => {
          this.snackBar.open(`¡Bienvenido/a ${data.nombre}! Tu cuenta ha sido creada.`, 'OK', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (http_error: any) => {
          let errorMessage = 'No se pudo registrar el usuario';

          if (http_error.error) {
            if (http_error.error.message) {
              errorMessage = http_error.error.message;
            } else if (typeof http_error.error === 'string') {
              errorMessage = http_error.error;
            } else if (http_error.status === 409) {
              errorMessage = 'El correo electrónico ya está registrado.';
            }
          }

          this.snackBar.open(`ERROR: ${errorMessage}`, 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      this.snackBar.open('Por favor completa todos los campos requeridos.', 'OK', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }
}