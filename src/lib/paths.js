import path from 'path';

const defaultGalleryDir =
  process.env.NODE_ENV === 'production'
    ? '/home/ubuntu/public/ps15642.com-nextJS/public/gallery'
    : path.join(process.cwd(), 'public/gallery');

export const GALLERY_DIR = process.env.GALLERY_DIR || defaultGalleryDir;

export const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');
export const PAGES_DIR = path.join(process.cwd(), 'content/pages');
