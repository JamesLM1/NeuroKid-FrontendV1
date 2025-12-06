import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'; // <-- Importar ReactiveFormsModule
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'; // <-- Importar MatDialogModule
import { MatSnackBar } from '@angular/material/snack-bar';
import { PsicologoService } from '../../../services/psicologo.service';
import { AuthService } from '../../../services/auth.service';
import { PSICOLOGODisponibilidadDTO } from '../../../models/psicologo-disponibilidad.dto';
import { Subscription } from 'rxjs';

// Módulos necesarios para la plantilla HTML
import { CommonModule } from '@angular/common'; // <-- Para *ngFor
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-edit-disponibilidad',
  standalone: true,
  imports: [ // <-- 1. CORRECCIÓN: AÑADIDOS TODOS LOS MÓDULOS NECESARIOS
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-edit-disponibilidad.html',
  styleUrls: ['./add-edit-disponibilidad.css']
})
export class AddEditDisponibilidadComponent implements OnInit, OnDestroy {

  addEditForm!: FormGroup;
  title: string = 'Añadir Bloque de Disponibilidad';
  psicologoId: number;
  diasSemana: string[] = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
  horarios: string[] = [];
  dataToEdit: PSICOLOGODisponibilidadDTO | null = null;
  isEditMode: boolean = false;
  private formSubscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private psicologoService: PsicologoService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEditDisponibilidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { data: PSICOLOGODisponibilidadDTO | null } // Recibimos el objeto
  ) {
    this.psicologoId = this.authService.getUserId()!;
    if (data && data.data && data.data.disponibilidadId) {
      this.dataToEdit = data.data;
      this.isEditMode = true;
      this.title = 'Editar Bloque de Disponibilidad';
    } else {
      this.title = 'Añadir Bloque de Disponibilidad';
    }
    this.generarHorarios();
  }

  ngOnInit(): void {
    this.CargarFormulario();
  }

  /**
   * Genera una lista de horarios desde las 08:00 hasta las 20:00 en intervalos de 30 minutos
   */
  generarHorarios(): void {
    this.horarios = [];
    const horaInicio = 8; // 08:00
    const horaFin = 20; // 20:00
    
    for (let hora = horaInicio; hora <= horaFin; hora++) {
      // Agregar hora completa (ej: 08:00, 09:00)
      this.horarios.push(`${hora.toString().padStart(2, '0')}:00`);
      
      // Agregar media hora (ej: 08:30, 09:30) excepto para la última hora
      if (hora < horaFin) {
        this.horarios.push(`${hora.toString().padStart(2, '0')}:30`);
      }
    }
  }

  /**
   * Normaliza el formato de hora de "HH:mm:ss" o "HH:mm" a "HH:mm"
   * Ejemplo: "10:00:00" -> "10:00", "09:30" -> "09:30"
   */
  normalizarHora(hora: string | undefined): string {
    if (!hora) return '';
    // Si tiene segundos, eliminar la parte de los segundos
    if (hora.includes(':')) {
      const partes = hora.split(':');
      return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
    }
    return hora;
  }

  /**
   * Convierte una hora en formato "HH:mm" a minutos desde medianoche para comparación
   * Ejemplo: "10:30" -> 630 (10*60 + 30)
   */
  horaAMinutos(hora: string): number {
    if (!hora) return 0;
    const partes = hora.split(':');
    const horas = parseInt(partes[0], 10) || 0;
    const minutos = parseInt(partes[1], 10) || 0;
    return horas * 60 + minutos;
  }

  /**
   * Validador personalizado para verificar que la hora de fin sea al menos 1 hora posterior a la hora de inicio
   * Este validador se aplica a nivel de formulario
   */
  validarCoherenciaHoraria: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    if (!formGroup) return null;

    const horaInicio = formGroup.get('horaInicio')?.value;
    const horaFin = formGroup.get('horaFin')?.value;

    if (!horaInicio || !horaFin) {
      return null; // Si falta algún valor, no validamos aún (se validará con required)
    }

    const minutosInicio = this.horaAMinutos(horaInicio);
    const minutosFin = this.horaAMinutos(horaFin);
    const diferenciaMinutos = minutosFin - minutosInicio;
    const MINIMO_HORAS = 60; // Mínimo 1 hora de diferencia

    if (diferenciaMinutos < MINIMO_HORAS) {
      // Establecer error en el control de horaFin
      formGroup.get('horaFin')?.setErrors({ horarioInvalido: true });
      return { horarioInvalido: true };
    } else {
      // Limpiar el error si la validación pasa
      const horaFinControl = formGroup.get('horaFin');
      if (horaFinControl?.hasError('horarioInvalido')) {
        const errors = { ...horaFinControl.errors };
        delete errors['horarioInvalido'];
        horaFinControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }

    return null;
  };

  CargarFormulario(): void {
    // Normalizar las horas al formato "HH:mm" para que coincidan con las opciones del selector
    const horaInicioNormalizada = this.normalizarHora(this.dataToEdit?.horaInicio);
    const horaFinNormalizada = this.normalizarHora(this.dataToEdit?.horaFin);
    
    this.addEditForm = this.fb.group({
      diaSemana: [this.dataToEdit?.diaSemana || null, Validators.required],
      horaInicio: [horaInicioNormalizada || '', Validators.required],
      horaFin: [horaFinNormalizada || '', Validators.required]
    }, { validators: this.validarCoherenciaHoraria });

    // Suscribirse a cambios en horaInicio para re-validar horaFin
    const subInicio = this.addEditForm.get('horaInicio')?.valueChanges.subscribe(() => {
      this.addEditForm.get('horaFin')?.updateValueAndValidity();
    });
    if (subInicio) {
      this.formSubscriptions.push(subInicio);
    }

    // Suscribirse a cambios en horaFin para re-validar
    const subFin = this.addEditForm.get('horaFin')?.valueChanges.subscribe(() => {
      this.addEditForm.get('horaFin')?.updateValueAndValidity();
    });
    if (subFin) {
      this.formSubscriptions.push(subFin);
    }
  }

  Grabar(): void {
    if (this.addEditForm.invalid) {
      this.addEditForm.markAllAsTouched(); // Para mostrar errores
      return;
    }

    // Validación adicional de coherencia horaria (respaldo)
    const horaInicio = this.addEditForm.value.horaInicio;
    const horaFin = this.addEditForm.value.horaFin;
    
    if (horaInicio && horaFin) {
      const minutosInicio = this.horaAMinutos(horaInicio);
      const minutosFin = this.horaAMinutos(horaFin);
      const diferenciaMinutos = minutosFin - minutosInicio;
      const MINIMO_HORAS = 60; // Mínimo 1 hora de diferencia
      
      if (diferenciaMinutos < MINIMO_HORAS) {
        this.snackBar.open('La hora de fin debe ser al menos 1 hora posterior a la hora de inicio', 'OK', { duration: 3000 });
        this.addEditForm.get('horaFin')?.setErrors({ horarioInvalido: true });
        this.addEditForm.get('horaFin')?.markAsTouched();
        return;
      }
    }

    const disponibilidadData: PSICOLOGODisponibilidadDTO = {
      disponibilidadId: this.dataToEdit?.disponibilidadId || undefined,
      psicologoId: this.psicologoId,
      diaSemana: this.addEditForm.value.diaSemana,
      horaInicio: this.addEditForm.value.horaInicio,
      horaFin: this.addEditForm.value.horaFin
    };

    // Verificar si el día cambió durante la edición
    const diaCambio = this.isEditMode && 
                      this.dataToEdit?.diaSemana && 
                      this.dataToEdit.diaSemana !== this.addEditForm.value.diaSemana;

    // Si estamos editando y el día cambió, necesitamos eliminar la original primero
    // porque el backend busca por día y no encontrará la disponibilidad original
    if (diaCambio && this.dataToEdit?.disponibilidadId) {
      // Eliminar la disponibilidad original
      this.psicologoService.deleteDisponibilidad(this.dataToEdit.disponibilidadId).subscribe({
        next: () => {
          // Luego crear la nueva con el nuevo día
          this.psicologoService.newDisponibilidad(disponibilidadData).subscribe({
            next: (data) => {
              this.snackBar.open('Disponibilidad actualizada con éxito', 'OK', { duration: 3000 });
              this.dialogRef.close(true);
            },
            error: (err) => this.snackBar.open(`ERROR: ${err.error?.message || 'Error al actualizar'}`, 'OK')
          });
        },
        error: (err) => {
          this.snackBar.open(`ERROR: ${err.error?.message || 'Error al eliminar disponibilidad anterior'}`, 'OK');
        }
      });
    } else {
      // Si no cambió el día o es modo crear, usar POST (el backend actualiza si existe por día)
      this.psicologoService.newDisponibilidad(disponibilidadData).subscribe({
        next: (data) => {
          const mensaje = this.isEditMode ? 'Disponibilidad actualizada con éxito' : 'Disponibilidad creada con éxito';
          this.snackBar.open(mensaje, 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          const mensajeError = this.isEditMode ? 'Error al actualizar' : 'Error al guardar';
          this.snackBar.open(`ERROR: ${err.error?.message || mensajeError}`, 'OK');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones para evitar memory leaks
    this.formSubscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Verifica si hay error de coherencia horaria para mostrar en el template
   * Valida que la diferencia sea al menos 1 hora (60 minutos)
   */
  tieneErrorHorario(): boolean {
    const horaInicio = this.addEditForm?.get('horaInicio')?.value;
    const horaFin = this.addEditForm?.get('horaFin')?.value;
    
    if (!horaInicio || !horaFin) {
      return false;
    }
    
    const minutosInicio = this.horaAMinutos(horaInicio);
    const minutosFin = this.horaAMinutos(horaFin);
    const diferenciaMinutos = minutosFin - minutosInicio;
    const MINIMO_HORAS = 60; // Mínimo 1 hora de diferencia
    
    return diferenciaMinutos < MINIMO_HORAS;
  }
}