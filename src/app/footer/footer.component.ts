import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  current_year: number;
  copied = false;

  // Janes et al. 2018, PMID 30282735 (same paper CitationService looks up)
  readonly citation = 'Janes J, Young ME, Chen E, et al. The ReFRAME library as a comprehensive drug repurposing ' +
    'library and its application to the treatment of cryptosporidiosis. Proc Natl Acad Sci U S A. 2018;115(42):10750–10755.';
  readonly doi = '10.1073/pnas.1810137115';

  constructor() {
    this.current_year = (new Date()).getFullYear();
  }

  copyCitation() {
    const text = this.citation + ' doi:' + this.doi;
    const done = () => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    };
    const nav: any = navigator;
    if (nav.clipboard && nav.clipboard.writeText) {
      nav.clipboard.writeText(text).then(done, () => this.fallbackCopy(text, done));
    } else {
      this.fallbackCopy(text, done);
    }
  }

  // Older browsers / non-secure contexts without the async clipboard API
  private fallbackCopy(text: string, done: () => void) {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      if (document.execCommand('copy')) { done(); }
    } finally {
      document.body.removeChild(area);
    }
  }
}
