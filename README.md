# GPS50GB-MARKETVERSITARIO
Marketvesitario es una plataforma tipo marketplace universitario orientada a la compra, venta, intercambio de productos y oferta de tutorías académicas entre estudiantes.

Objetivo
Facilitar el acceso a productos, servicios y apoyo académico dentro de la comunidad universitaria, promoviendo la economía colaborativa.

Documentación
Justificacion: https://docs.google.com/document/d/1S_uCDQvk3OqZPv92ULqyzYKSbYKVmEzLZSlaVT38Wu4/edit?usp=sharing

Plan de negocio: https://docs.google.com/document/d/11D14x0WriyHwGhULsdCjaE42dLMMSomK88bFuRAET1Q/edit?usp=sharing

Contrato: https://docs.google.com/document/d/1K6_x1fBKXy-EBIY7ViJlkdY-3jo-BY8UaDaw8T3SKec/edit?usp=sharing

Gestión del proyecto
Product Backlog: Issues del repositorio
Tablero de trabajo: GitHub Projects

Integrantes
Equipo de desarrollo Codeamos

- Acevedo Reyes Katherin Vanessa
- Isaza Franco Karen Dahiana
- Maldonado Ceron Cristian David
- Ortiz Duque Jose Fabian
- Rivas Chica Keiner Alejandro 

## Arquitectura del Proyecto

- **Frontend:** Desarrollado en React, estructurado bajo el patrón de diseño por características (Feature-Sliced Design) para evitar conflictos en un equipo de 5 personas.
- **Backend:** Provee una base de datos PostgreSQL, sistema de Autenticación, Storage para imágenes y Realtime. La seguridad y lógica de negocio se controlan desde la base de datos mediante Políticas RLS (Row Level Security) y *Edge Functions*.

### Estructura General de Carpetas (Sujeta a adiciones y cambios durante el desarrollo)

La aplicación está claramente dividida en dos secciones dentro del mismo repositorio:

```text
/
 ├── frontend/          # Proyecto React principal
 │   └── src/
 │       ├── pages/       # (o app/) Vistas públicas y privadas de la plataforma.
 │       ├── features/    # Módulos del negocio (ej. auth/, marketplace/, tutoring/).
 │       ├── components/  # Componentes de UI básicos y agnósticos al negocio.
 │       ├── services/    # Configuración de los clientes y comunicación con APIs/Supabase.
 │       └── hooks/       # Hooks personalizados de React.
 │
 ├── supabase/          # El "Backend en una caja" gestionado por el CLI de Supabase
 │   ├── migrations/    # Versionamiento de la base de datos en scripts de SQL puro.
 │   ├── functions/     # Edge functions para ejecutar lógica robusta de servidor bajo demanda.
 │   └── seed.sql       # Script de datos iniciales / de prueba (mock data).
```

### Entorno de Desarrollo Local

Para evitar trabajar directamente sobre la base de datos remota de producción durante el desarrollo del código, utilizamos el CLI de Supabase en local (mediante Docker).

**Comandos básicos previstos:**
- Iniciar Supabase (BD + Panel Local): `npx supabase start`
- Guardar los cambios de la base local y crear un script .sql: `npx supabase db diff`
