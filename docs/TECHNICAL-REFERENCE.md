# Referencias técnicas — estado de incorporación

Se inventariaron Documentos, Descargas e Imágenes sin modificar originales. El índice detallado es local y no se publica en Git: .runtime/sources/index.json; textos en .runtime/sources/text/.

## Cobertura de extracción
- 5.219 archivos inventariados.
- 1.110 referencias seleccionadas por nombres/carpetas técnicas; 1.080 hashes únicos.
- 634 con texto extraído; 104 requieren OCR; 342 requieren revisión visual; 30 duplicadas.
- Incluye 394 referencias de historial comercial, 626 referencias técnicas, 80 manuales/catálogos y 10 documentos de flujo interno. Clasificación automática provisional.
- No equivale a una lectura/validación humana de todo el corpus. Fotografías y capturas sin contexto técnico claro necesitan clasificación adicional.

## Referencias efectivamente consultadas
| ID local | Documento | Hallazgo aplicable |
|---|---|---|
| SRC-be418384056b | TARJETA SERVICIO PUMA.docx | Tarjeta operacional repetida con activo, fecha, horas, fluidos, filtro, observaciones y responsable. Sus capacidades/PN son datos internos pendientes de contraste OEM. |
| SRC-b5e1337d6f52 | TARJETAS DE SERVICIO MANTENIMIENTO MOTOR PUMA.pdf, páginas 1–2 | Cuatro tarjetas distribuidas en dos páginas. El nuevo renderer debe demostrar cuatro A6 en una sola A4 con legibilidad. |
| SRC-e5842fb21733 | Manual_Control_Visual_Herramientas_Taller_ECT-HER_v1.1.docx | Familias de herramientas, identificación, chequeos individuales, estado, ubicación y calibración. El documento distingue taxonomía adaptada de declaración de conformidad normativa. |
| SRC-83c9363a45a8 | Cat_logo_base__editable_.csv | Columnas SKU, cantidad, marca, código, tipo, descripción, aplicaciones, equivalencias, ubicación y notas; varias aplicaciones/equivalencias sin completar. Importación como candidato; cantidad histórica no es stock actual. |

La especificación ASTRA v1.1–v1.3 del usuario sigue siendo la base funcional. Los catálogos componentes/640FD/745FD y los manuales restantes están indexados, todavía pendientes de revisión semántica. La revisión visual delegada se interrumpió antes de producir un informe.

## Efecto sobre la implementación y siguiente fase
Conservar procedencia, PN desconocido A_CONFIRMAR, snapshots, filtros destacados y evidencia por tarea. Añadir biblioteca/candidatos antes de importar valores reales a planes. Mantener el piloto con datos sintéticos hasta contar con un conjunto revisado por activo/variante. No se copiaron los originales ni facturas al repositorio remoto.
