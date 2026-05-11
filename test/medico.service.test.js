import { MedicoService } from "../src/services/medico.service.js";
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Medico } from "../src/models/medico.model.js";

describe("Medico Service", () => {
    let medicoService;

    beforeEach(() => {
        medicoService = new MedicoService();
    });

    // ── obtenerDisponibilidades ───────────────────────────────────────────────

    describe("obtenerDisponibilidades", () => {
        test("Si el médico no existe entonces lanza error", async () => {
            medicoService.MedicoRepository.findById = jest.fn().mockRejectedValue(new Error("Médico no encontrado"));
            await expect(medicoService.obtenerDisponibilidades(99)).rejects.toThrow("Médico no encontrado");
        });

        test("Si el médico existe entonces devuelve sus disponibilidades", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], [
                { _id: "507f1f77bcf86cd799439011", diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" }
            ]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            await expect(medicoService.obtenerDisponibilidades(1)).resolves.toEqual(medico.disponibilidades);
        });
    });

    // ── obtenerDisponibilidadPorId ────────────────────────────────────────────

    describe("obtenerDisponibilidadPorId", () => {
        test("Si el médico no existe entonces lanza error", async () => {
            medicoService.MedicoRepository.findById = jest.fn().mockRejectedValue(new Error("Médico no encontrado"));
            await expect(medicoService.obtenerDisponibilidadPorId(99, 1)).rejects.toThrow("Médico no encontrado");
        });

        test("Si la disponibilidad no existe entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            await expect(medicoService.obtenerDisponibilidadPorId(1, "507f1f77bcf86cd799439099")).rejects.toThrow("Disponibilidad no encontrada");
        });

        test("Si existe entonces devuelve la disponibilidad correcta", async () => {
            const disp = { _id: "507f1f77bcf86cd799439011", diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" };
            const medico = new Medico("user1", "123", "Juan", [], [], [], [disp]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            await expect(medicoService.obtenerDisponibilidadPorId(1, "507f1f77bcf86cd799439011")).resolves.toEqual(disp);
        });
    });

    // ── crearDisponibilidad ───────────────────────────────────────────────────

    describe("crearDisponibilidad", () => {
        test("Si el médico no existe entonces lanza error", async () => {
            medicoService.MedicoRepository.findById = jest.fn().mockRejectedValue(new Error("Médico no encontrado"));
            await expect(medicoService.crearDisponibilidad(99, { diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" })).rejects.toThrow("Médico no encontrado");
        });

        test("Si horaInicio es mayor a horaFin entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            await expect(medicoService.crearDisponibilidad(1, { diaSemana: "LUNES", horaInicio: "12:00", horaFin: "08:00" })).rejects.toThrow("Hora inicio debe ser menor a hora fin");
        });

        test("Si el horario se solapa con uno existente entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], [
                { _id: "507f1f77bcf86cd799439011", diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" }
            ]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.MedicoRepository.save = jest.fn();
            await expect(medicoService.crearDisponibilidad(1, { diaSemana: "LUNES", horaInicio: "10:00", horaFin: "14:00" })).rejects.toThrow("Horario ocupado para el médico en ese día y horario");
        });

        test("Si no hay conflictos entonces agrega la disponibilidad al médico", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.MedicoRepository.save = jest.fn().mockImplementation(m => Promise.resolve(m));
            const resultado = await medicoService.crearDisponibilidad(1, { diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" });
            expect(resultado.diaSemana).toBe("LUNES");
        });
    });

    // ── editarDisponibilidad ──────────────────────────────────────────────────

    describe("editarDisponibilidad", () => {
        test("Si el médico no existe entonces lanza error", async () => {
            medicoService.MedicoRepository.findById = jest.fn().mockRejectedValue(new Error("Médico no encontrado"));
            await expect(medicoService.editarDisponibilidad(99, "507f1f77bcf86cd799439011", { diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" })).rejects.toThrow("Médico no encontrado");
        });

        test("Si la disponibilidad no existe entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], []);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            await expect(medicoService.editarDisponibilidad(1, "507f1f77bcf86cd799439099", { diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" })).rejects.toThrow("Disponibilidad no encontrada");
        });

        test("Si el nuevo horario se solapa con otra disponibilidad entonces lanza error", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], [
                { _id: "507f1f77bcf86cd799439011", diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" },
                { _id: "507f1f77bcf86cd799439012", diaSemana: "LUNES", horaInicio: "14:00", horaFin: "18:00" }
            ]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            await expect(medicoService.editarDisponibilidad(1, "507f1f77bcf86cd799439011", { diaSemana: "LUNES", horaInicio: "13:00", horaFin: "17:00" })).rejects.toThrow("Horario ocupado para el médico en ese día y horario");
        });

        test("Si los datos son válidos entonces actualiza la disponibilidad", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], [
                { _id: "507f1f77bcf86cd799439011", diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" }
            ]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.MedicoRepository.save = jest.fn().mockImplementation(m => Promise.resolve(m));
            const resultado = await medicoService.editarDisponibilidad(1, "507f1f77bcf86cd799439011", { diaSemana: "MIERCOLES", horaInicio: "09:00", horaFin: "13:00" });
            expect(resultado).toMatchObject({ diaSemana: "MIERCOLES", horaInicio: "09:00", horaFin: "13:00" });
        });
    });

    // ── eliminarDisponibilidad ────────────────────────────────────────────────

    describe("eliminarDisponibilidad", () => {
        test("Si el médico no existe entonces lanza error", async () => {
            medicoService.MedicoRepository.findById = jest.fn().mockRejectedValue(new Error("Médico no encontrado"));
            await expect(medicoService.eliminarDisponibilidad(99, "507f1f77bcf86cd799439011")).rejects.toThrow("Médico no encontrado");
        });

        test("Si la disponibilidad existe entonces la elimina", async () => {
            const medico = new Medico("user1", "123", "Juan", [], [], [], [
                { _id: "507f1f77bcf86cd799439011", diaSemana: "LUNES", horaInicio: "08:00", horaFin: "12:00" },
                { _id: "507f1f77bcf86cd799439012", diaSemana: "MARTES", horaInicio: "10:00", horaFin: "15:00" }
            ]);
            medicoService.MedicoRepository.findById = jest.fn().mockResolvedValue(medico);
            medicoService.MedicoRepository.save = jest.fn().mockResolvedValue({});
            await medicoService.eliminarDisponibilidad(1, "507f1f77bcf86cd799439011");
            expect(medico.disponibilidades).toHaveLength(1);
            expect(medico.disponibilidades[0]._id).toBe("507f1f77bcf86cd799439012");
        });
    });
});
