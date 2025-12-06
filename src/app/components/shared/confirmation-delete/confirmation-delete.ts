import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
// Importa los módulos de Diálogo
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// 1. Define la interfaz que especifica qué datos recibirá tu diálogo
export interface ConfirmDialogData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-delete',
  standalone: true, // Lo cambio a standalone (es la práctica moderna)
  imports: [
    CommonModule,
    MatDialogModule, // Necesario para <mat-dialog-content> y acciones
    MatButtonModule  // Para los botones de cerrar
  ],
  templateUrl: './confirmation-delete.html',
  styleUrls: ['./confirmation-delete.css']
})
export class ConfirmationDeleteComponent {
  data: ConfirmDialogData;

  // 2. Inyecta la referencia del diálogo y los DATOS
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) data: any // <-- Cambiado a 'any' para mayor robustez
  ) {
    // Inicializar datos de forma segura (nunca será null)
    this.data = data || {};
  }

  // 3. Métodos para cerrar el diálogo
  onConfirm(): void {
    this.dialogRef.close(true); // Cierra y devuelve 'true' (confirmó)
  }

  onCancel(): void {
    this.dialogRef.close(false); // Cierra y devuelve 'false' (canceló)
  }
}