import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINRecursoEducativoDTO } from '../../../models/admin-recurso-educativo.dto';

@Component({
  selector: 'app-add-edit-recurso',
  standalone: false,
  templateUrl: './add-edit-recurso.html',
  styleUrls: ['./add-edit-recurso.css']
})
export class AddEditRecursoComponent implements OnInit {

  addEditForm!: FormGroup;
  recursoId: number | null = null;
  title: string = 'Nuevo Recurso Educativo';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddEditRecursoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number | null }
  ) {
    this.recursoId = data.id;
  }

  ngOnInit(): void {
    this.CargarFormulario();
    if (this.recursoId) {
      this.title = 'Editar Recurso Educativo';
      this.CargarDatosParaEditar();
    }
  }

  CargarFormulario(): void {
    this.addEditForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      link: ['', [
        Validators.required,
        Validators.pattern(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/)
      ]],
      texto: [''] // El texto no es obligatorio
    });
  }

  CargarDatosParaEditar(): void {
    this.adminService.getRecursoById(this.recursoId!).subscribe({
      next: (data: ADMINRecursoEducativoDTO) => {
        this.addEditForm.patchValue({
          titulo: data.titulo,
          descripcion: data.descripcion,
          link: data.link,
          texto: data.texto
        });
      },
      error: (err) => this.snackBar.open('Error al cargar datos del recurso', 'OK')
    });
  }

  Grabar(): void {
    if (this.addEditForm.invalid) return;

    const recursoData: ADMINRecursoEducativoDTO = {
      recursoId: this.recursoId || 0,
      titulo: this.addEditForm.value.titulo,
      descripcion: this.addEditForm.value.descripcion,
      link: this.addEditForm.value.link,
      texto: this.addEditForm.value.texto,
      fechaCreacion: '' // El backend la maneja
    };

    if (this.recursoId) {
      // Modo EDITAR
      this.adminService.editRecurso(this.recursoId, recursoData).subscribe({
        next: (data) => {
          this.snackBar.open('Recurso actualizado con éxito', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => this.snackBar.open(`ERROR: ${err.error?.message || 'Error al actualizar'}`, 'OK')
      });
    } else {
      // Modo CREAR
      this.adminService.newRecurso(recursoData).subscribe({
        next: (data) => {
          this.snackBar.open('Recurso creado con éxito', 'OK', { duration: 3000 });
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