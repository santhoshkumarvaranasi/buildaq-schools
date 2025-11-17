import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolsDashboard } from './schools-dashboard';

describe('SchoolsDashboard', () => {
  let component: SchoolsDashboard;
  let fixture: ComponentFixture<SchoolsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolsDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolsDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
