export interface NavigationLink {
  text: string;
  href: string;
  icon?: string;
  promotion?: 'always' | 'event-day' | 'other-days';
  sectionOrder?: number;
}

export interface NavigationSection {
  id: string;
  title: string;
  links: NavigationLink[];
}
