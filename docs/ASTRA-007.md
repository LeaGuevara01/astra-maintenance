# ASTRA-007 — Dry-run de candidatos con procedencia

Este slice define una comparación determinista y no mutante para candidatos de catálogo. No agrega stock, no crea registros de producción y no convierte una similitud o equivalencia declarada en equivalencia técnica validada.

## Contrato

- `apps/api/src/candidate-import.ts` exige `sourceId` y `locator` para cada candidato.
- El resultado clasifica cada fila como `ADD`, `UPDATE`, `UNCHANGED`, `CONFLICT` o `REJECTED`, conservando razones, procedencia y una huella reproducible.
- Las unidades incompatibles, campos obligatorios ausentes y cantidades históricas inválidas se rechazan.
- Un PN OEM distinto genera conflicto explícito; el valor `A_CONFIRMAR` se conserva.
- `equivalenceOf` sólo produce `UNVALIDATED` y una advertencia de revisión humana.
- Todos los resultados declaran `stockEffect: NONE` y el informe declara `apply: false`.

## Verificación

```powershell
npx vitest run apps/api/test/candidate-import.test.ts --pool=threads --maxWorkers=1 --reporter=verbose
npm run typecheck
```

Resultado: 3/3 pruebas del contrato, typecheck de API y web y build completo aprobados. El build web requirió ejecutar fuera del aislamiento restringido porque el entorno devolvía `spawn EPERM`; Vite compiló 1.846 módulos y generó el bundle de producción. Este SHA aún no se desplegó.

## Próximo paso

ASTRA-008: decidir el contrato de aplicación transaccional e idempotente y su migración/API sólo después de revisar este dry-run y sus fuentes; nunca cargar cantidades históricas como stock.

## Módulo web de validación

La consola incluye `Inteligencia documental` en `/documents` para datos sintéticos. Permite revisar tres candidatos representativos, consultar procedencia/localizador, cambiar la decisión en la sesión y ver el resultado del lote. Esta primera pantalla es un prototipo de revisión: las decisiones no persisten y no existe botón de aplicación ni modificación de inventario. El módulo fue incluido en el staging del SHA `6aa6293`.
