import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINAsignacionDTO } from '../../../models/admin-asignacion.dto';
import { ADMINPadreDTO } from '../../../models/admin-padre.dto';
import { ADMINPsicologoDTO } from '../../../models/admin-psicologo.dto';
import { PADREMenorDTO } from '../../../models/padre-menor.dto';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-edit-asignacion',
  standalone: false,
  templateUrl: './add-edit-asignacion.html',
  styleUrls: ['./add-edit-asignacion.css']
})
export class AddEditAsignacionComponent implements OnInit {

  addEditForm!: FormGroup;
  asignacionId: number | null = null;
  title: string = 'Nueva Asignación';

  // Listas para los dropdowns (mat-select)
  padres: ADMINPadreDTO[] = [];
  psicologos: ADMINPsicologoDTO[] = [];
  menoresDisponibles: PADREMenorDTO[] = [];

  estados: string[] = ['Activa', 'Pausada']; // "Finalizada" se maneja con el botón dedicado en la tabla

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEditAsignacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number | null }
  ) {
    this.asignacionId = data.id;
  }

  ngOnInit(): void {
    this.CargarFormulario();
    this.CargarDropdowns(); // Carga Padres y Psicólogos

    if (this.asignacionId) {
      this.title = 'Editar Asignación';
      this.CargarDatosParaEditar();
    }
  }

  CargarFormulario(): void {
    this.addEditForm = this.fb.group({
      padreId: [null, Validators.required],
      menorId: [{ value: null, disabled: true }, Validators.required], // Deshabilitado hasta seleccionar padre
      psicologoId: [null, Validators.required],
      estado: ['Activa', Validators.required]
    });

    // Suscribirse a cambios en padreId para cargar menores dinámicamente
    this.addEditForm.get('padreId')?.valueChanges.subscribe(padreId => {
      if (padreId) {
        this.cargarMenoresPorPadre(padreId);
      } else {
        this.menoresDisponibles = [];
        this.addEditForm.get('menorId')?.setValue(null);
        this.addEditForm.get('menorId')?.disable();
      }
    });
  }

  CargarDropdowns(): void {
    // Usamos forkJoin para cargar ambos al mismo tiempo
    forkJoin({
      padres: this.adminService.getAllPadres(),
      psicologos: this.adminService.getAllPsicologos()
    }).subscribe({
      next: (data) => {
        this.padres = data.padres;
        this.psicologos = data.psicologos;
      },
      error: (err) => this.snackBar.open('Error al cargar listas de padres/psicólogos', 'OK')
    });
  }

  cargarMenoresPorPadre(padreId: number): void {
    this.adminService.getMenoresByPadreId(padreId).subscribe({
      next: (menores) => {
        this.menoresDisponibles = menores;
        this.addEditForm.get('menorId')?.enable();
        
        // Si estamos editando y ya hay un menor seleccionado, mantenerlo
        if (this.asignacionId && this.addEditForm.get('menorId')?.value) {
          const menorActual = this.addEditForm.get('menorId')?.value;
          const menorExiste = menores.find(m => m.menorId === menorActual);
          if (!menorExiste) {
            this.addEditForm.get('menorId')?.setValue(null);
          }
        }
      },
      error: (err) => {
        this.snackBar.open('Error al cargar menores del padre seleccionado', 'OK', { duration: 3000 });
        this.menoresDisponibles = [];
        this.addEditForm.get('menorId')?.disable();
      }
    });
  }

  CargarDatosParaEditar(): void {
    this.adminService.getAllAsignaciones().subscribe(asignaciones => {
      const asignacion = asignaciones.find(a => a.asignacionId === this.asignacionId);
      if (asignacion) {
        // Prevenir editar asignaciones finalizadas
        if (asignacion.estado === 'Finalizada') {
          this.snackBar.open('No se puede editar una asignación finalizada. Use el botón de finalizar en la tabla.', 'OK', { duration: 5000 });
          this.dialogRef.close(false);
          return;
        }

        // Primero cargar los menores del padre, luego establecer los valores
        this.adminService.getMenoresByPadreId(asignacion.padreId).subscribe({
          next: (menores) => {
            this.menoresDisponibles = menores;
            this.addEditForm.get('menorId')?.enable();
            
            // Ahora establecer todos los valores
            this.addEditForm.patchValue({
              padreId: asignacion.padreId,
              menorId: asignacion.menorId,
              psicologoId: asignacion.psicologoId,
              estado: asignacion.estado === 'Finalizada' ? 'Activa' : asignacion.estado // Fallback por si acaso
            });
          },
          error: (err) => {
            this.snackBar.open('Error al cargar menores para edición', 'OK');
          }
        });
      }
    });
  }

  Grabar(): void {
    if (this.addEditForm.invalid) return;

    const asignacionData: ADMINAsignacionDTO = {
      asignacionId: this.asignacionId || 0,
      padreId: this.addEditForm.value.padreId,
      menorId: this.addEditForm.value.menorId,
      psicologoId: this.addEditForm.value.psicologoId,
      estado: this.addEditForm.value.estado,
      fechaAsignacion: '' // El backend la maneja
    };

    if (this.asignacionId) {
      // Modo EDITAR
      this.adminService.editAsignacion(this.asignacionId, asignacionData).subscribe({
        next: (data) => {
          this.snackBar.open('Asignación actualizada con éxito', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => this.snackBar.open(`ERROR: ${err.error?.message || 'Error al actualizar'}`, 'OK')
      });
    } else {
      // Modo CREAR
      this.adminService.newAsignacion(asignacionData).subscribe({
        next: (data) => {
          this.snackBar.open('Asignación creada con éxito', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => this.snackBar.open(`ERROR: ${err.error?.message || 'Error al crear'}`, 'OK')
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}