# Continuidad de ASTRA Maintenance

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
- scripts/Verify.ps1 -SkipInstall volvió a pasar tras reforzar la preparación de puertos y locks en scripts operativos; antes de staging debe repetirse sobre SHA limpio.
- New-Worktree.ps1 ahora crea contextos dev/test aislados en el checkout nuevo; un worktree temporal validó esa inicialización y se eliminó después del ensayo.
- Cinco skills genéricas validaron su formato; una skill específica guía consulta de fuentes.
- GitHub privado creado y autenticación Git de Windows disponible.
- Corpus local indexado en .runtime/sources, con 1.110 referencias seleccionadas; la revisión técnica del corpus no está completada.

## Pendientes que impiden llamar lista a la entrega
1. Ejecutar/ensayar los scripts operativos ya corregidos y demostrar despliegue de staging con commit limpio.
2. Restore-Check.ps1 ya usa otro proyecto Compose y otro volumen; falta ejecutarlo con un backup real y conservar evidencia de datos restaurados sin tocar la base activa.
3. Ejecutar E2E real con navegador, API y PostgreSQL.
4. Exportar y revisar visualmente PDF A6 y A4; las pruebas actuales comprueban generación y contenido, no toda la composición visual.
5. Ensayar rollback con dos imágenes identificables y comprobar conservación de datos.
6. Comprobar aislamiento de dos worktrees completos en paralelo y schedule de backup.
7. Empaquetar/instalar plugin astra-engineering después del piloto verificado; todavía no está creado.
8. Revisar la salida de CI de GitHub. Existe una limitación real para proteger main bajo el plan privado actual.

## Reglas operativas
Los secretos y referencias locales están en .runtime, ignorado por Git. No mostrarlos en logs ni incluirlos en PR.
Los tests solo aceptan una base astra_test o test_* y la reinicializan; nunca cambiar esa barrera para usar datos reales.
Los entornos dev y test reasignan puertos ocupados antes de persistir la configuración local; esa reasignación se guarda en .runtime para el siguiente arranque.
Staging planeado: http://localhost:4380, ligado a loopback; todavía no se ha desplegado.
La activación LAN está preparada pero no probada: requiere HTTPS, cookie Secure y confianza explícita del cliente en la CA local.
Una única OT preventiva OPEN por activo en este piloto. No ampliar a planes simultáneos sin conservar bloqueo global de seguridad.

## Autorización
Implementación, verificación, commits, ramas, PR y staging autorizados. Merge de main y producción requieren aprobación humana. No se solicitó ni se utilizó crédito de reinicio de uso.
