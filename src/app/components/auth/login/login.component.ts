import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { DTOToken } from '../../../models/dto-token';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  hidePassword: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // 1. Cargar el formulario (como en el ejemplo de tu profesor)
    this.CargarFormulario();
  }

  CargarFormulario(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  /**
   * Método para manejar el inicio de sesión
   */
  Grabar(): void {
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      // 2. Llamar al servicio de autenticación
      this.authService.login({ username, password }).subscribe({
        next: (data: DTOToken) => {
          
          // 3. Mostrar SnackBar de éxito
          this.snackBar.open('¡Inicio de sesión exitoso!', 'OK', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // 4. Redirigir al dashboard correcto según el ROL
          setTimeout(() => {
            if (data.authorities && data.authorities.includes('ROLE_ADMIN')) {
              this.router.navigate(['/admin']);
            } else if (data.authorities && data.authorities.includes('ROLE_PSICOLOGO')) {
              this.router.navigate(['/psicologo']);
            } else if (data.authorities && data.authorities.includes('ROLE_PADRE')) {
              this.router.navigate(['/padre']);
            } else {
              this.router.navigate(['/']); // Ruta por defecto
            }
          }, 500);
        },
        error: (http_error: any) => {
          // 5. Mostrar SnackBar de error con mejor manejo
          let errorMessage = 'Credenciales incorrectas';
          
          if (http_error.error) {
            if (http_error.error.message) {
              errorMessage = http_error.error.message;
            } else if (typeof http_error.error === 'string') {
              errorMessage = http_error.error;
            } else if (http_error.status === 401) {
              errorMessage = 'Usuario o contraseña incorrectos';
            } else if (http_error.status === 403) {
              errorMessage = 'Acceso denegado. Contacte al administrador.';
            } else if (http_error.status === 0) {
              errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
            } else if (http_error.status >= 500) {
              errorMessage = 'Error del servidor. Intente más tarde.';
            }
          }
          
          this.snackBar.open(`ERROR: ${errorMessage}`, 'OK', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Error en login:', http_error);
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.snackBar.open('Por favor, complete todos los campos requeridos.', 'OK', { 
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }
}