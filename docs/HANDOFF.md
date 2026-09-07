# Continuidad de ASTRA Maintenance

## Objetivo activo
Cerrar el piloto preventivo hasta staging y después incorporar de forma revisable el corpus técnico del usuario. El usuario pidió ampliar el plan y dejar instrucciones para continuar; este documento conserva el checkpoint.

## Leer primero
AGENTS.md → docs/PRODUCT.md → docs/API-CONTRACT.md → docs/ROADMAP-EXTENDED.md → docs/TECHNICAL-REFERENCE.md → docs/GITHUB-CONTROLS.md.
El archivo CONTINUAR_ASTRA.md en outputs de la tarea tiene comandos concretos y ESTADO_ASTRA.json conserva los commits finales del checkpoint.

## Estado comprobado
- Backend y frontend están integrados en feat/ASTRA-001-preventive-pilot.
- 20 pruebas de aceptación pasan sobre PostgreSQL real.
- Typecheck y build integrado pasan. npm audit reporta 0 vulnerabilidades.
- Tres migraciones se aplicaron en una base nueva aislada por Compose, astra_test.
- Cinco skills genéricas validaron su formato; una skill específica guía consulta de fuentes.
- GitHub privado creado y autenticación Git de Windows disponible.
- Corpus local indexado en .runtime/sources, con 1.110 referencias seleccionadas; la revisión técnica del corpus no está completada.

## Pendientes que impiden llamar lista a la entrega
1. Revisar/corregir los scripts operativos y demostrar despliegue de staging con commit limpio.
2. Restore-Check.ps1 actualmente restaura en otra base del mismo contenedor. Cambiarlo para usar otro proyecto Compose y otro volumen antes de declarar cumplida la prueba de recuperación.
3. Ejecutar E2E real con navegador, API y PostgreSQL.
4. Exportar y revisar visualmente PDF A6 y A4; las pruebas actuales comprueban generación y contenido, no toda la composición visual.
5. Ensayar rollback con dos imágenes identificables y comprobar conservación de datos.
6. Comprobar aislamiento de dos worktrees completos y schedule de backup.
7. Empaquetar/instalar plugin astra-engineering después del piloto verificado; todavía no está creado.
8. Revisar la salida de CI de GitHub. Existe una limitación real para proteger main bajo el plan privado actual.

## Reglas operativas
Los secretos y referencias locales están en .runtime, ignorado por Git. No mostrarlos en logs ni incluirlos en PR.
Los tests solo aceptan una base astra_test o test_* y la reinicializan; nunca cambiar esa barrera para usar datos reales.
Staging planeado: http://localhost:4380, ligado a loopback; todavía no se ha desplegado.
La activación LAN está preparada pero no probada: requiere HTTPS, cookie Secure y confianza explícita del cliente en la CA local.
Una única OT preventiva OPEN por activo en este piloto. No ampliar a planes simultáneos sin conservar bloqueo global de seguridad.

## Autorización
Implementación, verificación, commits, ramas, PR y staging autorizados. Merge de main y producción requieren aprobación humana. No se solicitó ni se utilizó crédito de reinicio de uso.
