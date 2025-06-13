/***Home cloud changes new component */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { LicensePageComponent } from '~/app/core/pages/license-page/license-page.component';
import { PagesModule } from '~/app/core/pages/pages.module';
import { TestingModule } from '~/app/testing.module';

describe('LicensePageComponent', () => {
  let component: LicensePageComponent;
  let fixture: ComponentFixture<LicensePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, PagesModule, TestingModule, ToastrModule.forRoot()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicensePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
