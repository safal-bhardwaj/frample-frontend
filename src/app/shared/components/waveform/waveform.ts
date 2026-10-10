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
  active = input(false);
  seek = output<number>();  // 0..1

  // Samples uploaded before waveforms existed have no peaks, so show flat placeholder bars
  bars = computed(() => (this.peaks().length ? this.peaks() : Array(100).fill(8)));

  onClick(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.seek.emit(Math.min(1, Math.max(0, ratio)));
  }
}