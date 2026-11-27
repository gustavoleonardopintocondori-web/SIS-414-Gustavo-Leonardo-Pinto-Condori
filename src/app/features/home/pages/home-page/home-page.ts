import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataApiService } from '@core/services/data-api.service';

type FieldKind = 'text' | 'number' | 'date';

interface FieldDefinition {
  key: string;
  label: string;
  type?: FieldKind;
  required?: boolean;
  maxLength?: number;
  defaultValue?: string;
  placeholder?: string;
}

interface ResourceDefinition {
  id: string;
  title: string;
  endpoint: string;
  fields: FieldDefinition[];
  createPath?: string;
}

interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  resources: string[];
}

type DataRow = Record<string, unknown>;

const RESOURCES: Record<string, ResourceDefinition> = {
  'activos-fijos': {
    id: 'activos-fijos',
    title: 'Registro de Activos Fijos',
    endpoint: 'activos-fijos',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 40 },
      { key: 'descripcion', label: 'Descripción', required: true, maxLength: 180 },
      { key: 'valorAdquisicion', label: 'Valor de adquisición', type: 'number', defaultValue: '0' },
      { key: 'fechaAdquisicion', label: 'Fecha de adquisición', type: 'date' },
      { key: 'estadoId', label: 'ID de estado', type: 'number' },
      { key: 'unidadId', label: 'ID de unidad', maxLength: 30 },
    ],
  },
  transferencias: {
    id: 'transferencias',
    title: 'Transferencias',
    endpoint: 'transferencias',
    fields: [
      { key: 'activoId', label: 'ID del activo', type: 'number', required: true },
      { key: 'unidadDestino', label: 'Unidad de destino', required: true, maxLength: 80 },
      { key: 'fecha', label: 'Fecha', type: 'date' },
      { key: 'motivo', label: 'Motivo', maxLength: 180 },
    ],
  },
  revalorizaciones: {
    id: 'revalorizaciones',
    title: 'Revalorizaciones',
    endpoint: 'revalorizaciones',
    fields: [
      { key: 'activoId', label: 'ID del activo', type: 'number', required: true },
      { key: 'nuevoValor', label: 'Nuevo valor', type: 'number', required: true },
      { key: 'fecha', label: 'Fecha', type: 'date' },
      { key: 'motivo', label: 'Motivo', maxLength: 180 },
    ],
  },
  bajas: {
    id: 'bajas',
    title: 'Bajas de activos',
    endpoint: 'bajas',
    fields: [
      { key: 'activoId', label: 'ID del activo', type: 'number', required: true },
      { key: 'motivoId', label: 'ID del motivo', type: 'number', required: true },
      { key: 'fecha', label: 'Fecha', type: 'date' },
      { key: 'observacion', label: 'Observación', maxLength: 180 },
    ],
  },
  estados: {
    id: 'estados',
    title: 'Estados',
    endpoint: 'estados',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 30 },
      { key: 'descripcion', label: 'Descripción', required: true, maxLength: 120 },
    ],
  },
  meses: {
    id: 'meses',
    title: 'Meses',
    endpoint: 'meses',
    fields: [
      { key: 'numero', label: 'Número de mes', type: 'number', required: true },
      { key: 'nombre', label: 'Nombre', required: true, maxLength: 30 },
    ],
  },
  'organismos-financiadores': {
    id: 'organismos-financiadores',
    title: 'Organismos financiadores',
    endpoint: 'organismos-financiadores',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 30 },
      { key: 'nombre', label: 'Nombre', required: true, maxLength: 120 },
    ],
  },
  'motivos-baja': {
    id: 'motivos-baja',
    title: 'Motivos de baja',
    endpoint: 'motivos-baja',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 30 },
      { key: 'descripcion', label: 'Descripción', required: true, maxLength: 120 },
    ],
  },
  'grupos-contables': {
    id: 'grupos-contables',
    title: 'Grupos contables',
    endpoint: 'grupos-contables',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 30 },
      { key: 'descripcion', label: 'Descripción', required: true, maxLength: 120 },
      { key: 'vidaUtil', label: 'Vida útil (años)', type: 'number' },
    ],
  },
  auxiliares: {
    id: 'auxiliares',
    title: 'Auxiliares',
    endpoint: 'auxiliares',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 30 },
      { key: 'descripcion', label: 'Descripción', required: true, maxLength: 120 },
      { key: 'grupoId', label: 'ID del grupo contable', type: 'number' },
    ],
  },
  oficinas: {
    id: 'oficinas',
    title: 'Oficinas',
    endpoint: 'oficinas',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 30 },
      { key: 'nombre', label: 'Nombre', required: true, maxLength: 120 },
      { key: 'unidadId', label: 'ID de unidad', maxLength: 30 },
    ],
  },
  responsables: {
    id: 'responsables',
    title: 'Responsables',
    endpoint: 'responsables',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 30 },
      { key: 'nombre', label: 'Nombre', required: true, maxLength: 120 },
    ],
  },
  'org-user': {
    id: 'org-user',
    title: 'Administradores y usuarios',
    endpoint: 'org-user',
    fields: [
      { key: 'usuario', label: 'Usuario', required: true, maxLength: 60 },
      { key: 'organizacion', label: 'Organización', required: true, maxLength: 100 },
      { key: 'rol', label: 'Rol', maxLength: 60 },
    ],
  },
  entidades: {
    id: 'entidades',
    title: 'Entidades',
    endpoint: 'entidades',
    fields: [
      { key: 'codigo', label: 'Código', required: true, maxLength: 4 },
      { key: 'nombre', label: 'Nombre', required: true, maxLength: 120 },
    ],
  },
  respaldos: {
    id: 'respaldos',
    title: 'Respaldos de base de datos',
    endpoint: 'respaldos',
    createPath: 'respaldos/respaldar',
    fields: [{ key: 'nombre', label: 'Nombre del respaldo', required: true, maxLength: 100 }],
  },
  'unidades-admin': {
    id: 'unidades-admin',
    title: 'Administrar unidades',
    endpoint: 'unidades-admin',
    fields: [
      { key: 'ENTIDAD', label: 'ENTIDAD', required: true, maxLength: 4 },
      { key: 'UNIDAD', label: 'UNIDAD', required: true, maxLength: 5 },
      { key: 'DESCRIP', label: 'Descripción', maxLength: 120 },
      { key: 'CIUDAD', label: 'Ciudad', maxLength: 20 },
      { key: 'ESTADOUNI', label: 'Estado (0–9)', type: 'number', required: true, defaultValue: '1' },
    ],
  },
};

const MODULES: ModuleDefinition[] = [
  {
    id: 'activos-fijos',
    title: 'Activos Fijos',
    description: 'Consulta y administración del inventario de activos, sus movimientos y catálogos relacionados.',
    resources: ['activos-fijos', 'transferencias', 'revalorizaciones', 'bajas', 'estados', 'meses', 'organismos-financiadores', 'motivos-baja'],
  },
  {
    id: 'grupos-y-auxiliares',
    title: 'Grupos y Auxiliares',
    description: 'Mantenimiento de grupos contables y sus auxiliares.',
    resources: ['grupos-contables', 'auxiliares'],
  },
  {
    id: 'oficinas-y-responsables',
    title: 'Oficinas y Responsables',
    description: 'Administración de oficinas y personas responsables.',
    resources: ['oficinas', 'responsables'],
  },
  {
    id: 'reportes',
    title: 'Generar Reportes',
    description: 'Consulta resumida del inventario y exportación de los datos disponibles.',
    resources: [],
  },
  {
    id: 'administradores',
    title: 'Administradores',
    description: 'Administración de usuarios de demostración y entidades.',
    resources: ['org-user', 'entidades'],
  },
  {
    id: 'respaldos',
    title: 'Respaldos BD',
    description: 'Creación, consulta, exportación y eliminación de respaldos de demostración.',
    resources: ['respaldos'],
  },
  {
    id: 'unidades-admin',
    title: 'Administrar Unidad',
    description: 'Mantenimiento de las unidades administrativas registradas.',
    resources: ['unidades-admin'],
  },
  {
    id: 'localizacion',
    title: 'Localización BD',
    description: 'Comprobación de conexión con el servicio de datos.',
    resources: [],
  },
];

@Component({
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(DataApiService);

  protected readonly moduleId = signal('activos-fijos');
  protected readonly resourceId = signal('activos-fijos');
  protected readonly records = signal<DataRow[]>([]);
  protected readonly currentAsset = signal<DataRow | null>(null);
  protected readonly reportAssets = signal<DataRow[]>([]);
  protected readonly busy = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly searchText = signal('');
  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<string | number | null>(null);
  protected readonly formData = signal<Record<string, string>>({});
  protected readonly health = signal<{ status: string; modo: string } | null>(null);

  protected readonly currentModule = computed(
    () => MODULES.find((item) => item.id === this.moduleId()) ?? MODULES[0],
  );
  protected readonly resourceTabs = computed(() =>
    this.currentModule().resources.map((id) => RESOURCES[id]),
  );
  protected readonly currentResource = computed(() => RESOURCES[this.resourceId()] ?? null);
  protected readonly filteredRecords = computed(() => {
    const query = this.searchText().trim().toLocaleLowerCase();
    if (!query) return this.records();
    return this.records().filter((row) =>
      Object.values(row).some((value) => String(value ?? '').toLocaleLowerCase().includes(query)),
    );
  });
  protected readonly reportTotal = computed(() =>
    this.reportAssets().reduce((sum, row) => sum + Number(row['valorAdquisicion'] ?? 0), 0),
  );

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const nextModule = params.get('modulo') ?? 'activos-fijos';
      this.moduleId.set(nextModule);
      this.searchText.set('');
      this.error.set(null);
      this.success.set(null);

      if (nextModule === 'reportes') {
        this.loadReport();
        return;
      }
      if (nextModule === 'localizacion') {
        this.checkConnection();
        return;
      }

      const module = MODULES.find((item) => item.id === nextModule) ?? MODULES[0];
      const firstResource = module.resources[0] ?? 'activos-fijos';
      this.resourceId.set(firstResource);
      this.load();
    });
  }

  protected selectResource(id: string): void {
    this.resourceId.set(id);
    this.searchText.set('');
    this.success.set(null);
    this.error.set(null);
    this.load();
  }

  protected load(): void {
    const resource = this.currentResource();
    if (!resource) return;
    this.busy.set(true);
    this.error.set(null);
    this.api.list<DataRow>(resource.endpoint).subscribe({
      next: (rows) => {
        this.records.set(rows);
        if (resource.id === 'activos-fijos') {
          const selectedId = this.currentAsset()?.['id'];
          this.currentAsset.set(rows.find((row) => row['id'] === selectedId) ?? rows[0] ?? null);
        } else {
          this.currentAsset.set(null);
        }
        this.busy.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.records.set([]);
        this.busy.set(false);
        this.error.set(this.describeError(err));
      },
    });
  }

  protected refresh(): void {
    if (this.moduleId() === 'reportes') {
      this.loadReport();
    } else if (this.moduleId() === 'localizacion') {
      this.checkConnection();
    } else {
      this.load();
    }
  }

  protected navigateAsset(direction: 'first' | 'previous' | 'next' | 'last'): void {
    const currentId = this.currentAsset()?.['id'];
    let path: string;
    if (direction === 'first') path = 'activos-fijos/primero';
    else if (direction === 'last') path = 'activos-fijos/ultimo';
    else {
      if (currentId === undefined || currentId === null) {
        this.error.set('Seleccione primero un activo de la tabla.');
        return;
      }
      path = `activos-fijos/${currentId}/${direction === 'previous' ? 'anterior' : 'siguiente'}`;
    }

    this.busy.set(true);
    this.error.set(null);
    this.api.get<DataRow>(path).subscribe({
      next: (row) => {
        this.currentAsset.set(row);
        this.busy.set(false);
        this.success.set(`Activo seleccionado: ${this.getCell(row, 'codigo')}.`);
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(this.describeError(err));
      },
    });
  }

  protected showAsset(row: DataRow): void {
    const id = this.getRecordId(row);
    if (id === null) return;
    this.api.get<DataRow>(`activos-fijos/${id}/ficha`).subscribe({
      next: (asset) => {
        this.currentAsset.set(asset);
        this.success.set(`Ficha consultada: ${this.getCell(asset, 'codigo')}.`);
      },
      error: (err: HttpErrorResponse) => this.error.set(this.describeError(err)),
    });
  }

  protected isCurrentAsset(row: DataRow): boolean {
    return this.currentAsset()?.['id'] === row['id'] && row['id'] !== undefined;
  }

  protected openNew(): void {
    const resource = this.currentResource();
    if (!resource) return;
    const initial: Record<string, string> = {};
    for (const field of resource.fields) {
      initial[field.key] = field.defaultValue ?? '';
    }
    this.formData.set(initial);
    this.editingId.set(null);
    this.error.set(null);
    this.modalOpen.set(true);
  }

  protected openEdit(row: DataRow): void {
    const resource = this.currentResource();
    if (!resource) return;
    const initial: Record<string, string> = {};
    for (const field of resource.fields) {
      const value = row[field.key];
      initial[field.key] = value === null || value === undefined ? '' : String(value).slice(0, field.type === 'date' ? 10 : undefined);
    }
    this.formData.set(initial);
    this.editingId.set(this.getRecordId(row));
    this.error.set(null);
    this.modalOpen.set(true);
  }

  protected setField(key: string, value: string): void {
    this.formData.update((current) => ({ ...current, [key]: value }));
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
  }

  protected save(): void {
    const resource = this.currentResource();
    if (!resource || this.saving()) return;

    const values = this.formData();
    const missing = resource.fields
      .filter((field) => field.required && !String(values[field.key] ?? '').trim())
      .map((field) => field.label);
    if (missing.length) {
      this.error.set(`Complete los campos obligatorios: ${missing.join(', ')}.`);
      return;
    }

    const payload: Record<string, unknown> = {};
    for (const field of resource.fields) {
      const raw = String(values[field.key] ?? '').trim();
      if (!raw) continue;
      payload[field.key] = field.type === 'number' ? Number(raw) : raw;
    }

    this.saving.set(true);
    this.error.set(null);
    const id = this.editingId();
    const request = id === null
      ? (resource.createPath
          ? this.api.createAt<DataRow>(resource.createPath, payload)
          : this.api.create<DataRow>(resource.endpoint, payload))
      : this.api.update<DataRow>(resource.endpoint, id, payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.success.set(id === null ? 'Registro guardado correctamente.' : 'Registro actualizado correctamente.');
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(this.describeError(err));
      },
    });
  }

  protected deleteRecord(row: DataRow): void {
    const resource = this.currentResource();
    const id = this.getRecordId(row);
    if (!resource || id === null || id === '') return;
    if (!window.confirm(`¿Está seguro de eliminar el registro ${id}?`)) return;

    this.busy.set(true);
    this.error.set(null);
    this.api.remove(resource.endpoint, id).subscribe({
      next: () => {
        this.busy.set(false);
        this.success.set('Registro eliminado correctamente.');
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(this.describeError(err));
      },
    });
  }

  protected exportTable(): void {
    const resource = this.currentResource();
    if (!resource) return;
    const headings = ['ID', ...resource.fields.map((field) => field.label)];
    const rows = this.filteredRecords().map((row) => [
      this.getRecordId(row),
      ...resource.fields.map((field) => row[field.key] ?? ''),
    ]);
    this.downloadCsv(`${resource.id}.csv`, headings, rows);
  }

  protected exportBackup(row: DataRow): void {
    const id = this.getRecordId(row);
    if (id === null || id === '') return;
    this.api.post<DataRow>(`respaldos/${id}/copiar-a`).subscribe({
      next: (backup) => {
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        this.downloadBlob(`respaldo-${id}.json`, blob);
        this.success.set('Respaldo exportado en formato JSON.');
      },
      error: (err: HttpErrorResponse) => this.error.set(this.describeError(err)),
    });
  }

  protected loadReport(): void {
    this.busy.set(true);
    this.error.set(null);
    this.api.list<DataRow>('activos-fijos').subscribe({
      next: (rows) => {
        this.reportAssets.set(rows);
        this.busy.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.reportAssets.set([]);
        this.busy.set(false);
        this.error.set(this.describeError(err));
      },
    });
  }

  protected exportReport(): void {
    const rows = this.reportAssets();
    const headings = ['ID', 'Código', 'Descripción', 'Valor de adquisición', 'Fecha de adquisición', 'Estado', 'Unidad'];
    const data = rows.map((row) => [
      row['id'] ?? '',
      row['codigo'] ?? '',
      row['descripcion'] ?? '',
      row['valorAdquisicion'] ?? '',
      row['fechaAdquisicion'] ?? '',
      row['estadoId'] ?? '',
      row['unidadId'] ?? '',
    ]);
    this.downloadCsv('reporte-activos-fijos.csv', headings, data);
  }

  protected checkConnection(): void {
    this.busy.set(true);
    this.error.set(null);
    this.health.set(null);
    this.api.health().subscribe({
      next: (status) => {
        this.health.set(status);
        this.busy.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(this.describeError(err));
      },
    });
  }

  protected getRecordId(row: DataRow): string | number | null {
    if (row['id'] !== undefined && row['id'] !== null) {
      return row['id'] as string | number;
    }
    if (row['ENTIDAD'] !== undefined && row['UNIDAD'] !== undefined) {
      return `${row['ENTIDAD']}~${row['UNIDAD']}`;
    }
    return null;
  }

  protected getCell(row: DataRow, key: string): string {
    const value = row[key];
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  protected getResourceTitle(id: string): string {
    return RESOURCES[id]?.title ?? id;
  }

  protected printReport(): void {
    window.print();
  }

  private describeError(error: HttpErrorResponse): string {
    const body = error.error as { mensaje?: string; error?: string } | null;
    if (body?.mensaje) return body.mensaje;
    if (body?.error) return body.error;
    if (error.status === 0) return 'No se pudo conectar con la API. Compruebe que el servicio esté disponible.';
    if (error.status === 401) return 'La sesión venció. Salga e ingrese nuevamente.';
    return `No se pudo completar la operación (HTTP ${error.status}).`;
  }

  private downloadCsv(filename: string, headings: unknown[], rows: unknown[][]): void {
    const escape = (value: unknown) => {
      const text = String(value ?? '');
      return `"${text.replace(/"/g, '""')}"`;
    };
    const csv = [headings, ...rows].map((row) => row.map(escape).join(';')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    this.downloadBlob(filename, blob);
  }

  private downloadBlob(filename: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
