import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sweet Medical API',
            version: '1.0.0',
            description: 'API REST para la plataforma de gestión de turnos médicos Sweet Medical',
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Servidor local' }
        ],
        tags: [
            { name: 'Health', description: 'Estado del servidor' },
            { name: 'Médicos', description: 'Gestión de médicos, disponibilidades y servicios' },
            { name: 'Pacientes', description: 'Gestión de pacientes' },
            { name: 'Turnos', description: 'Ciclo de vida de los turnos' },
            { name: 'Notificaciones', description: 'Notificaciones de usuarios' },
            { name: 'Especialidades', description: 'Gestión de especialidades' },
            { name: 'Prácticas', description: 'Gestión de prácticas' },
            { name: 'Obras Sociales', description: 'Gestión de obras sociales y planes' },
            { name: 'Sedes', description: 'Gestión de sedes' },
        ],
    },
    apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
