import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PadreService } from '../../../services/padre.service';
import { AuthService } from '../../../services/auth.service';
import { PADREMenorDTO } from '../../../models/padre-menor.dto';

@Component({
  selector: 'app-add-edit-menor',
  standalone: false,
  templateUrl: './add-edit-menor.html',
  styleUrls: ['./add-edit-menor.css']
})
export class AddEditMenorComponent implements OnInit {

  addEditForm!: FormGroup;
  menorId: number | null = null;
  padreId: number;
  title: string = 'Registrar Menor';
  maxDate: Date = new Date(); // Fecha máxima: hoy (no se pueden registrar niños nacidos en el futuro)

  gradosEscolares: string[] = [
    'Nido / Inicial', 'Pre-Kinder', 'Kinder',
    '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
    '1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria',
    'No escolarizado'
  ];

  constructor(
    private fb: FormBuilder,
    private padreService: PadreService,
    private authService: AuthService, // Para obtener el ID del padre
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEditMenorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number | null }
  ) {
    this.menorId = data.id;
    this.padreId = this.authService.getUserId()!;
  }

  ngOnInit(): void {
    this.CargarFormulario();
    if (this.menorId) {
      this.title = 'Editar Menor';
      this.CargarDatosParaEditar();
    }
  }

  CargarFormulario(): void {
    this.addEditForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      gradoEscolar: [''],
      motivoConsulta: ['']
    });
  }

  CargarDatosParaEditar(): void {
    // getMisMenores() filtra por padre, así que es seguro
    this.padreService.getMisMenores().subscribe({
      next: (menores) => {
        const menor = menores.find(m => m.menorId === this.menorId);
        if (menor) {
          // Convertir string de fecha a Date para el datepicker
          // TRUCO: Inicializar a las 12:00 para evitar saltos de día
          const fechaNacimiento = new Date(menor.fechaNacimiento + 'T12:00:00');

          // Guardar el string original para usarlo al grabar si no se modifica
          (this as any)._fechaStringBackend = menor.fechaNacimiento;

          this.addEditForm.patchValue({
            nombre: menor.nombre,
            apellido: menor.apellido,
            fechaNacimiento: fechaNacimiento,
            gradoEscolar: menor.gradoEscolar,
            motivoConsulta: menor.motivoConsulta
          });
        }
      },
      error: (err) => this.snackBar.open('Error al cargar datos del menor', 'OK')
    });
  }

  // MÉTODO: Manejar cambio de fecha desde el datepicker
  onFechaNacimientoChange(event: any): void {
    const f = event.value;
    if (f) {
      // 1. Extraer componentes UTC (Día real seleccionado)
      const year = f.getUTCFullYear();
      const monthVal = f.getUTCMonth() + 1;
      const dayVal = f.getUTCDate();

      // 2. Construir string YYYY-MM-DD para backend
      const fechaString = `${year}-${String(monthVal).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
      (this as any)._fechaStringBackend = fechaString;

      // 3. Ajuste Visual: Forzar mediodía local para que el círculo no salte
      const fechaVisual = new Date(year, monthVal - 1, dayVal, 12, 0, 0);
      this.addEditForm.get('fechaNacimiento')?.setValue(fechaVisual, { emitEvent: false });

      console.log('👶 Fecha Nacimiento procesada:', fechaString);
    }
  }

  // MÉTODO HELPER: Convertir Date a string YYYY-MM-DD
  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

    // LÓGICA DE FECHA ROBUSTA
    let fechaString: string;

    // 1. Prioridad: Usar el string calculado en onFechaNacimientoChange o CargarDatos
    if ((this as any)._fechaStringBackend) {
      fechaString = (this as any)._fechaStringBackend;
    } else {
      // 2. Fallback: Si no hay string guardado, intentar procesar el valor del form
      const rawDate = this.addEditForm.value.fechaNacimiento;
      if (rawDate) {
        // Si es un objeto Date, usar lógica segura
        if (rawDate instanceof Date) {
          const year = rawDate.getFullYear();
          const month = String(rawDate.getMonth() + 1).padStart(2, '0');
          const day = String(rawDate.getDate()).padStart(2, '0');
          fechaString = `${year}-${month}-${day}`;
        } else {
          // Si ya es string, asumimos que está bien o intentamos limpiarlo
          fechaString = String(rawDate).split('T')[0];
        }
      } else {
        this.snackBar.open('La fecha de nacimiento es requerida', 'OK', { duration: 3000 });
        return;
      }
    }

    // Validar fecha futura (comparación de strings)
    const now = new Date();
    const hoyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (fechaString > hoyStr) {
      this.snackBar.open('La fecha de nacimiento no puede ser futura', 'OK', { duration: 3000 });
      return;
    }

    const menorData: PADREMenorDTO = {
      menorId: this.menorId || undefined,
      padreId: this.padreId, // El ID del padre logueado
      nombre: this.addEditForm.value.nombre.trim(),
      apellido: this.addEditForm.value.apellido.trim(),
      fechaNacimiento: fechaString, // Enviamos el string en formato YYYY-MM-DD
      gradoEscolar: this.addEditForm.value.gradoEscolar,
      motivoConsulta: this.addEditForm.value.motivoConsulta
    };

    if (this.menorId) {
      // Modo EDITAR
      this.padreService.editMenor(this.menorId, menorData).subscribe({
        next: (data) => {
          this.snackBar.open('Menor actualizado con éxito', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          let errorMessage = 'Error al actualizar el menor';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 403) {
            errorMessage = 'No tiene permisos para editar este menor';
          } else if (err.status === 404) {
            errorMessage = 'Menor no encontrado';
          } else if (err.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor';
          }
          this.snackBar.open(`ERROR: ${errorMessage}`, 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Error al actualizar menor:', err);
        }
      });
    } else {
      // Modo CREAR
      this.padreService.newMenor(menorData).subscribe({
        next: (data) => {
          this.snackBar.open('Menor registrado con éxito', 'OK', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          let errorMessage = 'Error al crear el menor';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 400) {
            errorMessage = 'Datos inválidos. Verifique la información ingresada.';
          } else if (err.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor';
          }
          this.snackBar.open(`ERROR: ${errorMessage}`, 'OK', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          console.error('Error al crear menor:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
