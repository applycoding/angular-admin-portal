import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { filter, map, startWith, type Observable } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';
import { roleMessageKey } from '../core/i18n/labels';
import { I18nService } from '../core/i18n/i18n.service';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { isMessageKey, type MessageKey } from '../core/i18n/translations';
import { visibleMenu } from '../core/navigation/menu';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private readonly router = inject(Router);
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly user = this.auth.user;
  protected readonly items = computed(() => visibleMenu(this.auth.user()?.role ?? null));
  protected readonly roleLabel = computed(() => {
    const role = this.auth.user()?.role;
    return role ? roleMessageKey(role) : 'auth.roleViewer';
  });
  protected readonly handset = toSignal(
    this.breakpoints.observe('(max-width: 840px)').pipe(map(state => state.matches)),
    { initialValue: false },
  );
  protected readonly navOpen = signal(true);
  protected readonly titleKey = toSignal(this.titleKey$(), { initialValue: 'nav.dashboard' as MessageKey });

  constructor() {
    effect(() => {
      this.navOpen.set(!this.handset());
    });
    effect(() => {
      document.title = `${this.i18n.t(this.titleKey())} · ${this.i18n.t('app.name')}`;
    });
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.handset()) {
          this.navOpen.set(false);
        }
      });
  }

  protected toggleNav(): void {
    this.navOpen.update(open => !open);
  }

  protected setLocale(value: unknown): void {
    if (value === 'en' || value === 'es') {
      this.i18n.setLocale(value);
    }
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  private titleKey$(): Observable<MessageKey> {
    return this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.titleFromRouter()),
    );
  }

  private titleFromRouter(): MessageKey {
    let current = this.router.routerState.snapshot.root;
    let key: MessageKey = 'nav.dashboard';
    while (current.firstChild) {
      current = current.firstChild;
      const titleKey = current.data['titleKey'];
      if (isMessageKey(titleKey)) {
        key = titleKey;
      }
    }
    return key;
  }
}
