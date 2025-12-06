import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table'; // <-- Importar MatTableModule
import { MatSnackBar } from '@angular/material/snack-bar';
import { PadreService } from '../../../services/padre.service';
import { PADREMenorDTO } from '../../../models/padre-menor.dto';
import { PADREInformeDTO } from '../../../models/padre-informe.dto';
import Chart from 'chart.js/auto'; // Importamos Chart.js

// Módulos necesarios para el HTML
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para el <select>
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-padre-progreso',
  standalone: true, // <-- 1. CAMBIADO A TRUE
  imports: [ // <-- 2. AÑADIDO ARRAY DE IMPORTS
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule, // <-- Para [dataSource]
    MatIconModule,  // <-- Para <mat-icon>
    MatButtonModule, // <-- Para el botón de ícono
    MatTooltipModule // <-- Para los tooltips
  ],
  templateUrl: './padre-progreso.html',
  styleUrls: ['./padre-progreso.css']
})
export class PadreProgresoComponent implements OnInit, AfterViewInit {

  // Referencias a los <canvas> del HTML
  @ViewChild('chartEficacia') chartEficaciaRef!: ElementRef;

  misMenores: PADREMenorDTO[] = [];
  menorSeleccionadoId: number | null = null;

  displayedColumns: string[] = ['fecha', 'hijo', 'psicologo', 'resumen', 'acciones'];
  dsInformes = new MatTableDataSource<PADREInformeDTO>();

  private chartEficacia: Chart | undefined;

  constructor(
    private padreService: PadreService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarMenores();
  }

  ngAfterViewInit(): void {
    // El gráfico se inicializará cuando lleguen los datos
  }

  CargarMenores(): void {
    this.padreService.getMisMenores().subscribe({
      next: (data) => {
        this.misMenores = data;
        // Si hay menores, seleccionamos el primero por defecto
        if (data.length > 0) {
          this.menorSeleccionadoId = data[0].menorId!;
          this.CargarInformes();
        }
      },
      error: (err) => this.snackBar.open('Error al cargar la lista de menores', 'OK')
    });
  }

  onMenorChange(): void {
    this.CargarInformes();
  }

  CargarInformes(): void {
    if (!this.menorSeleccionadoId) {
      this.dsInformes = new MatTableDataSource<PADREInformeDTO>([]);
      this.actualizarGrafico([]);
      return;
    }

    this.padreService.getInformesDeMenor(this.menorSeleccionadoId).subscribe({
      next: (data) => {
        console.log('✅ Informes cargados:', data);
        this.dsInformes = new MatTableDataSource(data);
        this.actualizarGrafico(data);
      },
      error: (err) => {
        console.error('❌ Error al cargar informes:', err);
        this.dsInformes = new MatTableDataSource<PADREInformeDTO>([]);
        this.actualizarGrafico([]);
        this.snackBar.open(`Error al cargar informes: ${err.error?.message || 'Error desconocido'}`, 'OK', { duration: 5000 });
      }
    });
  }

  // Método auxiliar para obtener la fecha formateada
  getFechaFormateada(informe: PADREInformeDTO): string {
    if (informe.fechaCreacion) {
      return informe.fechaCreacion;
    }
    // Fallback: usar mes/año si no hay fechaCreacion
    return `${informe.mes}/${informe.anio}`;
  }

  // NUEVO MÉTODO: Descargar informe PDF
  descargarInforme(informe: PADREInformeDTO): void {
    if (!informe.informeId) return;

    this.padreService.descargarInformePdf(informe.informeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Informe_${informe.titulo || 'NeuroKid'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar PDF:', err);
        this.snackBar.open('Error al descargar el informe. Intente nuevamente.', 'OK', { duration: 4000 });
      }
    });
  }

  // Lógica de gráfico REAL
  actualizarGrafico(informes: PADREInformeDTO[]): void {
    if (!this.chartEficaciaRef) return;

    // Destruir gráfico anterior si existe
    if (this.chartEficacia) {
      this.chartEficacia.destroy();
    }

    // Si no hay datos, no dibujamos nada (o podríamos mostrar un gráfico vacío)
    if (!informes || informes.length === 0) {
      return;
    }

    // 1. Procesar datos: Ordenar por fecha ascendente
    const informesOrdenados = [...informes].sort((a, b) => {
      const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
      const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
      return fechaA - fechaB;
    });

    // 2. Extraer etiquetas (Fechas) y datos (Eficacia)
    const labels = informesOrdenados.map(i => {
      if (i.fechaCreacion) {
        const date = new Date(i.fechaCreacion);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      }
      return `${i.mes}/${i.anio}`;
    });

    const dataEficacia = informesOrdenados.map(i => i.calificacionEficacia || 0);

    // 3. Crear el gráfico
    this.chartEficacia = new Chart(this.chartEficaciaRef.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Eficacia del Tratamiento (1-5)',
          data: dataEficacia,
          borderColor: '#4CAF50', // Verde
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: 5,
            ticks: {
              stepSize: 1
            },
            title: {
              display: true,
              text: 'Nivel de Eficacia'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Fecha del Informe'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => `Eficacia: ${context.raw}/5`
            }
          }
        }
      }
    });
  }
}
