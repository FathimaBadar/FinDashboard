import { Component,ChangeDetectionStrategy, input } from '@angular/core';
export type CardPadding = 'none' | 'sm' | 'md';
@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:{
    class : 'block rounded-xl bg-surface border border-border  shadow-sm',
    '[class.p-5]' : "padding() === 'sm'",
    '[class.p-6]' : "padding() ==='md'"
  },
  template:`
  @if(heading()){
    <h2 class="text-base font-bold mb-2 text-text">{{ heading() }}</h2>
  }
  <ng-content />`
})
export class CardComponent {
  readonly padding = input<CardPadding>('md');
  readonly heading = input<string>('');

}
