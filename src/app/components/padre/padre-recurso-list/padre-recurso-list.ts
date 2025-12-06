import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PadreService } from '../../../services/padre.service';
import { ADMINRecursoEducativoDTO } from '../../../models/admin-recurso-educativo.dto';
import { forkJoin } from 'rxjs';

// MÓDULOS NECESARIOS PARA EL HTML (Plantilla)
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; // Para el (input)
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';


// Creamos una interfaz extendida para uso local (frontend)
interface RecursoConFavorito extends ADMINRecursoEducativoDTO {
  isFavorito: boolean;
  imagenUrl?: string;  // URL de la imagen del recurso (opcional)
  tipo?: string;        // Tipo de recurso (opcional)
}

@Component({
  selector: 'app-padre-recurso-list',
  standalone: true, // <-- 1. CAMBIADO A TRUE
  imports: [ // <-- 2. AÑADIDO ARRAY DE IMPORTS
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './padre-recurso-list.html',
  styleUrls: ['./padre-recurso-list.css']
})
export class PadreRecursoListComponent implements OnInit {

  recursos: RecursoConFavorito[] = [];
  recursosFiltrados: RecursoConFavorito[] = [];

  constructor(
    private padreService: PadreService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarRecursos();
  }

  CargarRecursos(): void {
    // Cargamos todos los recursos Y los favoritos del padre
    forkJoin({
      recursos: this.padreService.buscarRecursos(''), // Trae todos
      favoritos: this.padreService.getMisFavoritos()
    }).subscribe({
      next: (data) => {
        const favoritosIds = new Set(data.favoritos.map(f => f.recursoId));
        
        // Combinamos la data
        this.recursos = data.recursos.map(recurso => ({
          ...recurso,
          isFavorito: favoritosIds.has(recurso.recursoId)
        }));
        
        this.recursosFiltrados = this.recursos;
      },
      error: (err) => this.snackBar.open('Error al cargar recursos', 'OK')
    });
  }

  applyFilter(event: Event): void {
    const filterValue = this.normalizeText((event.target as HTMLInputElement).value.trim());
    this.recursosFiltrados = this.recursos.filter(recurso => 
      this.normalizeText(recurso.titulo).includes(filterValue) ||
      this.normalizeText(recurso.descripcion || '').includes(filterValue)
    );
  }

  // Normaliza texto removiendo tildes para búsquedas más flexibles
  private normalizeText(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  toggleFavorito(recurso: RecursoConFavorito): void {
    if (recurso.isFavorito) {
      // Desmarcar
      this.padreService.desmarcarFavorito(recurso.recursoId).subscribe({
        next: () => {
          recurso.isFavorito = false;
          this.snackBar.open('Quitado de favoritos', 'OK', { duration: 2000 });
        },
        // (Corregí la interpolación de tu string de error)
        error: (err) => this.snackBar.open(`Error: ${err.error?.message || 'No se pudo desmarcar'}`, 'OK')
      });
    } else {
      // Marcar
      this.padreService.marcarFavorito(recurso.recursoId).subscribe({
        next: () => {
          recurso.isFavorito = true;
          this.snackBar.open('Añadido a favoritos', 'OK', { duration: 2000 });
        },
        // (Corregí la interpolación de tu string de error)
        error: (err) => this.snackBar.open(`Error: ${err.error?.message || 'No se pudo marcar'}`, 'OK')
      });
    }
  }
}
