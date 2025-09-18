import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'

import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'LWM Retreat',

  projectId: '4sm78dyf',
  dataset: 'retreat',

  plugins: [
    structureTool(),
    visionTool(),
    media()
  ],

  schema: {
    types: schemaTypes,
  },
})