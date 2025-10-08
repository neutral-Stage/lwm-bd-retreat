const { createClient } = require("@sanity/client");

// Initialize Sanity client
const client = createClient({
  projectId: "4sm78dyf",
  dataset: "retreat",
  useCdn: false,
  apiVersion: "2023-10-01",
  token:
    "skxxUgMf1lYyePZswUOWi1NzyxZBlylDd7QIoXjckjcO2Sc5TwMXicSPGXZZZ3xN9QERpACPG42pEX8sYU79eaIfsQTQQppOatm0lWX8ppS7MW8t9rv7kcQk7z0x6Ug1iuqE5FZZd0BdsVfcUfatspl7V5PAqsJy0oa4NXAxiv5QZhE4lRfF",
});

// Function to get all counselling teams with their participants
async function getAllCounsellings() {
  try {
    const counsellings = await client.fetch(
      `*[_type == "counselling"] | order(name asc) {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "counsellor": counsellor->{
          _id,
          name,
          contact,
          department,
          fellowshipName,
          gender,
          present
        },
        "participants": coalesce(
          counsellingParticipants[]{
            _id,
            "participant": participant->{
              _id,
              name,
              contact,
              department,
              fellowshipName,
              gender,
              present
            },
            status,
            comments
          },
          participants[]->{
            "participant": {
              _id,
              name,
              contact,
              department,
              fellowshipName,
              gender,
              present
            },
            "status": "pending",
            "comments": "",
            "_id": null
          }
        ),
        meetingSchedule,
        location,
        status,
        notes
      }`,
      {},
      {
        cache: "no-store",
      }
    );

    return Array.isArray(counsellings) ? counsellings : [];
  } catch (error) {
    console.error("Error fetching counsellings:", error);
    return [];
  }
}

// Function to generate a random key for Sanity references
function generateKey() {
  return Math.random().toString(36).substring(2, 14);
}

// Function to create a group
async function createGroup(groupData) {
  try {
    const participantRefs =
      groupData.participants?.map((id) => ({
        _key: generateKey(),
        _ref: id,
        _type: "reference",
      })) || [];

    const volunteerRefs =
      groupData.volunteers?.map((id) => ({
        _key: generateKey(),
        _ref: id,
        _type: "reference",
      })) || [];

    const result = await client.create({
      _type: "group",
      name: groupData.name,
      slug: {
        _type: "slug",
        current: groupData.name.toLowerCase().replace(/\s+/g, "-"),
      },
      description: groupData.description || "",
      participants: participantRefs,
      volunteers: volunteerRefs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }
}

// Function to display counselling data
function displayCounsellingData(counsellings) {
  console.log("\n" + "=".repeat(80));
  console.log("COUNSELLING TEAMS DATA");
  console.log("=".repeat(80));

  if (counsellings.length === 0) {
    console.log("No counselling teams found.");
    return;
  }

  counsellings.forEach((counselling, index) => {
    console.log(`\n${index + 1}. ${counselling.name}`);
    console.log(`   Description: ${counselling.description || "N/A"}`);
    console.log(`   Counsellor: ${counselling.counsellor?.name || "N/A"}`);
    console.log(`   Status: ${counselling.status}`);
    console.log(`   Meeting Schedule: ${counselling.meetingSchedule || "N/A"}`);
    console.log(`   Location: ${counselling.location || "N/A"}`);

    if (counselling.participants && counselling.participants.length > 0) {
      console.log(`   Participants (${counselling.participants.length}):`);
      counselling.participants.forEach((cp, pIndex) => {
        const participant = cp.participant || cp;
        console.log(
          `     ${pIndex + 1}. ${participant.name} (${
            participant.department || "N/A"
          }) - Status: ${cp.status || "N/A"}`
        );
      });
    } else {
      console.log("   Participants: None");
    }

    console.log("-".repeat(60));
  });

  console.log(`\nTotal counselling teams: ${counsellings.length}`);
  console.log("=".repeat(80));
}

// Function to prepare group data from counselling data
function prepareGroupData(counsellings) {
  return counsellings.map((counselling) => {
    // Extract participant IDs from counselling participants
    const participantIds =
      counselling.participants
        ?.map((cp) => {
          const participant = cp.participant || cp;
          return participant._id;
        })
        .filter((id) => id) || [];

    const counsellorName = counselling.counsellor?.name || "Unknown";
    const description = `Group created from counselling team: ${counselling.name} (Counsellor: ${counsellorName})`;

    return {
      name: counselling.name,
      description: description,
      participants: participantIds,
      volunteers: [], // Empty volunteers array - will be added later
      originalCounsellingId: counselling._id,
    };
  });
}

// Function to display group data that will be created
function displayGroupData(groupsToCreate) {
  console.log("\n" + "=".repeat(80));
  console.log("GROUPS TO BE CREATED");
  console.log("=".repeat(80));

  if (groupsToCreate.length === 0) {
    console.log("No groups to create.");
    return;
  }

  groupsToCreate.forEach((group, index) => {
    console.log(`\n${index + 1}. ${group.name}`);
    console.log(`   Description: ${group.description}`);
    console.log(`   Participants: ${group.participants.length}`);
    console.log(
      `   Volunteers: ${group.volunteers.length} (will be added later)`
    );
    console.log(
      `   Total Members: ${group.participants.length + group.volunteers.length}`
    );
    console.log("-".repeat(60));
  });

  console.log(`\nTotal groups to create: ${groupsToCreate.length}`);
  console.log("=".repeat(80));
}

// Main function
async function main() {
  console.log("Starting counselling to groups migration script...\n");

  try {
    // Step 1: Get all counselling teams
    console.log("Step 1: Fetching counselling teams...");
    const counsellings = await getAllCounsellings();

    if (counsellings.length === 0) {
      console.log("No counselling teams found. Exiting...");
      return;
    }

    // Step 2: Display counselling data
    console.log("Step 2: Displaying counselling data...");
    displayCounsellingData(counsellings);

    // Step 3: Prepare group data
    console.log("Step 3: Preparing group data...");
    const groupsToCreate = prepareGroupData(counsellings);

    // Step 4: Display group data that will be created
    console.log("Step 4: Displaying groups to be created...");
    displayGroupData(groupsToCreate);

    // Step 5: Ask for confirmation
    console.log("\n" + "=".repeat(80));
    console.log("CONFIRMATION REQUIRED");
    console.log("=".repeat(80));
    console.log(
      "This script will create the above groups from counselling teams."
    );
    console.log("Make sure you have reviewed the data above.");
    console.log("=".repeat(80));

    // Step 5: Create the groups
    console.log("\nStep 5: Creating groups...");
    const createdGroups = [];

    for (const groupData of groupsToCreate) {
      try {
        console.log(`Creating group: ${groupData.name}...`);
        const createdGroup = await createGroup(groupData);
        createdGroups.push(createdGroup);
        console.log(`✅ Successfully created group: ${groupData.name}`);
      } catch (error) {
        console.error(
          `❌ Failed to create group: ${groupData.name}`,
          error.message
        );
      }
    }

    console.log(
      `\nMigration completed! Created ${createdGroups.length} groups.`
    );
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getAllCounsellings,
  createGroup,
  displayCounsellingData,
  prepareGroupData,
  displayGroupData,
  main,
};
