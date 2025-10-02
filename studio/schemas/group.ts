import { BsPeople } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "group",
  title: "Group",
  type: "document",
  icon: BsPeople,
  fields: [
    defineField({
      name: "name",
      title: "Group Name",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(100),
      description: "The name of the group",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      validation: (Rule) => Rule.required(),
      options: {
        source: "name",
        maxLength: 96,
        slugify: (input) =>
          input.toLowerCase().replace(/\s+/g, "-").slice(0, 96),
      },
      description:
        "Unique identifier for the group (auto-generated from group name)",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(500),
      description: "Brief description of the group",
    }),
    defineField({
      name: "participants",
      title: "Participants",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "participant" }],
          options: {
            filter: "department != 'volunteer'",
          },
        },
      ],
      description: "List of participants in this group (excluding volunteers)",
    }),
    defineField({
      name: "volunteers",
      title: "Volunteers",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "participant" }],
          options: {
            filter: "department == 'volunteer'",
          },
        },
      ],
      description: "List of volunteers assigned to this group",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      participants: "participants",
      volunteers: "volunteers",
    },
    prepare(selection) {
      const { title, subtitle, participants, volunteers } = selection;
      const participantCount = participants ? participants.length : 0;
      const volunteerCount = volunteers ? volunteers.length : 0;
      return {
        title,
        subtitle: `${participantCount} participants, ${volunteerCount} volunteers ${subtitle ? `• ${subtitle}` : ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Group Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Created Date",
      name: "createdDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
});