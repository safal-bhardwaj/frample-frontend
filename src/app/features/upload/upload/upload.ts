import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Sample } from '../../../core/services/sample';
import { firstValueFrom } from 'rxjs';
import { MUSICAL_KEYS } from '../../../core/models/sample.models';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [ReactiveFormsModule, Navbar],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class Upload {
  private fb = inject(FormBuilder);
  private sampleService = inject(Sample);
  private router = inject(Router);
  keys = MUSICAL_KEYS;  
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);
  errorMessage = signal<string | null>(null);
  uploadProgress = signal<string>('');

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', Validators.maxLength(1000)],
    bpm: [null as number | null],
    sampleType: [''],
    musicalKey: [''],
    scale: [''],
    timeSignature: [''],
    genre: ['']
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      this.errorMessage.set('Please select an audio file.');
      return;
    }

    this.errorMessage.set(null);
    this.selectedFile.set(file);
  }

  async submit(): Promise<void> {
    const file = this.selectedFile();
    if (!file || this.form.invalid) return;

    this.isUploading.set(true);
    this.errorMessage.set(null);

    try {
  
this.uploadProgress.set('Analyzing audio...');
const { durationSeconds, peaks } = await this.sampleService.analyzeAudio(file);

      this.uploadProgress.set('Preparing upload...');
      const presigned = await firstValueFrom(
        this.sampleService.getPresignedUpload(file.name, file.type)
      );

      this.uploadProgress.set('Uploading file...');
      await this.sampleService.uploadFileToR2(presigned.uploadUrl, file);

      this.uploadProgress.set('Saving details...');
      const formValue = this.form.getRawValue();
      await firstValueFrom(
        this.sampleService.saveSample({
          title: formValue.title,
          description: formValue.description || undefined,
          bpm: formValue.bpm ?? undefined,
          sampleType: (formValue.sampleType || undefined) as any,
          musicalKey: formValue.musicalKey || undefined,
          scale: (formValue.scale || undefined) as any,
          timeSignature: formValue.timeSignature || undefined,
          genre: formValue.genre || undefined,
          fileKey: presigned.fileKey,
          originalFileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
          durationSeconds,
          // and add this line inside the saveSample({...}) object:
waveformPeaks: JSON.stringify(peaks), 
        })
      );

      this.isUploading.set(false);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.isUploading.set(false);
      this.errorMessage.set('Upload failed. Please try again.');
    }
  }
}

