import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PsicologoService } from '../../../services/psicologo.service';
import { PSICOLOGOEvaluacionDTO } from '../../../models/psicologo-evaluacion.dto';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DetalleEvaluacionDialogComponent } from '../../shared/detalle-evaluacion-dialog/detalle-evaluacion-dialog';

@Component({
    selector: 'app-psicologo-evaluacion-list',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatButtonModule,
        MatTooltipModule,
        MatDialogModule
    ],
    templateUrl: './psicologo-evaluacion-list.html',
    styleUrls: ['./psicologo-evaluacion-list.css']
})
export class PsicologoEvaluacionListComponent implements OnInit {

    evaluaciones: PSICOLOGOEvaluacionDTO[] = [];
    displayedColumns: string[] = ['fecha', 'padre', 'puntaje', 'comentario', 'acciones'];

    constructor(
        private psicologoService: PsicologoService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.cargarEvaluaciones();
    }

    cargarEvaluaciones(): void {
        this.psicologoService.getMisEvaluaciones().subscribe({
            next: (data) => {
                this.evaluaciones = data;
            },
            error: (err) => {
                console.error('Error al cargar evaluaciones:', err);
            }
        });
    }

    getStarsArray(puntaje: number): number[] {
        return Array(Math.round(puntaje)).fill(0).map((_, i) => i);
    }

    verDetalle(evaluacion: PSICOLOGOEvaluacionDTO): void {
        this.dialog.open(DetalleEvaluacionDialogComponent, {
            width: '500px',
            data: {
                padre: evaluacion.nombrePadre,
                puntaje: evaluacion.puntaje,
                comentario: evaluacion.comentario,
                fecha: evaluacion.fecha
            }
        });
    }
}
