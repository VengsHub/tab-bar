import { Component, computed, ElementRef, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, fromEvent, map, merge, of, scan, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly newTabButton = viewChild<ElementRef<HTMLButtonElement>>('newTabButton');

  readonly newTabButtonAvailable = toObservable(this.newTabButton).pipe(
    filter(elementRef => !!elementRef),
    map(elementRef => elementRef.nativeElement)
  );

  readonly addNewTabEvent = this.newTabButtonAvailable.pipe(
    switchMap(element => fromEvent(element, 'click')),
    map(() => (tabs: string[]) => [...tabs, 'new tab'])
  );

  readonly updateEvents = merge(this.addNewTabEvent);

  readonly tabs = toSignal(
    this.httpGetTabs().pipe(
      switchMap(initialTabs =>
        this.updateEvents.pipe(
          startWith(() => initialTabs),
          scan(
            (tabs, action) => action(tabs),
            initialTabs
          ),
        )
      )
    ), {initialValue: []}
  );


  readonly windowWidth = toSignal(
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth)
    ),
    {initialValue: window.innerWidth}
  );

  readonly isMobile = computed(() => this.windowWidth() <= 480);

  protected readonly tabWidth = computed(() => {
    const responsiveWidth = this.windowWidth() / this.tabs().length;
    if (responsiveWidth < 80) return 44;
    if (responsiveWidth > 280) return 280;
    return responsiveWidth;
  });

  readonly visibleTabsLimit = computed(() =>
    Math.floor(this.windowWidth() / this.tabWidth())
  );

  httpGetTabs() {
    return of(['tab1', 'tab2', 'reallyLongTabName', 'tab3', 'tab4', 'reallyLongTabNameThatIsEvenLonger']);
  }
}
