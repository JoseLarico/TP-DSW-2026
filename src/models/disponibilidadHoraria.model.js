import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);
export class DisponibilidadHoraria {
  constructor(diaSemana, horaDesde, horaHasta) {
    this.diaSemana = diaSemana;
    this.horaDesde = dayjs(horaDesde, "HH:mm");
    this.horaHasta = dayjs(horaHasta, "HH:mm");
    this.validar();
  }

  validar() {
    if (!this.horaDesde.isBefore(this.horaHasta)) {
      throw new Error("Hora inicio debe ser menor a hora fin");
    }
  }

  seSolapa(nuevoHorario) {
    return (
      this.diaSemana === nuevoHorario.diaSemana &&
      this.horaDesde.isBefore(nuevoHorario.horaHasta) &&
      this.horaHasta.isAfter(nuevoHorario.horaDesde)
    );
  }
}
