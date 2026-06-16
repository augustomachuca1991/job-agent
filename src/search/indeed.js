// Indeed deprecated su Job Search API en mayo 2021.
// El Publisher API actual es invite-only para partners aprobados
// y solo permite embeber widgets, no extraer datos.
// No es viable como fuente programática.
// Si en el futuro cambia, este módulo es el placeholder.

export default async function searchIndeed() {
  console.warn("Indeed: API deprecated desde 2021. No disponible como fuente.");
  return [];
}
