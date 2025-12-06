import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {

  // Sobrescribimos la creación de la fecha para evitar el desfase de medianoche
  override createDate(year: number, month: number, date: number): Date {
    const localDate = super.createDate(year, month, date);
    // Forzamos la hora a las 12:00 (mediodía) para tener un margen de seguridad contra zonas horarias
    localDate.setHours(12);
    return localDate;
  }

}

