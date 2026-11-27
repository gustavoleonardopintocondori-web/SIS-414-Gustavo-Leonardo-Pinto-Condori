export interface Session {
  usuario: string;
  backups: string;
  entidad: { codigo: string; nombre: string } | null;
  unidad: { codigo: string; nombre: string } | null;
}
