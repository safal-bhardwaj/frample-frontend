import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PresignedUploadResponse,
  SaveSampleRequest,
  SampleDto,
  PageResponse,
  MediaUrlResponse,
  SampleFilters,
  UpdateSampleRequest
} from '../models/sample.models';

@Injectable({ providedIn: 'root' })
export class Sample {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/samples`;

  getPresignedUpload(fileName: string, contentType: string): Observable<PresignedUploadResponse> {
    return this.http.post<PresignedUploadResponse>(`${this.baseUrl}/presign-upload`, { fileName, contentType });
  }

  async uploadFileToR2(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    });
    if (!response.ok) {
      throw new Error('Upload to storage failed');
    }
  }

  saveSample(request: SaveSampleRequest): Observable<SampleDto> {
    return this.http.post<SampleDto>(this.baseUrl, request);
  }

getSamples(page = 0, size = 20, filters: SampleFilters = {}): Observable<PageResponse<SampleDto>> {
  let params = new HttpParams().set('page', page).set('size', size);
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return this.http.get<PageResponse<SampleDto>>(this.baseUrl, { params });
}

  async analyzeAudio(file: File, barCount = 100): Promise<{ durationSeconds: number; peaks: number[] }> {
  const ctx = new AudioContext();
  try {
    const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
    const channel = buffer.getChannelData(0);
    const blockSize = Math.floor(channel.length / barCount) || 1;

    const raw: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channel.length);
      let max = 0;
      for (let j = start; j < end; j++) {
        const v = Math.abs(channel[j]);
        if (v > max) max = v;
      }
      raw.push(max);
    }

    const globalMax = Math.max(...raw) || 1;
    const peaks = raw.map(v => Math.round((v / globalMax) * 100));
    return { durationSeconds: Math.round(buffer.duration), peaks };
  } finally {
    await ctx.close();
  }
}
  getStreamUrl(sampleId: number): Observable<MediaUrlResponse> {
  return this.http.get<MediaUrlResponse>(`${this.baseUrl}/${sampleId}/stream`);
}

getDownloadUrl(sampleId: number): Observable<MediaUrlResponse> {
  return this.http.get<MediaUrlResponse>(`${this.baseUrl}/${sampleId}/download`);
}
getMySamples(page = 0, size = 20): Observable<PageResponse<SampleDto>> {
  return this.http.get<PageResponse<SampleDto>>(`${this.baseUrl}/mine`, { params: { page, size } });
}

updateSample(sampleId: number, request: UpdateSampleRequest): Observable<SampleDto> {
  return this.http.put<SampleDto>(`${this.baseUrl}/${sampleId}`, request);
}

deleteSample(sampleId: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${sampleId}`);
}
}