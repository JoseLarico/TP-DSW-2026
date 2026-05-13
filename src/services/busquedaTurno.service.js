import { TurnoRepository } from '../repositories/turno.repository.js';
import { PacienteRepository } from '../repositories/paciente.repository.js';
import { nivelCobertura } from '../enums/nivelCobertura.enum.js';

export class BusquedaTurnoService {
    constructor({
        turnoRepository = TurnoRepository.instance(),
        pacienteRepository = PacienteRepository.instance()
    } = {}) {
        this.turnoRepository = turnoRepository;
        this.pacienteRepository = pacienteRepository;
    }

    static instance() {
        this._instance ||= new BusquedaTurnoService();
        return this._instance;
    }

    async buscarTurnosConCobertura(pacienteId, filtros) {
        const paciente = await this.pacienteRepository.findById(pacienteId);

        const resultado = await this.turnoRepository.buscarDisponibles(filtros);

        const turnosEnriquecidos = resultado.turnos.map(turno => {
            const cobertura = this.#calcularCobertura(paciente.plan, turno.especialidad?._id?.toString(), turno.practica?._id?.toString());
            const costoBase = turno.costo ?? 0;
            const costoPaciente = this.#calcularCostoPaciente(costoBase, cobertura);

            return {
                _id: turno._id,
                medico: { _id: turno.medico._id, nombre: turno.medico.nombre, matricula: turno.medico.matricula },
                especialidad: turno.especialidad ? { _id: turno.especialidad._id, nombre: turno.especialidad.nombre } : null,
                practica: turno.practica ? { _id: turno.practica._id, nombre: turno.practica.nombre } : null,
                sede: turno.sede ? { _id: turno.sede._id, nombre: turno.sede.nombre, direccion: turno.sede.direccion } : null,
                fechaHora: turno.fechaHora,
                cobertura: {
                    nivel: cobertura.nivel,
                    porcentaje: cobertura.porcentaje,
                    descripcion: this.#descripcionCobertura(cobertura.nivel, cobertura.porcentaje)
                },
                costos: {
                    costoBase,
                    costoPaciente,
                    costoObraSocial: costoBase - costoPaciente,
                    moneda: 'ARS'
                }
            };
        });

        return {
            turnos: turnosEnriquecidos,
            paginacion: {
                total: resultado.total,
                pagina: resultado.pagina,
                paginas: resultado.paginas,
                limit: filtros.limit ?? 10,
                hasNext: resultado.pagina < resultado.paginas,
                hasPrevious: resultado.pagina > 1
            },
            paciente: {
                _id: paciente._id,
                nombre: paciente.nombre,
                obraSocial: paciente.obraSocial,
                plan: paciente.plan ? { _id: paciente.plan._id, nombre: paciente.plan.nombre } : null
            }
        };
    }

    #calcularCobertura(plan, especialidadId, practicaId) {
        if (!plan) return { nivel: nivelCobertura.NO_CUBIERTA, porcentaje: 0 };

        if (practicaId && plan.coberturasPractica) {
            const cob = plan.coberturasPractica.find(c => c.practica?.toString() === practicaId);
            if (cob) return { nivel: cob.nivel, porcentaje: cob.porcentaje ?? 0 };
        }
        if (especialidadId && plan.coberturasEspecialidad) {
            const cob = plan.coberturasEspecialidad.find(c => c.especialidad?.toString() === especialidadId);
            if (cob) return { nivel: cob.nivel, porcentaje: cob.porcentaje ?? 0 };
        }
        return { nivel: nivelCobertura.NO_CUBIERTA, porcentaje: 0 };
    }

    #calcularCostoPaciente(costoBase, cobertura) {
        if (cobertura.nivel === nivelCobertura.TOTAL) return 0;
        if (cobertura.nivel === nivelCobertura.PARCIAL) return Math.round(costoBase * (1 - cobertura.porcentaje / 100) * 100) / 100;
        return costoBase;
    }

    #descripcionCobertura(nivel, porcentaje) {
        if (nivel === nivelCobertura.TOTAL) return 'Cobertura total';
        if (nivel === nivelCobertura.PARCIAL) return `Cobertura parcial (${porcentaje}%)`;
        return 'Sin cobertura';
    }
}
