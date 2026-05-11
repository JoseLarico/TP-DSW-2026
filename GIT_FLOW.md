# Git Flow

Para el desarrollo del proyecto utilizamos **GitHub Flow**

## Ramas principales

- `main`: código estable y listo para entregar en cada checkpoint.
- `dev`: rama de integración donde se acumula el trabajo de todos los integrantes.

## Flujo de trabajo

1. Por cada funcionalidad a desarrollar, cada integrante crea una rama desde `dev` con el formato `feat/{nombre}/{funcionalidad}`.
2. Una vez finalizada la funcionalidad, se abre un **Pull Request** hacia `dev` para que el equipo pueda revisar el código antes de mergear.
3. Una vez aprobado, se mergea a `dev` y se elimina la rama de la funcionalidad.
4. Cuando se tienen todas las funcionalidades del checkpoint completas e integradas en `dev`, se abre un **Pull Request** de `dev` a `main`.
