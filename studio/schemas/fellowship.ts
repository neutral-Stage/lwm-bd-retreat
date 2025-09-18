import { BsPeople } from 'react-icons/bs'
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'fellowship',
  title: 'Fellowship',
  type: 'document',
  icon: BsPeople,
  fields: [
    defineField({
      name: 'fellowship',
      title: 'Fellowship',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(100),
      description: 'The name of the fellowship',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'fellowship',
        maxLength: 96,
        slugify: (input) => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .slice(0, 96),
      },
      description: 'Unique identifier for the fellowship (auto-generated from fellowship name)',
    }),
    defineField({
      name: 'incharge',
      title: 'In Charge',
      type: 'string',
      validation: (Rule) => Rule.min(2).max(100),
      description: 'Person responsible for the fellowship',
    }),
    defineField({
      name: 'leaders',
      title: 'Leaders',
      type: 'string',
      validation: (Rule) => Rule.max(200),
      description: 'Names of fellowship leaders (comma-separated)',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.max(1000),
      description: 'Detailed information about the fellowship',
    }),
    defineField({
      name: 'division',
      title: 'Division',
      type: 'string',
      options: {
        list: [
          { title: 'Adult', value: 'adult' },
          { title: 'Youth', value: 'youth' },
          { title: 'Children', value: 'children' },
          { title: 'Senior', value: 'senior' },
          { title: 'Special Ministry', value: 'special-ministry' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
      description: 'The division/category the fellowship belongs to',
    }),
  ],
  preview: {
    select: {
      title: 'fellowship',
      subtitle: 'division',
      description: 'incharge',
    },
    prepare(selection) {
      const { title, subtitle, description } = selection
      return {
        title,
        subtitle: `${subtitle} ${description ? `• ${description}` : ''}`,
      }
    },
  },
  orderings: [
    {
      title: 'Fellowship Name',
      name: 'fellowshipAsc',
      by: [{ field: 'fellowship', direction: 'asc' }],
    },
    {
      title: 'Division',
      name: 'divisionAsc',
      by: [{ field: 'division', direction: 'asc' }],
    },
  ],
})