import { PSICOLOGOInformeDTO } from "./psicologo-informe.dto";

export interface PSICOLOGOProgresoMenorDTO {
    menorId: number;
    nombreMenor: string;
    diagnosticoActual: string;
    citasCompletadas: number;
    promedioEficaciaInformes: number;
    ultimosInformes: PSICOLOGOInformeDTO[];
}