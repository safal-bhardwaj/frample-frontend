import { Injectable, inject, signal } from '@angular/core';
import { Sample } from './sample';
import { SampleDto } from '../models/sample.models';

@Injectable({ providedIn: 'root' })
export class Player {
  private sampleService = inject(Sample);
  private audio = new Audio();

  currentSample = signal<SampleDto | null>(null);
  isPlaying = signal(false);
  isLoading = signal(false);
  progress = signal(0); // 0..1

  constructor() {
    this.audio.addEventListener('timeupdate', () => {
      const d = this.audio.duration;
      this.progress.set(d ? this.audio.currentTime / d : 0);
    });
    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));
    this.audio.addEventListener('ended', () => {
      this.isPlaying.set(false);
      this.progress.set(0);
    });
  }

  toggle(sample: SampleDto): void {
    if (this.currentSample()?.sampleId === sample.sampleId) {
      if (this.audio.paused) {
        this.audio.play().catch(() => {});
      } else {
        this.audio.pause();
      }
      return;
    }
    this.load(sample);
  }

  seek(sample: SampleDto, ratio: number): void {
    if (this.currentSample()?.sampleId !== sample.sampleId) {
      this.toggle(sample);
      return;
    }
    const d = this.audio.duration;
    if (d) this.audio.currentTime = ratio * d;
  }

  stop(): void {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.currentSample.set(null);
    this.isPlaying.set(false);
    this.isLoading.set(false);
    this.progress.set(0);
  }

  private load(sample: SampleDto): void {
    this.audio.pause();
    this.currentSample.set(sample);
    this.progress.set(0);
    this.isLoading.set(true);

    this.sampleService.getStreamUrl(sample.sampleId).subscribe({
      next: (res) => {
        // The user may have clicked a different sample while this was loading
        if (this.currentSample()?.sampleId !== sample.sampleId) return;
        this.audio.src = res.url;
        this.audio.play().catch(() => {});
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.currentSample.set(null);
      }
    });
  }
}