import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySamples } from './my-samples';

describe('MySamples', () => {
  let component: MySamples;
  let fixture: ComponentFixture<MySamples>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MySamples],
    }).compileComponents();

    fixture = TestBed.createComponent(MySamples);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
