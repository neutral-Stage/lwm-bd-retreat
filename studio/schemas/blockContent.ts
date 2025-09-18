/**
 * This is the schema definition for the rich text fields used for
 * for this studio. When you import it in schemas/index.ts it can be
 * reused in other parts of the studio with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */
import { defineType } from 'sanity'

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    {
      type: 'block',
    },
    {
      type: 'image',
    },
  ],
})
