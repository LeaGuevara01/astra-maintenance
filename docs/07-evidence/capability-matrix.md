# Matriz de capacidades y evidencia

Actualizada: 2026-09-16. Esta matriz indica la última evidencia conocida por tipo. “Implementado” no significa “desplegado”; una celda vacía no se completa por inferencia.

| Capacidad | Contrato/código | Automatización más reciente | Evidencia UI/PDF | Staging observado | Estado |
|---|---|---|---|---|---|
| Sesión, CSRF y roles | `API-CONTRACT`, `auth.ts` | `a0c9178`: Verify limpio, 54/54 | Roles completos históricos en `b21b347`; recorrido documental parcial en `a6cf1a8` | `a0c9178` health/version/footer | Implementada |
| Activos y lecturas monotónicas | P01, `app.ts`, `maintenance.ts` | `a0c9178`: 54/54 | Flujo histórico de roles | `a0c9178` API, sin recorrido funcional nuevo | Implementada |
| Plan versionado y tareas por frecuencia | P02–P04 | `a0c9178`: 54/54 | Planes visibles históricamente | `a0c9178` API | Implementada en alcance piloto |
| Generación idempotente de OT | P03 | `a0c9178`: 54/54, concurrencia y replay | E2E histórico `b21b347` | `a0c9178` API | Implementada |
| Reserva y consumo sin stock negativo | P05 | 54/54, carreras y reservas ajenas | E2E histórico `b21b347` | Sin mutación nueva | Implementada |
| Cierre y checkpoints críticos | P06 | 54/54, PENDING/FAIL/race | E2E histórico `b21b347` | Sin mutación nueva | Implementada |
| Snapshots e historia inmutable | P07 | 54/54 + triggers | Tarjetas históricas | Sin prueba directa nueva | Implementada |
| Continuidad de tareas diferidas | P08 | 54/54 | Evidencia histórica de UI | Sin prueba directa nueva | Implementada |
| Tarjetas A6/A4 | P09, `documents.ts` | 54/54 generación HTML/PDF | A6/A4 revisadas en `b21b347` | No reverificada visualmente | Implementada; evidencia visual histórica |
| Auditoría | P10 | `a0c9178`: 54/54 | Vista histórica | `a0c9178` API | Implementada |
| Candidatos documentales persistentes | ADR-002 | `a0c9178`: 54/54 | ADMIN histórico `52b1220` | `a0c9178` | Implementada |
| Paginación de candidatos/historial | `API-CONTRACT` | `a0c9178`: 54/54 | Omitida por decisión actual | `a0c9178`, no recorrida | Implementada; UI no revalidada |
| Cola de fuentes | `API-CONTRACT` | `a0c9178`: 54/54 | Revisión histórica `2b6cd68` | `a0c9178` | Implementada |
| Hallazgos asistidos y decisiones | `API-CONTRACT` | `a0c9178`: 54/54 | Revisión parcial histórica | `a0c9178` | Implementada |
| Derivación hallazgo → candidato | `API-CONTRACT` | `a0c9178`: 54/54 | Click/teclado en `a6cf1a8`; drag desktop no ejecutado | `a0c9178`; UI cargó datos | Implementada |
| Dry-run sin efecto de stock | ADR-002, candidate import | `a0c9178`: 54/54 | Comparación histórica | `a0c9178` | Implementada |
| OpenAPI completo | `openapi.ts` | `a0c9178`: paridad incluida en 54/54 | No aplica | `a0c9178`; 32 paths/35 operaciones | Implementado y desplegado |
| Lector seguro de originales | [ASTRA-010](../05-planning/ASTRA-010-secure-source-reader.md) | Sin implementación | No existe | No existe | Planificado; no implementado |
| Backup | scripts de operaciones | Dump previo a `a0c9178` creado y hasheado | No aplica | Ejecutado; restore de ese dump no probado | Implementado; restauración específica pendiente |
| Restore-check aislado | scripts de operaciones | Evidencia histórica, checksum/fingerprint | No aplica | No ejecutado actualmente | Implementado; última evidencia histórica |
| Rollback de aplicación | scripts de operaciones | Evidencia histórica `32ba952 ↔ 2ef666a` | No aplica | No ejecutado actualmente | Implementado; compatibilidad depende del esquema |
| Staging LAN HTTPS | script disponible | Sin ejecución registrada | No ejecutada | No habilitado por esta tarea | Preparado, no validado |
| Backup programado | script disponible | Sin registro de tarea confirmado | No aplica | No registrado según última evidencia | Pendiente operativo |
| Aplicación de candidatos al catálogo | Fuera de contrato actual | No existe | No existe | No existe | No implementada |

## Reglas de actualización

- Actualizar una fila sólo con comando, fecha y SHA/árbol identificable.
- Conservar la evidencia anterior cuando cubre otra dimensión; no reemplazar UI por tests ni tests por UI.
- Si cambia el comportamiento, la evidencia histórica puede quedar como regresión de referencia, no como aceptación del cambio.
- Staging requiere health y versión; footer sólo cuando se exige aprobación visual.
- Datos del corpus permanecen `A_CONFIRMAR` hasta revisión humana, aunque la capacidad técnica esté implementada.
