import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { HeaderComponent } from './header.component';
import { ThemeService } from '../core/services/theme.service';

describe('HeaderComponent', () => {
  beforeEach(() => {
    // ThemeService writes to the real localStorage and the real <html> element,
    // both of which outlive a single test — reset them so test order can't
    // decide the result.
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    TestBed.configureTestingModule({
      imports: [HeaderComponent]
    });
  });

  it('creates', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the brand name and the signed-in user label', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('FinDashboard');
    expect(text).toContain('Admin');
  });

  it("renders today's date formatted as 'd MMMM y'", () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    // Derive the expected string from the same pipe/format the template uses,
    // rather than hardcoding a date string that would drift or be timezone-fragile.
    const expected = new DatePipe('en-US').transform(fixture.componentInstance.today, 'd MMMM y');

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain(expected);
  });
  it('toggles the theme when the toggle button is clicked', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[aria-label*="Switch to"]')!;

    const themeService = TestBed.inject(ThemeService);
    const before = themeService.theme();

    button.click();
    fixture.detectChanges();

    expect(themeService.theme()).not.toBe(before);
    expect(document.documentElement.classList.contains('dark')).toBe(themeService.theme() === 'dark');
  });
});
