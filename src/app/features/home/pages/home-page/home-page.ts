import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';

type FieldType = 'text' | 'number' | 'date' | 'password' | 'textarea' | 'checkbox';
type Row = Record<string, any>;

interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  full?: boolean;
}

interface ColumnDef {
  key: string;
  label: string;
}

interface ResourceDef {
  title: string;
  endpoint: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  readOnly?: boolean;
}

interface ModuleDef {
  key: string;
  title: string;
  subtitle: string;
  resources: string[];
}

const f = (key: string, label: string, type: FieldType = 'text', required = false, full = false): FieldDef =>
  ({ key, label, type, required, full });

const c = (key: string, label: string): ColumnDef => ({ key, label });

const RESOURCES: Record<string, ResourceDef> = {
  'activos-fijos': {
    title: 'Activos fijos',
    endpoint: 'activos-fijos',
    columns: [c('codigo', 'Código'), c('descripcion', 'Descripción'), c('valorAdquisicion', 'Valor de adquisición'), c('fechaAdquisicion', 'Fecha'), c('estadoId', 'Estado'), c('unidadId', 'Unidad')],
    fields: [f('codigo', 'Código del activo', 'text', true), f('descripcion', 'Descripción', 'text', true), f('valorAdquisicion', 'Valor de adquisición', 'number'), f('fechaAdquisicion', 'Fecha de adquisición', 'date'), f('estadoId', 'Código de estado', 'number'), f('unidadId', 'Unidad administrativa')],
  },
  'auxiliares': {
    title: 'Auxiliares',
    endpoint: 'auxiliares',
    columns: [c('codigo', 'Código'), c('descripcion', 'Descripción'), c('grupoId', 'Grupo contable')],
    fields: [f('codigo', 'Código', 'text', true), f('descripcion', 'Descripción', 'text', true), f('grupoId', 'ID de grupo', 'number')],
  },
  'bajas': {
    title: 'Bajas de activos',
    endpoint: 'bajas',
    columns: [c('activoId', 'Activo'), c('motivoId', 'Motivo'), c('fecha', 'Fecha'), c('observacion', 'Observación')],
    fields: [f('activoId', 'ID del activo', 'number', true), f('motivoId', 'ID del motivo', 'number', true), f('fecha', 'Fecha de baja', 'date'), f('observacion', 'Observación', 'textarea', false, true)],
  },
  'configuraciones': {
    title: 'Configuraciones',
    endpoint: 'configuraciones',
    columns: [c('entidad', 'Entidad'), c('descEnt', 'Descripción entidad'), c('unidad', 'Unidad'), c('descUni', 'Descripción unidad'), c('usuario', 'Usuario')],
    fields: [f('entidad', 'Código de entidad', 'text', true), f('descEnt', 'Descripción de entidad'), f('unidad', 'Código de unidad', 'text', true), f('descUni', 'Descripción de unidad'), f('usuario', 'Usuario')],
  },
  'cuentas-partidas': {
    title: 'Cuentas y partidas',
    endpoint: 'cuentas-partidas',
    columns: [c('codCont', 'Grupo contable'), c('partida', 'Partida'), c('gestion', 'Gestión')],
    fields: [f('codCont', 'Código contable', 'number', true), f('partida', 'Partida', 'text', true), f('gestion', 'Gestión', 'number', true)],
  },
  'data': {
    title: 'Datos auxiliares del sistema',
    endpoint: 'data',
    columns: [c('data', 'Dato')],
    fields: [f('data', 'Dato', 'textarea', true, true)],
  },
  'departamentos': {
    title: 'Departamentos',
    endpoint: 'departamentos',
    columns: [c('codigo', 'Código'), c('descripcion', 'Descripción'), c('sigla', 'Sigla')],
    fields: [f('codigo', 'Código', 'number', true), f('descripcion', 'Descripción', 'text', true), f('sigla', 'Sigla')],
  },
  'entidades': {
    title: 'Entidades',
    endpoint: 'entidades',
    columns: [c('codigo', 'Código'), c('nombre', 'Nombre')],
    fields: [f('codigo', 'Código', 'text', true), f('nombre', 'Nombre', 'text', true)],
  },
  'estados': {
    title: 'Estados de activos',
    endpoint: 'estados',
    columns: [c('codigo', 'Código'), c('descripcion', 'Descripción')],
    fields: [f('codigo', 'Código', 'text', true), f('descripcion', 'Descripción', 'text', true)],
  },
  'estructuras-entidad': {
    title: 'Estructura de entidad',
    endpoint: 'estructuras-entidad',
    columns: [c('gestion', 'Gestión'), c('sectorEnt', 'Sector'), c('subsecEnt', 'Subsector'), c('desEstruc', 'Descripción'), c('siglaEstru', 'Sigla')],
    fields: [f('gestion', 'Gestión', 'number', true), f('sectorEnt', 'Sector', 'number', true), f('subsecEnt', 'Subsector', 'number', true), f('areaEnt', 'Área', 'number', true), f('subareaEnt', 'Subárea', 'number', true), f('nivelInst', 'Nivel institucional', 'number', true), f('desEstruc', 'Descripción', 'text', true), f('siglaEstru', 'Sigla'), f('apropiable', 'Apropiable')],
  },
  'grupos-contables': {
    title: 'Grupos contables',
    endpoint: 'grupos-contables',
    columns: [c('codigo', 'Código'), c('descripcion', 'Descripción'), c('vidaUtil', 'Vida útil')],
    fields: [f('codigo', 'Código', 'text', true), f('descripcion', 'Descripción', 'text', true), f('vidaUtil', 'Vida útil (años)', 'number'), f('observ', 'Observaciones', 'textarea', false, true), f('depreciar', 'Depreciar', 'checkbox'), f('actualizar', 'Actualizar', 'checkbox')],
  },
  'meses': {
    title: 'Meses',
    endpoint: 'meses',
    columns: [c('numero', 'Número'), c('nombre', 'Nombre')],
    fields: [f('numero', 'Número de mes', 'number', true), f('nombre', 'Nombre', 'text', true)],
  },
  'motivos-baja': {
    title: 'Motivos de baja',
    endpoint: 'motivos-baja',
    columns: [c('codigo', 'Código'), c('descripcion', 'Descripción')],
    fields: [f('codigo', 'Código', 'text', true), f('descripcion', 'Descripción', 'text', true)],
  },
  'objetos-gasto': {
    title: 'Objetos de gasto',
    endpoint: 'objetos-gasto',
    columns: [c('gestion', 'Gestión'), c('partida', 'Partida'), c('descrip', 'Descripción')],
    fields: [f('gestion', 'Gestión', 'number', true), f('partida', 'Partida', 'text', true), f('descrip', 'Descripción', 'text', true)],
  },
  'oficinas': {
    title: 'Oficinas',
    endpoint: 'oficinas',
    columns: [c('codigo', 'Código'), c('nombre', 'Nombre'), c('unidadId', 'Unidad')],
    fields: [f('codigo', 'Código', 'text', true), f('nombre', 'Nombre de oficina', 'text', true), f('unidadId', 'Unidad administrativa')],
  },
  'org-user': {
    title: 'Usuarios por organización',
    endpoint: 'org-user',
    columns: [c('usuario', 'Usuario'), c('organizacion', 'Organización'), c('rol', 'Rol')],
    fields: [f('usuario', 'Usuario', 'text', true), f('organizacion', 'Organización', 'text', true), f('rol', 'Rol')],
  },
  'organismos-financiadores': {
    title: 'Organismos financiadores',
    endpoint: 'organismos-financiadores',
    columns: [c('codigo', 'Código'), c('nombre', 'Nombre')],
    fields: [f('codigo', 'Código', 'text', true), f('nombre', 'Nombre', 'text', true)],
  },
  'reportes': {
    title: 'Reportes guardados',
    endpoint: 'reportes',
    columns: [c('reportName', 'Nombre del reporte'), c('contents', 'Contenido'), c('modType', 'Módulo'), c('notes', 'Notas')],
    fields: [f('reportName', 'Nombre del reporte', 'text', true), f('contents', 'Contenido / definición'), f('modType', 'Tipo de módulo', 'text', true), f('notes', 'Notas', 'textarea', false, true)],
  },
  'respaldos': {
    title: 'Respaldos de base de datos',
    endpoint: 'respaldos',
    columns: [c('nombre', 'Nombre'), c('fecha', 'Fecha'), c('id', 'Identificador')],
    fields: [f('nombre', 'Nombre del respaldo', 'text', true)],
  },
  'responsables': {
    title: 'Responsables',
    endpoint: 'responsables',
    columns: [c('codigo', 'Código'), c('nombre', 'Nombre'), c('cargo', 'Cargo'), c('ci', 'C.I.')],
    fields: [f('codigo', 'Código', 'text', true), f('nombre', 'Nombre completo', 'text', true), f('cargo', 'Cargo'), f('ci', 'Cédula de identidad'), f('oficinaId', 'ID de oficina', 'number')],
  },
  'revalorizaciones': {
    title: 'Revalorizaciones',
    endpoint: 'revalorizaciones',
    columns: [c('activoId', 'Activo'), c('nuevoValor', 'Nuevo valor'), c('fecha', 'Fecha'), c('motivo', 'Motivo')],
    fields: [f('activoId', 'ID del activo', 'number', true), f('nuevoValor', 'Nuevo valor', 'number', true), f('fecha', 'Fecha', 'date'), f('motivo', 'Motivo', 'textarea', false, true)],
  },
  'transferencias': {
    title: 'Transferencias',
    endpoint: 'transferencias',
    columns: [c('activoId', 'Activo'), c('unidadDestino', 'Unidad destino'), c('fecha', 'Fecha'), c('motivo', 'Motivo')],
    fields: [f('activoId', 'ID del activo', 'number', true), f('unidadDestino', 'Unidad de destino', 'text', true), f('fecha', 'Fecha', 'date'), f('motivo', 'Motivo', 'textarea', false, true)],
  },
  'unidades-admin': {
    title: 'Unidades administrativas',
    endpoint: 'unidades-admin',
    columns: [c('ENTIDAD', 'Entidad'), c('UNIDAD', 'Unidad'), c('DESCRIP', 'Descripción'), c('CIUDAD', 'Ciudad'), c('ESTADOUNI', 'Estado')],
    fields: [f('ENTIDAD', 'Código de entidad (máx. 4)', 'text', true), f('UNIDAD', 'Código de unidad (máx. 5)', 'text', true), f('DESCRIP', 'Descripción (máx. 120)'), f('CIUDAD', 'Ciudad (máx. 20)'), f('ESTADOUNI', 'Estado (0 a 9)', 'number', true)],
  },
  'usuarios': {
    title: 'Usuarios del sistema',
    endpoint: 'usuarios',
    columns: [c('usuario', 'Usuario'), c('completo', 'Nombre completo'), c('des', 'Descripción'), c('grupo', 'Grupo'), c('tipo', 'Tipo')],
    fields: [f('usuario', 'Usuario', 'text', true), f('completo', 'Nombre completo', 'text', true), f('des', 'Descripción'), f('psw', 'Contraseña', 'password'), f('tipo', 'Tipo de usuario', 'checkbox'), f('grupo', 'Grupo'), f('usuar', 'Usuario de modificación')],
  },
  'localizacion-bd': {
    title: 'Localización de base de datos',
    endpoint: 'localizacion-bd',
    columns: [c('motor', 'Motor'), c('estado', 'Estado'), c('persistencia', 'Persistencia'), c('url', 'Servicio')],
    fields: [],
    readOnly: true,
  },
  'generar-reportes': {
    title: 'Generación de reportes',
    endpoint: 'generar-reportes',
    columns: [c('recurso', 'Módulo'), c('titulo', 'Título'), c('generadoEn', 'Fecha de generación'), c('registros', 'Registros')],
    fields: [f('recurso', 'Módulo', 'text', true), f('titulo', 'Título', 'text', true), f('observacion', 'Observación', 'textarea', false, true)],
  },
};

const MODULES: ModuleDef[] = [
  { key: 'activos', title: 'Activos fijos', subtitle: 'Registro, consulta y movimientos de bienes institucionales.', resources: ['activos-fijos', 'transferencias', 'revalorizaciones', 'bajas', 'estados', 'meses', 'motivos-baja', 'organismos-financiadores'] },
  { key: 'grupos', title: 'Grupos y auxiliares', subtitle: 'Catálogos contables y clasificación de activos.', resources: ['grupos-contables', 'auxiliares', 'cuentas-partidas', 'objetos-gasto'] },
  { key: 'oficinas', title: 'Oficinas y responsables', subtitle: 'Administración de oficinas, responsables y departamentos.', resources: ['oficinas', 'responsables', 'departamentos'] },
  { key: 'reportes', title: 'Generar reportes', subtitle: 'Consulta de reportes guardados y exportación de resultados.', resources: ['reportes', 'generar-reportes'] },
  { key: 'administradores', title: 'Administradores', subtitle: 'Usuarios del sistema y asignaciones por organización.', resources: ['usuarios', 'org-user'] },
  { key: 'respaldos', title: 'Respaldos de base de datos', subtitle: 'Creación, consulta y exportación de respaldos de demostración.', resources: ['respaldos'] },
  { key: 'unidad', title: 'Administrar unidad', subtitle: 'Entidades, unidades administrativas y su estructura.', resources: ['unidades-admin', 'entidades', 'estructuras-entidad', 'configuraciones'] },
  { key: 'localizacion', title: 'Localización BD', subtitle: 'Estado del servicio y datos de conexión de la demostración.', resources: ['localizacion-bd', 'data'] },
];

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiBase = inject(API_BASE_URL).replace(/\/+$/, '');

  protected readonly resources = RESOURCES;
  protected readonly modules = MODULES;
  protected readonly moduleKey = signal('activos');
  protected readonly activeResource = signal('activos-fijos');
  protected readonly rows = signal<Row[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly searchText = signal('');
  protected readonly formValues = signal<Row>({});
  protected readonly formOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly visibleRows = computed(() => {
    const query = this.searchText().trim().toLocaleLowerCase();
    const columns = this.currentResource.columns;
    if (!query) return this.rows();
    return this.rows().filter((row) =>
      columns.some((column) => this.formatValue(row[column.key], column.key).toLocaleLowerCase().includes(query)),
    );
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const key = params.get('module') ?? 'activos';
      const module = MODULES.find((item) => item.key === key) ?? MODULES[0];
      this.moduleKey.set(module.key);
      this.selectResource(module.resources[0]);
    });
  }

  protected get currentModule(): ModuleDef {
    return MODULES.find((item) => item.key === this.moduleKey()) ?? MODULES[0];
  }

  protected get currentResource(): ResourceDef {
    return RESOURCES[this.activeResource()] ?? RESOURCES['activos-fijos'];
  }

  protected get selectedRecord(): Row | null {
    const id = this.selectedId();
    return id === null ? null : this.rows().find((row) => this.getId(row) === id) ?? null;
  }

  protected get selectedIndex(): number {
    const id = this.selectedId();
    return id === null ? -1 : this.visibleRows().findIndex((row) => this.getId(row) === id);
  }

  protected selectResource(key: string): void {
    if (!RESOURCES[key]) return;
    this.activeResource.set(key);
    this.selectedId.set(null);
    this.searchText.set('');
    this.formOpen.set(false);
    this.editingId.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.load();
  }

  protected load(): void {
    const def = this.currentResource;
    this.loading.set(true);
    this.errorMessage.set('');
    this.http.get<Row[]>(`${this.apiBase}/${def.endpoint}`).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (data) => {
        this.rows.set(Array.isArray(data) ? data : []);
        this.selectedId.set(null);
      },
      error: (error) => {
        this.rows.set([]);
        this.errorMessage.set(this.readError(error, `No se pudo consultar ${def.title}.`));
      },
    });
  }

  protected selectRow(row: Row): void {
    this.selectedId.set(this.getId(row));
  }

  protected editRow(row: Row): void {
    this.selectRow(row);
    this.editSelected();
  }

  protected newRecord(): void {
    if (this.currentResource.readOnly) return;
    const initial: Row = {};
    for (const field of this.currentResource.fields) initial[field.key] = field.type === 'checkbox' ? false : '';
    this.formValues.set(initial);
    this.editingId.set(null);
    this.formOpen.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected editSelected(): void {
    const row = this.selectedRecord;
    if (!row || this.currentResource.readOnly) return;
    const values: Row = {};
    for (const field of this.currentResource.fields) {
      values[field.key] = field.key === 'psw' ? '' : (row[field.key] ?? (field.type === 'checkbox' ? false : ''));
    }
    this.formValues.set(values);
    this.editingId.set(this.getId(row));
    this.formOpen.set(true);
    this.errorMessage.set('');
  }

  protected setField(key: string, value: unknown): void {
    this.formValues.update((current) => ({ ...current, [key]: value }));
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingId.set(null);
  }

  protected save(): void {
    const def = this.currentResource;
    if (def.readOnly) return;
    const payload: Row = { ...this.formValues() };
    if (this.activeResource() === 'usuarios' && !payload['psw']) delete payload['psw'];
    const id = this.editingId();
    const url = `${this.apiBase}/${def.endpoint}${id === null ? '' : `/${encodeURIComponent(id)}`}`;
    this.saving.set(true);
    this.errorMessage.set('');
    const request = id === null
      ? this.http.post<Row>(url, payload)
      : this.http.put<Row>(url, payload);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.closeForm();
        this.successMessage.set(id === null ? 'Registro guardado correctamente.' : 'Registro actualizado correctamente.');
        this.load();
      },
      error: (error) => this.errorMessage.set(this.readError(error, 'No se pudo guardar el registro.')),
    });
  }

  protected deleteSelected(): void {
    const row = this.selectedRecord;
    if (!row || this.currentResource.readOnly) return;
    if (!window.confirm('¿Está seguro de eliminar el registro seleccionado?')) return;
    const id = this.getId(row);
    this.http.delete(`${this.apiBase}/${this.currentResource.endpoint}/${encodeURIComponent(id)}`).subscribe({
      next: () => {
        this.successMessage.set('Registro eliminado.');
        this.load();
      },
      error: (error) => this.errorMessage.set(this.readError(error, 'No se pudo eliminar el registro.')),
    });
  }

  protected moveSelection(direction: 'first' | 'previous' | 'next' | 'last'): void {
    const list = this.visibleRows();
    if (!list.length) return;
    let index = this.selectedIndex;
    if (direction === 'first') index = 0;
    else if (direction === 'last') index = list.length - 1;
    else if (direction === 'previous') index = Math.max(0, index <= 0 ? 0 : index - 1);
    else index = Math.min(list.length - 1, index < 0 ? 0 : index + 1);
    this.selectRow(list[index]);
  }

  protected createBackup(): void {
    const name = `Respaldo ${new Date().toLocaleString()}`;
    this.http.post(`${this.apiBase}/respaldos/respaldar`, { nombre: name }).subscribe({
      next: () => {
        this.successMessage.set('Respaldo de demostración creado.');
        this.selectResource('respaldos');
      },
      error: (error) => this.errorMessage.set(this.readError(error, 'No se pudo crear el respaldo.')),
    });
  }

  protected exportBackup(): void {
    const row = this.selectedRecord;
    if (!row) return;
    const id = this.getId(row);
    this.http.post(`${this.apiBase}/respaldos/${encodeURIComponent(id)}/copiar-a`, {}).subscribe({
      next: (data) => this.downloadJson(data, `respaldo-${id}.json`),
      error: (error) => this.errorMessage.set(this.readError(error, 'No se pudo exportar el respaldo.')),
    });
  }

  protected generateReport(): void {
    const resource = this.activeResource();
    const title = this.currentResource.title;
    this.http.post(`${this.apiBase}/generar-reportes`, {
      recurso: resource,
      titulo: title,
      generadoEn: new Date().toISOString(),
      registros: this.visibleRows().length,
    }).subscribe({
      next: () => {
        this.successMessage.set('Informe generado y exportado.');
        this.exportCsv();
      },
      error: (error) => this.errorMessage.set(this.readError(error, 'No se pudo registrar la generación del informe.')),
    });
  }

  protected exportCsv(): void {
    const columns = this.currentResource.columns;
    const data = this.visibleRows();
    const lines = [
      columns.map((column) => this.csvCell(column.label)).join(';'),
      ...data.map((row) => columns.map((column) => this.csvCell(this.formatValue(row[column.key], column.key))).join(';')),
    ];
    this.download(new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' }), `${this.activeResource()}-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  protected printTable(): void {
    window.print();
  }

  protected getId(row: Row): string {
    if (row['id'] !== undefined && row['id'] !== null) return String(row['id']);
    if (row['archivo']) return String(row['archivo']);
    if (row['usuario']) return String(row['usuario']);
    if (row['ENTIDAD'] !== undefined && row['UNIDAD'] !== undefined) return `${row['ENTIDAD']}~${row['UNIDAD']}`;
    return '';
  }

  protected formatValue(value: unknown, key = ''): string {
    if (value === null || value === undefined || value === '') return '—';
    if (key === 'psw') return '••••••';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  protected isSelected(row: Row): boolean {
    return this.selectedId() === this.getId(row);
  }

  private csvCell(value: unknown): string {
    const text = String(value ?? '').replace(/"/g, '""');
    return `"${text}"`;
  }

  private downloadJson(data: unknown, filename: string): void {
    this.download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename);
  }

  private download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private readError(error: any, fallback: string): string {
    return error?.error?.mensaje || error?.error?.message || error?.message || fallback;
  }
}
