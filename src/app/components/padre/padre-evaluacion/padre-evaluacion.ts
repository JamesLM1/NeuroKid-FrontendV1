import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PadreService } from '../../../services/padre.service';
import { PADRECitaResponseDTO } from '../../../models/padre-cita-response.dto';
import { PADREEvaluacionPsicologoDTO } from '../../../models/padre-evaluacion-psicologo.dto';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-padre-evaluacion',
  standalone: false,
  templateUrl: './padre-evaluacion.html',
  styleUrls: ['./padre-evaluacion.css']
})
export class PadreEvaluacionComponent implements OnInit {

  evaluacionForm!: FormGroup;
  citasAtendidas: PADRECitaResponseDTO[] = [];
  padreId: number;

  puntajes: number[] = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private padreService: PadreService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.padreId = this.authService.getUserId()!;
  }

  ngOnInit(): void {
    this.CargarFormulario();
    this.CargarDatos();
  }

  CargarFormulario(): void {
    this.evaluacionForm = this.fb.group({
      citaId: [null, Validators.required],
      puntaje: [5, Validators.required],
      comentario: ['', Validators.required]
    });
  }

  CargarDatos(): void {
    // Cargamos solo el historial de citas finalizadas
    this.padreService.getMiHistorialCitas().subscribe({
      next: (data) => {
        this.citasAtendidas = data.filter(c => c.estado === 'Finalizada');
        
        if (this.citasAtendidas.length === 0) {
          this.snackBar.open('No tienes citas finalizadas para evaluar', 'OK', { 
            duration: 4000,
            panelClass: ['warning-snackbar']
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.snackBar.open('Error al cargar datos para evaluación', 'OK', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  Grabar(): void {
    console.log('🔵 Grabar() llamado'); // Debug
    console.log('Form válido?', this.evaluacionForm.valid);
    console.log('Form values:', this.evaluacionForm.value);

    if (this.evaluacionForm.invalid) {
      console.log('❌ Formulario inválido');
      Object.keys(this.evaluacionForm.controls).forEach(key => {
        const control = this.evaluacionForm.get(key);
        console.log(`  ${key}:`, control?.value, 'válido:', control?.valid);
        control?.markAsTouched();
      });
      this.snackBar.open('Por favor complete todos los campos requeridos', 'OK', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const citaId = this.evaluacionForm.value.citaId;
    const citaSeleccionada = this.citasAtendidas.find(c => c.citaId === citaId);
    
    console.log('📋 Cita seleccionada:', citaSeleccionada);
    
    if (!citaSeleccionada) {
      this.snackBar.open('Error: Cita no encontrada', 'OK', {
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Crear el DTO para enviar (el backend obtendrá el psicólogoId de la cita)
    const evaluacionData: PADREEvaluacionPsicologoDTO = {
      evaluacionId: 0,
      padreId: this.padreId,
      psicologoId: 0, // El backend lo extraerá de la cita
      puntaje: this.evaluacionForm.value.puntaje,
      comentario: this.evaluacionForm.value.comentario.trim(),
      fechaEvaluacion: new Date().toISOString()
    };

    console.log('📤 Enviando evaluación:', evaluacionData);

    // Enviamos la evaluación con el citaId
    this.padreService.evaluarPsicologoPorCita(citaId, evaluacionData).subscribe({
      next: (response) => {
        console.log('✅ Evaluación guardada exitosamente:', response);
        this.snackBar.open('¡Evaluación enviada con éxito! Gracias por tu feedback.', 'OK', { 
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        this.evaluacionForm.reset({ puntaje: 5 });
        // Recargar las citas para actualizar la lista de citas evaluables
        this.CargarDatos();
      },
      error: (err) => {
        console.error('❌ Error al enviar evaluación:', err);
        const errorMsg = err.error?.message || err.message || 'No se pudo enviar la evaluación';
        this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
