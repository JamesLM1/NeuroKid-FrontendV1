import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface DetalleEvaluacionData {
    psicologo?: string; // Opcional, dependiendo de quien lo vea
    padre: string;
    puntaje: number;
    comentario: string;
    fecha: string;
}

@Component({
    selector: 'app-detalle-evaluacion-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule
    ],
    templateUrl: './detalle-evaluacion-dialog.html',
    styleUrls: ['./detalle-evaluacion-dialog.css']
})
export class DetalleEvaluacionDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<DetalleEvaluacionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DetalleEvaluacionData
    ) { }

    cerrar(): void {
        this.dialogRef.close();
    }

    getStarsArray(puntaje: number): number[] {
        return Array(Math.round(puntaje)).fill(0).map((_, i) => i);
    }
}
