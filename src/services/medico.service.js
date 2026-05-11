import { MedicoRepository } from '../repositories/medico.repository.js';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);
import { DisponibilidadHoraria } from '../models/disponibilidadHoraria.model.js';

export class MedicoService {
constructor({
  medicoRepository = MedicoRepository.instance()
} = {}) {
  this.MedicoRepository = medicoRepository;
  console.log("LLegue a service de medicos");
}


obtenerDisponibilidades(medicoId) {
    const medico = this.MedicoRepository.findById(medicoId);
    if (!medico) throw new Error('Médico no encontrado');
    return medico.disponibilidades;
}

obtenerDisponibilidadPorId(medicoId, idDisponibilidad) {
    const medico = this.MedicoRepository.findById(medicoId);
    if (!medico) throw new Error('Médico no encontrado');

    const disponibilidad = medico.disponibilidades.find(d => d.id === idDisponibilidad);
    if (!disponibilidad) throw new Error('Disponibilidad no encontrada');

    return disponibilidad;
}

crearDisponibilidad(medicoId, datos) {
    const medico = this.MedicoRepository.findById(medicoId);
    if (!medico) throw new Error('Médico no encontrado');

    // Usamos el modelo para validar formato y lógica horaria
    const nueva = new DisponibilidadHoraria(
      datos.diaSemana, 
      datos.horaInicio, 
      datos.horaFin
    );

    //  Validamos que no haya conflicto con las existentes
    const tieneConflicto = medico.disponibilidades.some(d => {
        const existente = new DisponibilidadHoraria(d.diaSemana, d.horaInicio, d.horaFin);
        // seSolapa devuelve un boolean indicando si hay solapamiento entre el nuevo horario y el existente
        return nueva.seSolapa(existente);
    });

    if (tieneConflicto) throw new Error("Horario ocupado para el médico en ese día y horario");

    // Le generamos el id a la disponibilidad, el ultimo de la lista + 1
    const proximoId = medico.disponibilidades.length > 0 
        ? Math.max(...medico.disponibilidades.map(d => d.id)) + 1 
        : 1;

    const disponibilidadAGuardar = {
        id: proximoId,
        diaSemana: nueva.diaSemana,
        horaInicio: nueva.horaDesde.format("HH:mm"),
        horaFin: nueva.horaHasta.format("HH:mm")
    };

    medico.disponibilidades.push(disponibilidadAGuardar);
    this.MedicoRepository.save(medico); 

    return medico;
}




editarDisponibilidad(medicoId, idDisponibilidad, nuevaDisponibilidad) {

  const nueva = new DisponibilidadHoraria(
    nuevaDisponibilidad.diaSemana,
    nuevaDisponibilidad.horaInicio,
    nuevaDisponibilidad.horaFin
  );

  const medico = this.MedicoRepository.findById(medicoId);

  if (!medico) {
    throw new Error('Médico no encontrado');
  }

  const disponibilidadActual = medico.disponibilidades.find(
    d => d.id === idDisponibilidad
  );

  if (!disponibilidadActual) {
    throw new Error('Disponibilidad no encontrada');
  }

  const existeConflicto = medico.disponibilidades
    .filter(d => d.id !== idDisponibilidad)
    .some(d => {
      const existente = new DisponibilidadHoraria(
        d.diaSemana,
        d.horaInicio,
        d.horaFin
      );

      return nueva.seSolapa(existente);
    });

  if (existeConflicto) {
    throw new Error("Horario ocupado para el médico en ese día y horario");
    }

  medico.disponibilidades = medico.disponibilidades.map(d => {
    if (d.id === idDisponibilidad) {
      return {
        id: d.id,
        diaSemana: nueva.diaSemana,
        horaInicio: nueva.horaDesde.format("HH:mm"),
        horaFin: nueva.horaHasta.format("HH:mm")
      };
    }
    return d;
  });

  this.MedicoRepository.save(medico);

  return medico;
}

eliminarDisponibilidad(medicoId, idDisponibilidad) {
  const medico = this.MedicoRepository.findById(medicoId);

  if (!medico) {
    throw new Error('Médico no encontrado');
  }

  medico.eliminarDisponibilidad(idDisponibilidad);

  this.MedicoRepository.save(medico);
}

  static instance() {
    this._instance ||= new MedicoService();
    return this._instance;
  }
}