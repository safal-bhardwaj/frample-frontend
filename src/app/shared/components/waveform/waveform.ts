import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-waveform',
  standalone: true,
  templateUrl: './waveform.html',
  styleUrl: './waveform.css'
})
export class Waveform {
  peaks = input<number[]>([]);
  progress = input(0);      // 0..1
  active = input(false);    // no longer affects color, kept so the dashboard template doesn't need editing
  seek = output<number>();  // 0..1

  // Samples uploaded before waveforms existed have no peaks, so show flat placeholder bars
  bars = computed(() => (this.peaks().length ? this.peaks() : Array(100).fill(8)));

  // Hides the green layer's right-hand side; the visible part grows as progress increases
  clipPath = computed(() => {
    const p = Math.min(1, Math.max(0, this.progress()));
    return `inset(0 ${(1 - p) * 100}% 0 0)`;
  });

  onClick(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.seek.emit(Math.min(1, Math.max(0, ratio)));
  }
}