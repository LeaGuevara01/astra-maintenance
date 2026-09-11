# Continuidad de ASTRA Maintenance

## Checkpoint ejecutado — ASTRA-005 integrado en `b21b347`

- Rama local `main`, limpia y alineada con `origin/main@b21b347`.
- Se portaron las correcciones CSRF multibyte, horómetros enteros y recarga de auditoría, y se formalizó P06: ningún resultado de cierre, incluido `NOT_OPERATIVE`, omite un checkpoint crítico `PENDING`/`FAIL`.
- Verify y staging sintético corresponden al SHA completo `b21b347b80a5eeac3df13ebaf69a394f05621f41` en `http://localhost:4380`; `/health/ready` respondió `ready` y `/api/v1/version` confirmó el mismo SHA.
- E2E real de interfaz completado con navegador sobre `OT-000006` (`cmtwe2cvl0001o70j3y37jkut`): ADMIN generó la OT; TECHNICIAN completó tareas, ingresó/reservó/consumió material, verificó controles y cerró; VIEWER consultó la OT cerrada en modo lectura.
- PDF A6 y A4 descargados desde la interfaz y revisados visualmente: A6 sin recortes, QR legible; A4 con cuatro tarjetas alineadas y legibles.
- OT-000006 quedó `CLOSED/OPERATIVE`: 600/645 h, dos tareas realizadas, checkpoint crítico conforme, material usado 1, reservado 0, faltante 0 y auditoría de generación/actualización/reserva/consumo/cierre.
- La aceptación funcional del piloto queda cerrada en staging sintético. Permanecen CI/PR remotos, operación persistente y la siguiente ampliación documental.

## Objetivo activo
Cerrar el piloto preventivo hasta staging y después incorporar de forma revisable el corpus técnico del usuario. El usuario pidió ampliar el plan y dejar instrucciones para continuar; este documento conserva el checkpoint.

## Leer primero
AGENTS.md → docs/PRODUCT.md → docs/API-CONTRACT.md → docs/ROADMAP-EXTENDED.md → docs/TECHNICAL-REFERENCE.md → docs/GITHUB-CONTROLS.md.
El archivo CONTINUAR_ASTRA.md en outputs de la tarea tiene comandos concretos y ESTADO_ASTRA.json conserva los commits finales del checkpoint.

## Estado comprobado
- Backend y frontend están integrados en feat/ASTRA-001-preventive-pilot.
- 21 pruebas de aceptación pasan sobre PostgreSQL real.
- Typecheck y build integrado pasan. npm audit reporta 0 vulnerabilidades.
- Tres migraciones se aplicaron en una base nueva aislada por Compose, astra_test.
- scripts/Verify.ps1 -SkipInstall pasó sobre el commit limpio `2ef666a`.
- Deploy-Staging.ps1 desplegó staging sintético local en `http://localhost:4380`; health y version responden con el commit `2ef666ae0721208501d5664a0ce5e8d7f37d7da0`.
- Backup.ps1 y Restore-Check.ps1 ejecutaron un backup real, restauración aislada con evidencia y una prueba negativa de checksum corrupto.
- Rollback-Staging.ps1 volvió temporalmente al release `32ba952` y preservó el asset sonda `ASTRA-RB-031857`; después staging se redeployó al commit actual `2ef666a`.
- New-Worktree.ps1, Prepare.ps1 y Start-Dev.ps1 se ensayaron con dos worktrees completos en paralelo; cada uno levantó DB, API y Vite con proyecto Compose, puertos y credenciales diferentes.
- Cinco skills genéricas validaron su formato; una skill específica guía consulta de fuentes.
- GitHub privado creado y autenticación Git de Windows disponible.
- Corpus local indexado en .runtime/sources, con 1.110 referencias seleccionadas; la revisión técnica del corpus no está completada.
- ASTRA-009 Agent Coordination Layer integrado desde PR #3. La revisión de integración
  dejó los contratos de producto, API y ADR aceptados como autoridad hasta que el
  integrador incorpore formalmente una decisión humana en el contrato canónico aplicable.
  Evidencia: `Pilot checks` aprobó para `a3ab8b29b831ac0fd83ffbeb1265c871b078061d`
  (run `34295975554`), con typecheck, pruebas, build, migración, auditoría de
  dependencias y validación de scripts de Windows.

## Pendientes posteriores al cierre del piloto
1. Decidir si ASTRA-004 requiere además un ensayo explícito de contención entre dos `Deploy-Staging.ps1` concurrentes o si el lock implementado y la evidencia actual son suficientes.
2. Registrar y ensayar el schedule de backup diario con `Register-Backup.ps1` si ese entorno va a quedar persistente.
3. Empaquetar/instalar plugin astra-engineering después del piloto verificado; todavía no está creado.
4. Revisar la salida de CI de GitHub. Existe una limitación real para proteger main bajo el plan privado actual.
5. ASTRA-006 implementado en `bce8d6a` (`feat/ASTRA-006-document-intelligence`): normalización local, extracción parcial, cola OCR y cola de revisión humana conservadora. Typecheck API/web, test focalizado 3/3, build, audit y normalización local pasaron. `Verify.ps1` no llegó a migraciones ni a la suite PostgreSQL: Docker Compose rechazó el montaje Caddy con `invalid spec: :/etc/caddy/Caddyfile:ro: empty section between colons`. Resolver ese bloqueo operativo y rerun de Verify antes de staging; falta además revisión humana del corpus y el dry-run de importación de ASTRA-007.
6. Aplicar la capa de coordinación a las tareas de API, frontend y operaciones,
   respetando la asignación de rutas y el protocolo de handoff.

## Reglas operativas
Los secretos y referencias locales están en .runtime, ignorado por Git. No mostrarlos en logs ni incluirlos en PR.
Los tests solo aceptan una base astra_test o test_* y la reinicializan; nunca cambiar esa barrera para usar datos reales.
Los entornos dev y test reasignan puertos ocupados antes de persistir la configuración local; esa reasignación se guarda en .runtime para el siguiente arranque.
Staging local activo: http://localhost:4380, ligado a loopback y con seed sintético.
La activación LAN está preparada pero no probada: requiere HTTPS, cookie Secure y confianza explícita del cliente en la CA local.
Una única OT preventiva OPEN por activo en este piloto. No ampliar a planes simultáneos sin conservar bloqueo global de seguridad.

## Autorización
Implementación, verificación, commits, ramas, PR y staging autorizados. Merge de main y producción requieren aprobación humana. No se solicitó ni se utilizó crédito de reinicio de uso.
