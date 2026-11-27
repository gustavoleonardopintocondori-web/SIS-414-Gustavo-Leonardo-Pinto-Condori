import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AboutDialog } from './about-dialog/about-dialog';

interface MenuItem {
  label: string;
  /** Índice de la letra subrayada (atajo). */
  mnemonic: number;
  module?: string;
  action?: 'logout';
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, AboutDialog],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly session = this.auth.session;
  protected readonly sidebarOpen = signal(false);
  protected readonly aboutOpen = signal(false);
  protected readonly active = signal<string | null>('Activos Fijos');

  private static readonly THEMES = [
    '1.PNG', '2.PNG', '3.PNG', '4.PNG', '5.PNG',
    '6.png', '7.PNG', '8.PNG', '9.PNG',
  ];

  protected readonly headerBackground = `url('assets/images/barravsiaf.jpg')`;
  protected readonly background = `url('assets/images/themes/${Layout.THEMES[Math.floor(Math.random() * Layout.THEMES.length)]}')`;

  protected readonly menu: MenuItem[] = [
    { label: 'Activos Fijos', mnemonic: 0, module: 'activos-fijos' },
    { label: 'Grupos y Auxiliares', mnemonic: 0, module: 'grupos-y-auxiliares' },
    { label: 'Oficinas y Responsables', mnemonic: 0, module: 'oficinas-y-responsables' },
    { label: 'Generar Reportes', mnemonic: 8, module: 'reportes' },
    { label: 'Administradores', mnemonic: 1, module: 'administradores' },
    { label: 'Iniciar sesión', mnemonic: 0, action: 'logout' },
    { label: 'Respaldos BD', mnemonic: 10, module: 'respaldos' },
    { label: 'Administrar Unidad', mnemonic: 1, module: 'unidades-admin' },
    { label: 'Localizacion BD', mnemonic: 0, module: 'localizacion' },
  ];

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected select(item: MenuItem): void {
    if (item.action === 'logout') {
      this.logout();
      return;
    }
    if (!item.module) return;
    this.active.set(item.label);
    this.sidebarOpen.set(false);
    void this.router.navigate(['/home'], { queryParams: { modulo: item.module } });
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
