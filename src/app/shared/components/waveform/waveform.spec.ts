import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Waveform } from './waveform';

describe('Waveform', () => {
  let component: Waveform;
  let fixture: ComponentFixture<Waveform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Waveform],
    }).compileComponents();

    fixture = TestBed.createComponent(Waveform);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
