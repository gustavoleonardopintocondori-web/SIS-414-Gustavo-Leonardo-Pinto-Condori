import { TestBed } from '@angular/core/testing';
import { HomePage } from './home-page';

describe('HomePage', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [HomePage] }).compileComponents();
    expect(TestBed.createComponent(HomePage).componentInstance).toBeTruthy();
  });
});
