//Home cloud changes new component
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutHomecloudPageComponent } from './about-homecloud-page.component

describe('AboutHomecloudPageComponent', () => {
  let component: AboutHomecloudPageComponent;
  let fixture: ComponentFixture<AboutHomecloudPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutHomecloudPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutHomecloudPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
