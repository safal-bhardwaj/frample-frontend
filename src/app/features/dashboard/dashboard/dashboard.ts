import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription, debounceTime } from 'rxjs';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Waveform } from '../../../shared/components/waveform/waveform';
import { Sample } from '../../../core/services/sample';
import { Player } from '../../../core/services/player';
import { MUSICAL_KEYS, SampleDto, SampleFilters, SampleType, Scale } from '../../../core/models/sample.models';

type SampleView = SampleDto & { peaks: number[] };

const PAGE_SIZE = 20;

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
  imports: [Navbar, Waveform, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private sampleService = inject(Sample);
  private destroyRef = inject(DestroyRef);
  protected readonly player = inject(Player);

  private loadSub?: Subscription;

  keys = MUSICAL_KEYS;

  samples = signal<SampleView[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  errorMessage = signal<string | null>(null);
  page = signal(0);
  isLast = signal(true);
  totalElements = signal(0);

  filterForm = this.fb.nonNullable.group({
    q: [''],
    genre: [''],
    sampleType: [''],
    musicalKey: [''],
    scale: [''],
    bpmMin: [null as number | null],
    bpmMax: [null as number | null]
  });

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(true));

    this.load(true);
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.player.stop(); // don't keep playing after leaving the page
  }

  private currentFilters(): SampleFilters {
    const v = this.filterForm.getRawValue();
    return {
      q: v.q.trim() || undefined,
      genre: v.genre.trim() || undefined,
      sampleType: (v.sampleType || undefined) as SampleType | undefined,
      musicalKey: v.musicalKey || undefined,
      scale: (v.scale || undefined) as Scale | undefined,
      bpmMin: v.bpmMin ?? undefined,
      bpmMax: v.bpmMax ?? undefined
    };
  }

  hasActiveFilters(): boolean {
    return Object.values(this.currentFilters()).some(v => v !== undefined);
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  loadMore(): void {
    this.load(false);
  }

  private load(reset: boolean): void {
    this.loadSub?.unsubscribe(); // cancels any in-flight request so old results can't overwrite new ones
    const page = reset ? 0 : this.page() + 1;

    if (reset) this.isLoading.set(true);
    else this.isLoadingMore.set(true);
    this.errorMessage.set(null);

    this.loadSub = this.sampleService.getSamples(page, PAGE_SIZE, this.currentFilters()).subscribe({
      next: (res) => {
        const views = res.content.map(s => ({ ...s, peaks: parsePeaks(s.waveformPeaks) }));
        this.samples.set(reset ? views : [...this.samples(), ...views]);
        this.page.set(res.number);
        this.isLast.set(res.last);
        this.totalElements.set(res.totalElements);
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load samples.');
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      }
    });
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