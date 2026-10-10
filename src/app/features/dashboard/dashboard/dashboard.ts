import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Waveform } from '../../../shared/components/waveform/waveform';
import { Sample } from '../../../core/services/sample';
import { Player } from '../../../core/services/player';
import { SampleDto } from '../../../core/models/sample.models';

type SampleView = SampleDto & { peaks: number[] };

// Defensive: the string comes from the server, so never trust its shape blindly
function parsePeaks(raw?: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(Number)
      .filter(n => Number.isFinite(n))
      .map(n => Math.min(100, Math.max(6, n)));
  } catch {
    return [];
  }
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar, Waveform],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private sampleService = inject(Sample);
  protected readonly player = inject(Player);

  samples = signal<SampleView[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.sampleService.getSamples().subscribe({
      next: (page) => {
        this.samples.set(page.content.map(s => ({ ...s, peaks: parsePeaks(s.waveformPeaks) })));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load samples.');
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.player.stop(); // don't keep playing after leaving the page
  }

  isCurrent(sample: SampleDto): boolean {
    return this.player.currentSample()?.sampleId === sample.sampleId;
  }

  isPlaying(sample: SampleDto): boolean {
    return this.isCurrent(sample) && this.player.isPlaying();
  }

  progressOf(sample: SampleDto): number {
    return this.isCurrent(sample) ? this.player.progress() : 0;
  }

  keyLabel(sample: SampleDto): string {
    if (!sample.musicalKey) return '--';
    return sample.musicalKey + (sample.scale === 'MINOR' ? 'm' : '');
  }

  download(sample: SampleDto): void {
    this.sampleService.getDownloadUrl(sample.sampleId).subscribe({
      next: (res) => { window.location.href = res.url; }
    });
  }

  formatDuration(seconds?: number | null): string {
    if (seconds == null) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}