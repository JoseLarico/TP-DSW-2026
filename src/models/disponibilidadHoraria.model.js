import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { ValidationError } from "../error/appError.js";
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
      throw new ValidationError("Hora inicio debe ser menor a hora fin");
    }
  }


}
