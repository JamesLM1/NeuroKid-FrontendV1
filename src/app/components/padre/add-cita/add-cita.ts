import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PadreService } from '../../../services/padre.service';
import { AuthService } from '../../../services/auth.service';
import { PADRECitaRequestDTO } from '../../../models/padre-cita-request.dto';
import { PADRESolicitudCitaDTO } from '../../../models/padre-solicitud-cita.dto';
import { PADREMenorDTO } from '../../../models/padre-menor.dto';
import { PADREPsicologoDTO } from '../../../models/padre-psicologo.dto';
import { DisponibilidadSlotDTO } from '../../../models/disponibilidad-slot.dto';
import { ADMINAsignacionDTO } from '../../../models/admin-asignacion.dto';

@Component({
  selector: 'app-add-cita',
  standalone: false,
  templateUrl: './add-cita.html',
  styleUrls: ['./add-cita.css']
})
export class AddCitaComponent implements OnInit {

  addCitaForm!: FormGroup;
  title: string = 'Solicitar Nueva Cita';

  // NUEVO MODELO AUTOSERVICIO
  misMenores: PADREMenorDTO[] = [];
  psicologosDisponibles: PADREPsicologoDTO[] = [];

  // NUEVO: SELECCIÓN DINÁMICA DE HORARIOS
  horariosDisponibles: string[] = [];
  cargandoHorarios = false;
  disponibilidadInfo: DisponibilidadSlotDTO | null = null;
  sinDisponibilidad = false; // Bandera para indicar que no hay horarios disponibles

  // MODELO ANTERIOR (mantenido para compatibilidad)
  misAsignaciones: ADMINAsignacionDTO[] = [];
  minDate: Date = new Date(); // Fecha mínima: hoy (no se pueden agendar citas pasadas)

  constructor(
    private fb: FormBuilder,
    private padreService: PadreService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddCitaComponent>
  ) { }

  ngOnInit(): void {
    this.CargarFormulario();
    this.CargarMenores();
    this.CargarPsicologos();
    this.ConfigurarListeners();
  }

  CargarFormulario(): void {
    this.addCitaForm = this.fb.group({
      // NUEVO MODELO AUTOSERVICIO
      menorId: [null, Validators.required],
      psicologoId: [null, Validators.required],

      // CAMPOS COMUNES
      fecha: ['', Validators.required],
      horarioSeleccionado: ['', Validators.required],
      motivo: ['', Validators.required]

    });
  }

  CargarMenores(): void {
    this.padreService.getMenoresDisponibles().subscribe({
      next: (data) => {
        this.misMenores = data;
        console.log('👶 Menores cargados:', this.misMenores);
      },
      error: (err) => {
        console.error('❌ Error al cargar menores:', err);
        this.snackBar.open('Error al cargar la lista de hijos. Verifica que tengas hijos registrados.', 'OK', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  CargarPsicologos(): void {
    this.padreService.getPsicologosDisponibles().subscribe({
      next: (data) => {
        this.psicologosDisponibles = data;
        console.log('👨‍⚕️ Psicólogos disponibles cargados:', this.psicologosDisponibles);
      },
      error: (err) => {
        console.error('❌ Error al cargar psicólogos:', err);
        this.snackBar.open('Error al cargar la lista de psicólogos disponibles.', 'OK', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ConfigurarListeners(): void {
    this.addCitaForm.get('psicologoId')?.valueChanges.subscribe(() => {
      this.CargarHorariosDisponibles();
    });

    this.addCitaForm.get('fecha')?.valueChanges.subscribe((fecha) => {
      if (fecha && typeof fecha === 'string') {
        this.CargarHorariosDisponibles();
      }
    });
  }

  onFechaChange(event: any): void {
    const f = event.value;
    if (f) {
      const year = f.getUTCFullYear();
      const monthVal = f.getUTCMonth() + 1;
      const dayVal = f.getUTCDate();

      const fechaString = `${year}-${String(monthVal).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
      (this as any)._fechaStringBackend = fechaString;

      const fechaVisual = new Date(year, monthVal - 1, dayVal, 12, 0, 0);
      this.addCitaForm.get('fecha')?.setValue(fechaVisual, { emitEvent: false });

      console.log('📅 Fecha procesada:', fechaString);
      this.CargarHorariosDisponibles();
    }
  }

  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  CargarHorariosDisponibles(): void {
    const psicologoId = this.addCitaForm.get('psicologoId')?.value;

    let fechaString: string;
    if ((this as any)._fechaStringBackend) {
      fechaString = (this as any)._fechaStringBackend;
    } else {
      return;
    }
    if (!psicologoId || !fechaString) return;

    this.cargandoHorarios = true;
    this.sinDisponibilidad = false;
    this.horariosDisponibles = [];
    this.addCitaForm.get('horarioSeleccionado')?.setValue('');
    this.addCitaForm.get('horarioSeleccionado')?.enable();

    this.padreService.getDisponibilidad(psicologoId, fechaString).subscribe({
      next: (disponibilidad) => {
        this.cargandoHorarios = false;
        this.disponibilidadInfo = disponibilidad;
        this.horariosDisponibles = disponibilidad.horariosDisponibles || [];
        this.sinDisponibilidad = this.horariosDisponibles.length === 0;

        if (this.sinDisponibilidad) {
          this.addCitaForm.get('horarioSeleccionado')?.disable();
          this.snackBar.open('No hay horarios disponibles para esta fecha.', 'OK', { duration: 4000, panelClass: ['warning-snackbar'] });
        }
      },
      error: (err) => {
        this.cargandoHorarios = false;
        this.snackBar.open('Error al consultar horarios.', 'OK', { duration: 4000 });
      }
    });
  }

  Grabar(): void {
    if (this.addCitaForm.invalid) return;
    const fechaString = (this as any)._fechaStringBackend;
    if (!fechaString) return;

    const horarioSeleccionado = this.addCitaForm.value.horarioSeleccionado;
    const [horas, minutos] = horarioSeleccionado.split(':').map(Number);
    const horaFin = `${String(horas + 1).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

    const solicitudData: PADRESolicitudCitaDTO = {
      menorId: this.addCitaForm.value.menorId,
      psicologoId: this.addCitaForm.value.psicologoId,
      fecha: fechaString,
      horaInicio: horarioSeleccionado,
      horaFin: horaFin,
      motivo: this.addCitaForm.value.motivo.trim(),
      estado: 'Pendiente'
    };

    this.padreService.solicitarCitaDirecta(solicitudData).subscribe({
      next: (resp) => {
        this.snackBar.open('¡Cita solicitada con éxito!', 'OK', { duration: 3000, panelClass: ['success-snackbar'] });
        this.dialogRef.close(true);
      },
      error: (err) => this.snackBar.open('Error al solicitar cita', 'OK', { duration: 5000 })
    });
  }

  getHoraFin(horaInicio: string): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const horaFin = `${String(horas + 1).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    return horaFin;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
