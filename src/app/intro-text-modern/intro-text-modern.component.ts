import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-intro-text-modern',
  templateUrl: './intro-text-modern.component.html',
  styleUrls: ['./intro-text-modern.component.scss']
})
export class IntroTextModernComponent implements AfterViewInit, OnDestroy {
  isWhatsNewOpen = false;
  latestUpdateDate = 'July 31, 2025';
  @ViewChild('bellIcon', { static: true }) bellIcon!: ElementRef;
  @ViewChild('panel') panelRef!: ElementRef;

  private triggerBell(): void {
    const bell = this.bellIcon && (this.bellIcon.nativeElement as HTMLElement);
    if (!bell) return;
    bell.classList.remove('bell-ring');
    void bell.offsetWidth;
    bell.classList.add('bell-ring');
    setTimeout(() => bell.classList.remove('bell-ring'), 1200);
  }

  toggleWhatsNew(ev?: MouseEvent) {
    // prevent the click from bubbling to the document listener
    if (ev) ev.stopPropagation();
    this.isWhatsNewOpen = !this.isWhatsNewOpen;
    if (this.isWhatsNewOpen) {
      this.triggerBell();
    }
  }

  closeWhatsNew(ev?: MouseEvent) {
    if (ev) ev.stopPropagation();
    this.isWhatsNewOpen = false;
  }

  private outsideClickListener = (ev: MouseEvent) => {
    if (!this.isWhatsNewOpen) return;
    const panelEl = this.panelRef && (this.panelRef.nativeElement as HTMLElement | null);
    if (panelEl && !panelEl.contains(ev.target as Node)) {
      this.isWhatsNewOpen = false;
    }
  };

  ngAfterViewInit() {
    // initial ring on load
    const bell = this.bellIcon && (this.bellIcon.nativeElement as HTMLElement | undefined);
    if (bell) {
      bell.classList.add('bell-ring');
      bell.addEventListener('animationend', () => bell.classList.remove('bell-ring'), { once: true });
    }

    document.addEventListener('click', this.outsideClickListener);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.outsideClickListener);
  }

  downloadFiles() {
  const link = document.createElement('a');
  link.href = '../../assets/csv/reframe_smiles_list.csv';
  link.download = 'reframe_smiles_list.csv';
  link.click();
}
}
