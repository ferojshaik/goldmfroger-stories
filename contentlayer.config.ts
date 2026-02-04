
import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import readingTime from 'reading-time';

export const Story = defineDocumentType(() => ({
  name: 'Story',
  filePathPattern: `stories/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    description: { type: 'string', required: true },
    slug: { type: 'string', required: true },
    youtubeUrl: { type: 'string', required: false },
    image: { type: 'string', required: true },
    images: { type: 'list', of: { type: 'string' }, required: false },
    category: { type: 'string', required: false },
  },
  computedFields: {
    readingTime: {
      type: 'string',
      resolve: (doc) => readingTime(doc.body.raw).text,
    },
    url: {
      type: 'string',
      resolve: (doc) => `/stories/${doc.slug}`,
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Story],
});
