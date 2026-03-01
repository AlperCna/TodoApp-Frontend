import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsoSuccess } from './sso-success';

describe('SsoSuccess', () => {
  let component: SsoSuccess;
  let fixture: ComponentFixture<SsoSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsoSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SsoSuccess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
