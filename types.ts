
export interface Story {
  title: string;
  slug: string;
  date: string;
  description: string;
  youtubeUrl?: string;
  image: string;
  images?: string[];
  readingTime?: string;
  body: string;
  category?: string;
}

export enum Route {
  HOME = '/',
  STORIES = '/stories',
  ABOUT = '/about',
  STORY_DETAIL = '/stories/:slug'
}
