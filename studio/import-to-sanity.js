const { createClient } = require("@sanity/client");
const fs = require("fs");
const path = require("path");

// Sanity client configuration
const client = createClient({
  projectId: "4sm78dyf",
  dataset: "retreat",
  apiVersion: "2024-01-01",
  token:
    "sknnqqY9maFNdrzrtDtXV95jxPrDuHV557tP6EbHkvr2DhpdT5lgC76zFRPa9Ji4VCRr7NqSxb6MdKd3ybmJ7NLRyX0qO4Fo9RKeyz7YNuImW9FUi2xxKq4ZHwpEcOU32u5KJfps8FDKL9QxihFXH64j15FbCjo7gRa6WeiMgF2Qe6oZsN4b",
  useCdn: false,
});

// Read processed participants
const participantsPath = path.join(__dirname, "processed-participants.json");
const participants = JSON.parse(fs.readFileSync(participantsPath, "utf-8"));

console.log(
  "\n═══════════════════════════════════════════════════════════════"
);
console.log("           IMPORTING PARTICIPANTS TO SANITY STUDIO");
console.log(
  "═══════════════════════════════════════════════════════════════\n"
);
console.log(`Total participants to import: ${participants.length}\n`);
console.log("Starting import...\n");

// Import function
async function importParticipants() {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Process in batches of 10 for better performance
  const batchSize = 10;
  const totalBatches = Math.ceil(participants.length / batchSize);

  for (let i = 0; i < participants.length; i += batchSize) {
    const batch = participants.slice(i, i + batchSize);
    const currentBatch = Math.floor(i / batchSize) + 1;

    console.log(
      `\n📦 Processing batch ${currentBatch}/${totalBatches} (${batch.length} participants)...`
    );

    // Create transactions for each participant in the batch
    const promises = batch.map(async (participant) => {
      try {
        // Remove temporary fields
        const { _original, division, area, ...cleanParticipant } = participant;

        // Create the document
        const result = await client.create(cleanParticipant);

        successCount++;
        console.log(`  ✅ [${participant.regNo}] ${participant.name}`);
        return { success: true, participant };
      } catch (error) {
        errorCount++;
        const errorMsg = `[${participant.regNo}] ${participant.name}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`  ❌ ${errorMsg}`);
        return { success: false, participant, error };
      }
    });

    // Wait for batch to complete
    await Promise.all(promises);

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < participants.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Final summary
  console.log(
    "\n\n═══════════════════════════════════════════════════════════════"
  );
  console.log("                    IMPORT COMPLETE");
  console.log(
    "═══════════════════════════════════════════════════════════════\n"
  );

  console.log(`✅ Successfully imported: ${successCount} participants`);
  console.log(`❌ Failed: ${errorCount} participants\n`);

  if (errors.length > 0) {
    console.log("Errors encountered:");
    errors.forEach((err) => console.log(`  - ${err}`));
    console.log("");
  }

  console.log(
    "═══════════════════════════════════════════════════════════════\n"
  );

  // Save error log if there are errors
  if (errors.length > 0) {
    const errorLogPath = path.join(__dirname, "import-errors.log");
    fs.writeFileSync(errorLogPath, errors.join("\n"));
    console.log(`Error log saved to: import-errors.log\n`);
  }
}

// Run the import
importParticipants()
  .then(() => {
    console.log("✨ Import process completed!");
    console.log("\n👉 Next steps:");
    console.log("   1. Open Sanity Studio (npm run dev)");
    console.log("   2. Check the Participant documents");
    console.log("   3. Review any failed imports if there were errors\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error during import:", error);
    process.exit(1);
  });
