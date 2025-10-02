import { BsPersonCheck } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "counselling",
  title: "Counselling Team",
  type: "document",
  icon: BsPersonCheck,
  fields: [
    defineField({
      name: "name",
      title: "Team Name",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(100),
      description: "The name of the counselling team",
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
        "Unique identifier for the counselling team (auto-generated from team name)",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(500),
      description: "Brief description of the counselling team",
    }),
    defineField({
      name: "counsellor",
      title: "Counsellor",
      type: "reference",
      to: [{ type: "participant" }],
      validation: (Rule) => Rule.required(),
      options: {
        filter: "department == 'volunteer'",
      },
      description: "The volunteer who will serve as the counsellor for this team",
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
      validation: (Rule) => Rule.min(1).max(20),
      description: "List of participants assigned to this counselling team (excluding volunteers)",
    }),
    defineField({
      name: "meetingSchedule",
      title: "Meeting Schedule",
      type: "string",
      description: "When the counselling sessions are scheduled",
    }),
    defineField({
      name: "location",
      title: "Meeting Location",
      type: "string",
      description: "Where the counselling sessions will take place",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
          { title: "Completed", value: "completed" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 4,
      description: "Additional notes about the counselling team",
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
      counsellor: "counsellor.name",
      participants: "participants",
      status: "status",
    },
    prepare(selection) {
      const { title, subtitle, counsellor, participants, status } = selection;
      const participantCount = participants ? participants.length : 0;
      const statusEmoji = status === "active" ? "🟢" : status === "completed" ? "✅" : "⚪";

      return {
        title,
        subtitle: `${statusEmoji} Counsellor: ${counsellor || "Not assigned"} • ${participantCount} participants ${subtitle ? `• ${subtitle}` : ""}`,
      };
    },
  },
  orderings: [
    {
      title: "Team Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Status",
      name: "statusAsc",
      by: [{ field: "status", direction: "asc" }],
    },
    {
      title: "Created Date",
      name: "createdDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
});