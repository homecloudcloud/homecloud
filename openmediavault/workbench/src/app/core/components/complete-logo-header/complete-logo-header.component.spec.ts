import { ComponentFixture, TestBed } from '@angular/core/testing';

import {}

describe('CompleteLogoHeaderComponent', () => {
  let component: CompleteLogoHeaderComponent;
  let fixture: ComponentFixture<CompleteLogoHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompleteLogoHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
