import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AboutDialog } from './about-dialog/about-dialog';

interface MenuItem {
  label: string;
  mnemonic: number;
  slug?: string;
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
    '1.PNG',
    '2.PNG',
    '3.PNG',
    '4.PNG',
    '5.PNG',
    '6.png',
    '7.PNG',
    '8.PNG',
    '9.PNG',
  ];

  protected readonly headerBackground = `url('assets/images/barravsiaf.jpg')`;

  protected readonly background = `url('assets/images/themes/${
    Layout.THEMES[Math.floor(Math.random() * Layout.THEMES.length)]
  }')`;

  protected readonly menu: MenuItem[] = [
    { label: 'Activos Fijos', mnemonic: 0, slug: 'activos' },
    { label: 'Grupos y Auxiliares', mnemonic: 0, slug: 'grupos' },
    { label: 'Oficinas y Responsables', mnemonic: 0, slug: 'oficinas' },
    { label: 'Generar Reportes', mnemonic: 8, slug: 'reportes' },
    { label: 'Administradores', mnemonic: 1, slug: 'administradores' },
    { label: 'Iniciar sesión', mnemonic: 0, action: 'logout' },
    { label: 'Respaldos BD', mnemonic: 10, slug: 'respaldos' },
    { label: 'Administrar Unidad', mnemonic: 1, slug: 'unidad' },
    { label: 'Localizacion BD', mnemonic: 0, slug: 'localizacion' },
  ];

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected select(item: MenuItem): void {
    if (item.action === 'logout') {
      this.logout();
      return;
    }
    this.active.set(item.label);
    this.sidebarOpen.set(false);
    this.router.navigateByUrl(`/home?module=${item.slug ?? 'activos'}`);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
