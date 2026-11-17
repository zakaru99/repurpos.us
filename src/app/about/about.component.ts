import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})

export class AboutComponent implements OnInit {
  reframe_pmid: string = "30282735";
  meta_tags = [
    { name: 'description', content: 'About ReframeDB, an open and extendable drug repurposing database and screening set of over 13,288 compounds' },
    { property: 'og:title', content: 'About ReframeDB' },
    { property: 'og:description', content: 'About ReframeDB, an open and extendable drug repurposing database and screening set of over 13,288 compounds' },
    { property: 'og:url', content: 'https://reframedb.org/about' }
  ];

  // In-page sections, shown in the sticky nav of the page header
  sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'tutorial', label: 'Tutorial' },
    { id: 'access', label: 'Library access' },
    { id: 'diversity', label: 'Chemical diversity' },
    { id: 'sources', label: 'Data sources' },
    { id: 'cite', label: 'How to cite' },
    { id: 'terms', label: 'Terms of use' }
  ];
  private fragment: string;


  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private meta: Meta) {
    for (let i = 0; i < this.meta_tags.length; i++) {
      meta.updateTag(this.meta_tags[i]);
    }
    titleService.setTitle("About | REFRAMEdb");
  }


  ngOnInit() {
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  ngAfterViewInit(): void {
    this.scrollTo(this.fragment);
    this.keepAnchorInView();
  }

  // Images above a section (the diversity diagram, video posters) load after
  // the first jump and push the section down, so /about#terms stopped short.
  // Jump again as each loads, until the visitor scrolls for themselves.
  private keepAnchorInView() {
    if (!this.fragment) { return; }
    let userScrolled = false;
    const stop = () => { userScrolled = true; };
    ['wheel', 'touchstart', 'keydown'].forEach(e => window.addEventListener(e, stop, { once: true, passive: true } as any));
    const again = () => { if (!userScrolled) { this.scrollTo(this.fragment); } };
    Array.from(document.querySelectorAll('app-about img'))
      .filter((img: HTMLImageElement) => !img.complete)
      .forEach(img => img.addEventListener('load', again, { once: true } as any));
    setTimeout(again, 1500);
  }

  scrollTo(anchor) {
    try {
      document.querySelector('#' + anchor).scrollIntoView();
    } catch (e) { }
  }

}
