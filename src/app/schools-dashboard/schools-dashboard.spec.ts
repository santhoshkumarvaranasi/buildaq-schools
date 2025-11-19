import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolsDashboardComponent } from './schools-dashboard';

describe('SchoolsDashboardComponent', () => {
  let component: SchoolsDashboardComponent;
  let fixture: ComponentFixture<SchoolsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
