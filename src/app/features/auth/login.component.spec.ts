import { provideLocationMocks } from '@angular/common/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { LoginComponent } from './login.component';

@Component({ selector: 'app-blank', template: '' })
class BlankComponent {}

describe('LoginComponent', () => {
  const auth = {
    login: jest.fn(),
    isAuthenticated: jest.fn(() => false),
  };

  beforeEach(async () => {
    auth.login.mockReset();
    auth.isAuthenticated.mockReset();
    auth.isAuthenticated.mockReturnValue(false);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideNoopAnimations(),
        provideLocationMocks(),
        provideRouter([
          { path: 'login', component: LoginComponent },
          { path: 'dashboard', component: BlankComponent },
        ]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
  });

  it('shows a validation message when the form is empty', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.submit();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Enter an email address.');
  });

  it('shows the demo error when the credentials are rejected', async () => {
    auth.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.form.setValue({
      email: 'admin@harborline.example',
      password: 'wrong-password',
    });
    fixture.componentInstance.submit();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Email or password does not match a demo account.');
  });

  it('opens the dashboard after a successful sign-in', async () => {
    auth.login.mockReturnValue(
      of({
        id: 'usr-admin',
        name: 'Harborline Admin',
        email: 'admin@harborline.example',
        role: 'admin',
      }),
    );
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.form.setValue({
      email: 'admin@harborline.example',
      password: 'admin123',
    });
    fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });
});
