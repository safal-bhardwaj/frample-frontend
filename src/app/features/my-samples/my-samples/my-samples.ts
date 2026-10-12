import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Sample } from '../../../core/services/sample';
import { MUSICAL_KEYS, SampleDto, SampleType, Scale, UpdateSampleRequest } from '../../../core/models/sample.models';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-my-samples',
  standalone: true,
  imports: [Navbar, ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './my-samples.html',
  styleUrl: './my-samples.css'
})
export class MySamples implements OnInit {
  private fb = inject(FormBuilder);
  private sampleService = inject(Sample);

  keys = MUSICAL_KEYS;

  samples = signal<SampleDto[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  errorMessage = signal<string | null>(null);
  page = signal(0);
  isLast = signal(true);
  totalElements = signal(0);

  editing = signal<SampleDto | null>(null);
  deleting = signal<SampleDto | null>(null);
  isBusy = signal(false);
  modalError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', Validators.maxLength(1000)],
    bpm: [null as number | null, [Validators.min(1), Validators.max(999)]],
    sampleType: [''],
    musicalKey: [''],
    scale: [''],
    timeSignature: ['', Validators.maxLength(10)],
    genre: ['', Validators.maxLength(50)]
  });

  ngOnInit(): void {
    this.load(true);
  }

  loadMore(): void {
    this.load(false);
  }

  private load(reset: boolean): void {
    const page = reset ? 0 : this.page() + 1;
    if (reset) this.isLoading.set(true);
    else this.isLoadingMore.set(true);

    this.sampleService.getMySamples(page, PAGE_SIZE).subscribe({
      next: (res) => {
        this.samples.set(reset ? res.content : [...this.samples(), ...res.content]);
        this.page.set(res.number);
        this.isLast.set(res.last);
        this.totalElements.set(res.totalElements);
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load your uploads.');
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      }
    });
  }

  keyLabel(sample: SampleDto): string {
    if (!sample.musicalKey) return '';
    return sample.musicalKey + (sample.scale === 'MINOR' ? 'm' : '');
  }

  // ---- Edit ----
  openEdit(sample: SampleDto): void {
    this.modalError.set(null);
    this.form.reset({
      title: sample.title,
      description: sample.description ?? '',
      bpm: sample.bpm ?? null,
      sampleType: sample.sampleType ?? '',
      musicalKey: sample.musicalKey ?? '',
      scale: sample.scale ?? '',
      timeSignature: sample.timeSignature ?? '',
      genre: sample.genre ?? ''
    });
    this.editing.set(sample);
  }

  closeEdit(): void {
    if (this.isBusy()) return;
    this.editing.set(null);
  }

  saveEdit(): void {
    const target = this.editing();
    if (!target || this.form.invalid || this.isBusy()) return;

    const v = this.form.getRawValue();
    // Empty values are left out of the JSON, which the backend treats as "clear this field"
    const request: UpdateSampleRequest = {
      title: v.title.trim(),
      description: v.description.trim() || undefined,
      bpm: v.bpm ?? undefined,
      sampleType: (v.sampleType || undefined) as SampleType | undefined,
      musicalKey: v.musicalKey || undefined,
      scale: (v.scale || undefined) as Scale | undefined,
      timeSignature: v.timeSignature.trim() || undefined,
      genre: v.genre.trim() || undefined
    };

    this.isBusy.set(true);
    this.modalError.set(null);

    this.sampleService.updateSample(target.sampleId, request).subscribe({
      next: (updated) => {
        this.samples.set(this.samples().map(s => (s.sampleId === updated.sampleId ? updated : s)));
        this.isBusy.set(false);
        this.editing.set(null);
      },
      error: (err) => {
        this.isBusy.set(false);
        this.modalError.set(err.error?.message ?? 'Could not save changes.');
      }
    });
  }

  // ---- Delete ----
  openDelete(sample: SampleDto): void {
    this.modalError.set(null);
    this.deleting.set(sample);
  }

  closeDelete(): void {
    if (this.isBusy()) return;
    this.deleting.set(null);
  }

  confirmDelete(): void {
    const target = this.deleting();
    if (!target || this.isBusy()) return;

    this.isBusy.set(true);
    this.modalError.set(null);

    this.sampleService.deleteSample(target.sampleId).subscribe({
      next: () => {
        this.samples.set(this.samples().filter(s => s.sampleId !== target.sampleId));
        this.totalElements.set(Math.max(0, this.totalElements() - 1));
        this.isBusy.set(false);
        this.deleting.set(null);
      },
      error: (err) => {
        this.isBusy.set(false);
        this.modalError.set(err.error?.message ?? 'Could not delete this sample.');
      }
    });
  }
}