export type SampleType = 'INSTRUMENTAL' | 'VOCAL';
export type Scale = 'MAJOR' | 'MINOR';

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface SaveSampleRequest {
  title: string;
  description?: string;
  bpm?: number;
  sampleType?: SampleType;
  musicalKey?: string;
  scale?: Scale;
  timeSignature?: string;
  genre?: string;
  fileKey: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  durationSeconds?: number;
  waveformPeaks?: string;
}

export interface SampleDto {
  sampleId: number;
  title: string;
  description?: string;
  bpm?: number;
  sampleType?: SampleType;
  musicalKey?: string;
  scale?: Scale;
  timeSignature?: string;
  genre?: string;
  originalFileName: string;
  fileSizeBytes: number;
  durationSeconds?: number;
  downloadCount: number;
  playCount: number;
  uploaderUsername: string;
  createdDttm: string;
  updatedDttm: string;
  waveformPeaks?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface MediaUrlResponse {
  url: string;
}
export const MUSICAL_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export interface SampleFilters {
  q?: string;
  genre?: string;
  sampleType?: SampleType;
  musicalKey?: string;
  scale?: Scale;
  bpmMin?: number;
  bpmMax?: number;
}

export interface UpdateSampleRequest {
  title: string;
  description?: string;
  bpm?: number;
  sampleType?: SampleType;
  musicalKey?: string;
  scale?: Scale;
  timeSignature?: string;
  genre?: string;
}