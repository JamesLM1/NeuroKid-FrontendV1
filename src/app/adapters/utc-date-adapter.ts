import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/**
 * Custom Date Adapter que corrige el problema de desfase de zona horaria
 * en los mat-datepicker. Garantiza que la fecha seleccionada sea la que se guarda,
 * sin restar días debido a la conversión UTC.
 */
@Injectable()
export class UtcDateAdapter extends NativeDateAdapter {

  /**
   * Sobrescribe createDate para evitar el desfase de zona horaria.
   * Crea una fecha usando UTC al mediodía para que el día seleccionado sea el día guardado.
   * Al usar mediodía (12:00), evitamos que cambios de zona horaria cambien el día.
   */
  override createDate(year: number, month: number, date: number): Date {
    // Crear la fecha usando UTC al mediodía (12:00)
    // Esto garantiza que el día seleccionado (ej: 26) sea el día guardado (26)
    // sin importar la zona horaria del usuario
    return new Date(Date.UTC(year, month, date, 12, 0, 0, 0));
  }

  /**
   * Formatea la fecha para mostrar en el input del datepicker.
   * Usa métodos UTC para garantizar que el día mostrado sea el correcto.
   */
  override format(date: Date, displayFormat: any): string {
    if (!date) {
      return '';
    }

    // Usar métodos UTC para obtener día, mes y año
    // Esto garantiza que el día mostrado sea el día correcto sin importar la zona horaria
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    // Formato DD/MM/YYYY (formato peruano)
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  /**
   * Obtiene el día del mes usando UTC para evitar desfase
   */
  override getDate(date: Date): number {
    return date.getUTCDate();
  }

  /**
   * Obtiene el mes usando UTC para evitar desfase
   */
  override getMonth(date: Date): number {
    return date.getUTCMonth();
  }

  /**
   * Obtiene el año usando UTC para evitar desfase
   */
  override getYear(date: Date): number {
    return date.getUTCFullYear();
  }

  /**
   * Parsea una string de fecha al formato Date
   */
  override parse(value: any): Date | null {
    if (!value) {
      return null;
    }

    // Si ya es un Date, retornarlo
    if (value instanceof Date) {
      return value;
    }

    // Intentar parsear diferentes formatos
    // Formato DD/MM/YYYY
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = value.match(dateRegex);
    
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // Los meses en JS son 0-indexed
      const year = parseInt(match[3], 10);
      
      // Crear fecha usando UTC para evitar desfase
      return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
    }

    // Formato YYYY-MM-DD (ISO)
    const isoRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const isoMatch = value.match(isoRegex);
    
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      
      // Crear fecha usando UTC para evitar desfase
      return new Date(Date.UTC(year, month, day, 12, 0, 0, 0));
    }

    // Fallback: intentar parsear como fecha estándar
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return null;
  }
}

