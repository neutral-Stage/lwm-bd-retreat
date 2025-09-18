import { BsPeopleFill } from 'react-icons/bs'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'roomNo',
  title: 'Room No',
  type: 'document',
  icon: BsPeopleFill,
  fields: [
    defineField({
      name: 'roomNo',
      title: 'Room No',
      type: 'string',
    }),
    defineField({
      name: 'capacity',
      title: 'Capacity',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'roomNo',
      subtitle: 'capacity',
    },
  },
})
