import { Component, OnInit } from '@angular/core';
import { PadreService } from '../../../services/padre.service';
import { PADRECitaResponseDTO } from '../../../models/padre-cita-response.dto';

@Component({
  selector: 'app-padre-dashboard',
  standalone: false,
  templateUrl: './padre-dashboard.html',
  styleUrls: ['./padre-dashboard.css']
})
export class PadreDashboardComponent implements OnInit {

  activeTab: string = 'inicio';
  totalMenores: number = 0;
  proximaCita: PADRECitaResponseDTO | null = null;

  constructor(private padreService: PadreService) { }

  ngOnInit(): void {
    this.cargarWidgets();
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  cargarWidgets(): void {
    console.log('📊 Cargando widgets del dashboard...');

    // Cargar total de menores
    this.padreService.getMisMenores().subscribe({
      next: (menores) => {
        this.totalMenores = menores.length;
        console.log('✅ Total menores:', this.totalMenores);
      },
      error: (err) => console.error('❌ Error al cargar menores:', err)
    });

    // Cargar próxima cita
    this.padreService.getMisProximasCitas().subscribe({
      next: (citas) => {
        if (citas && citas.length > 0) {
          // Ordenar por fecha y tomar la más próxima
          this.proximaCita = citas.sort((a, b) => 
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
          )[0];
          console.log('✅ Próxima cita:', this.proximaCita);
        } else {
          this.proximaCita = null;
          console.log('ℹ️ No hay próximas citas');
        }
      },
      error: (err) => console.error('❌ Error al cargar próximas citas:', err)
    });
  }
}