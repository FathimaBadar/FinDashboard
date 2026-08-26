import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(() => {
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
});
