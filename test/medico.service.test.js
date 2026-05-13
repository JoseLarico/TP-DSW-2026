import { MedicoService } from "../src/services/medico.service.js";
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Medico } from "../src/models/medico.model.js";

describe("Medico Service", () => {
    let medicoService;

    beforeEach(() => {
        medicoService = new MedicoService();
    });

    // ── crearAgenda ───────────────────────────────────────────────────────────

    describe("crearAgenda", () => {
        const disponibilidad = {
            diaSemana: "LUNES",
            horaInicio: "09:00",
            horaFin: "13:00",
            fechaFin: "2026-12-31T00:00:00.000Z"
        };

        const sede = { _id: { toString: () => "sede1" } };

        test("Si el médico no existe entonces lanza error", async () => {
            medicoService.MedicoRepository.findById = jest.fn().mockRejectedValue(new Error("Médico no encontrado"));
            await expect(medicoService.crearAgenda("99", "especialidad", "esp1", "sede1", disponibilidad)).rejects.toThrow("Médico no encontrado");
        });

        test("Si el médico no atiende en esa sede entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [{ _id: { toString: () => "esp1" } }], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            await expect(medicoService.crearAgenda("1", "especialidad", "esp1", "sede1", disponibilidad)).rejects.toThrow("El médico no atiende en esa sede");
        });

        test("Si la especialidad no existe entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [{ _id: { toString: () => "esp1" } }], [], [sede]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.EspecialidadRepository.findById = jest.fn().mockRejectedValue(new Error("Especialidad no encontrada"));
            await expect(medicoService.crearAgenda("1", "especialidad", "esp1", "sede1", disponibilidad)).rejects.toThrow("Especialidad no encontrada");
        });

        test("Si el médico no tiene la especialidad entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [sede]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.EspecialidadRepository.findById = jest.fn().mockResolvedValue({ _id: "esp1", costoConsulta: 5000, duracionTurnoEnMins: 30 });
            await expect(medicoService.crearAgenda("1", "especialidad", "esp1", "sede1", disponibilidad)).rejects.toThrow("El médico no tiene esa especialidad");
        });

        test("Si la disponibilidad tiene horaInicio mayor a horaFin entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [{ _id: { toString: () => "esp1" } }], [], [sede]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.EspecialidadRepository.findById = jest.fn().mockResolvedValue({ _id: "esp1", costoConsulta: 5000, duracionTurnoEnMins: 30 });
            const dispInvalida = { diaSemana: "LUNES", horaInicio: "13:00", horaFin: "09:00", fechaFin: "2026-12-31T00:00:00.000Z" };
            await expect(medicoService.crearAgenda("1", "especialidad", "esp1", "sede1", dispInvalida)).rejects.toThrow("Hora inicio debe ser menor a hora fin");
        });

        test("Si los datos son válidos genera turnos para una especialidad", async () => {
            const especialidad = { _id: "esp1", costoConsulta: 5000, duracionTurnoEnMins: 30 };
            const medico = new Medico("user1", "123", "Juan", [{ _id: { toString: () => "esp1" } }], [], [sede]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.EspecialidadRepository.findById = jest.fn().mockResolvedValue(especialidad);
            medicoService.agenda.crearAgenda = jest.fn().mockResolvedValue([]);
            const result = await medicoService.crearAgenda("1", "especialidad", "esp1", "sede1", disponibilidad);
            expect(medicoService.agenda.crearAgenda).toHaveBeenCalledWith(medico, especialidad, "sede1", disponibilidad);
            expect(result).toEqual([]);
        });

        test("Si los datos son válidos genera turnos para una práctica", async () => {
            const practica = { _id: "prac1", costo: 3000, duracionTurnoEnMins: 20 };
            const medico = new Medico("user1", "123", "Juan", [], [{ _id: { toString: () => "prac1" } }], [sede]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.PracticaRepository.findById = jest.fn().mockResolvedValue(practica);
            medicoService.agenda.crearAgenda = jest.fn().mockResolvedValue([]);
            await medicoService.crearAgenda("1", "practica", "prac1", "sede1", disponibilidad);
            expect(medicoService.agenda.crearAgenda).toHaveBeenCalledWith(medico, practica, "sede1", disponibilidad);
        });

        test("Si el médico no tiene la práctica entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [sede]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.PracticaRepository.findById = jest.fn().mockResolvedValue({ _id: "prac1", costo: 3000, duracionTurnoEnMins: 20 });
            await expect(medicoService.crearAgenda("1", "practica", "prac1", "sede1", disponibilidad)).rejects.toThrow("El médico no tiene esa práctica");
        });
    });

    // ── agregarEspecialidad ───────────────────────────────────────────────────

    describe("agregarEspecialidad", () => {
        test("Si el médico no existe entonces lanza error", async () => {
            medicoService.MedicoRepository.findById = jest.fn().mockRejectedValue(new Error("Médico no encontrado"));
            await expect(medicoService.agregarEspecialidad("99", "esp1")).rejects.toThrow("Médico no encontrado");
        });

        test("Si la especialidad no existe entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.EspecialidadRepository.findById = jest.fn().mockRejectedValue(new Error("Especialidad no encontrada"));
            await expect(medicoService.agregarEspecialidad("1", "esp1")).rejects.toThrow("Especialidad no encontrada");
        });

        test("Si el médico ya tiene la especialidad entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [{ _id: { toString: () => "esp1" } }], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.EspecialidadRepository.findById = jest.fn().mockResolvedValue({ _id: "esp1" });
            await expect(medicoService.agregarEspecialidad("1", "esp1")).rejects.toThrow("El médico ya tiene esa especialidad");
        });

        test("Si los datos son válidos agrega la especialidad al médico", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.EspecialidadRepository.findById = jest.fn().mockResolvedValue({ _id: "esp1" });
            medicoService.MedicoRepository.save = jest.fn().mockImplementation(m => Promise.resolve(m));
            const resultado = await medicoService.agregarEspecialidad("1", "esp1");
            expect(resultado.especialidades).toContain("esp1");
        });
    });

    // ── eliminarEspecialidad ──────────────────────────────────────────────────

    describe("eliminarEspecialidad", () => {
        test("Si el médico no tiene la especialidad entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            await expect(medicoService.eliminarEspecialidad("1", "esp1")).rejects.toThrow("El médico no tiene esa especialidad");
        });

        test("Si el médico tiene la especialidad entonces la elimina", async () => {
            const medico = new Medico("user1", "123", "Juan", [{ _id: { toString: () => "esp1" } }], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.MedicoRepository.save = jest.fn().mockResolvedValue({});
            medicoService.turnoRepository.existenTurnosFuturosActivos = jest.fn().mockResolvedValue(false);
            await medicoService.eliminarEspecialidad("1", "esp1");
            expect(medico.especialidades).toHaveLength(0);
        });
    });

    // ── agregarPractica ───────────────────────────────────────────────────────

    describe("agregarPractica", () => {
        test("Si el médico ya tiene la práctica entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [{ _id: { toString: () => "prac1" } }], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.PracticaRepository.findById = jest.fn().mockResolvedValue({ _id: "prac1" });
            await expect(medicoService.agregarPractica("1", "prac1")).rejects.toThrow("El médico ya tiene esa práctica");
        });

        test("Si los datos son válidos agrega la práctica al médico", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.PracticaRepository.findById = jest.fn().mockResolvedValue({ _id: "prac1" });
            medicoService.MedicoRepository.save = jest.fn().mockImplementation(m => Promise.resolve(m));
            const resultado = await medicoService.agregarPractica("1", "prac1");
            expect(resultado.practicas).toContain("prac1");
        });
    });
});
