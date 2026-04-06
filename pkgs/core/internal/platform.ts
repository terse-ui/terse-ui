import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {inject, InjectionToken, PLATFORM_ID, REQUEST} from '@angular/core';
import {MOBILE_REGEX} from './constants';

export const IS_BROWSER = new InjectionToken<boolean>(ngDevMode ? 'IS_BROWSER' : '', {
  providedIn: 'platform',
  factory: () => isPlatformBrowser(inject(PLATFORM_ID)),
});

export const IS_SERVER = new InjectionToken<boolean>(ngDevMode ? 'IS_SERVER' : '', {
  providedIn: 'platform',
  factory: () => isPlatformServer(inject(PLATFORM_ID)),
});

export const IS_MOBILE = new InjectionToken<boolean>(ngDevMode ? 'IS_MOBILE' : '', {
  providedIn: 'platform',
  factory: () => {
    if (inject(IS_BROWSER)) {
      return MOBILE_REGEX.test(navigator.userAgent);
    }
    const userAgent = inject(REQUEST)?.headers.get('user-agent');
    return userAgent ? MOBILE_REGEX.test(userAgent) : false;
  },
});
