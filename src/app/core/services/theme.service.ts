import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'finDashboard-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor(){
    effect(() =>{
      const theme = this.theme();
      this.document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem(THEME_KEY, theme);


    });
  }
  toggle():void{
    this.theme.update((current: Theme) => (current === 'light' ? 'dark' : 'light'));
  }

  private getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if(storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    // Optional-call matchMedia too, not just defaultView: environments without a
    // full browser API surface (jsdom, SSR shims) have a window but no matchMedia,
    // and this runs in a field initializer — throwing here would break DI entirely.
    return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
