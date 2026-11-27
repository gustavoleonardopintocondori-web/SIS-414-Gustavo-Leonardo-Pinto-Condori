import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  it('should not submit empty form', async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector<HTMLButtonElement>('button')!.click();
    expect(fixture.componentInstance['form'].invalid).toBe(true);
    expect(el.textContent).toContain('INGRESE SU IDENTIFICACION');
  });
});
