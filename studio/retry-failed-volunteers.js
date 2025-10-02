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

// Read processed volunteers
const volunteersPath = path.join(__dirname, "processed-volunteers.json");
const allVolunteers = JSON.parse(fs.readFileSync(volunteersPath, "utf-8"));

// Failed volunteer regNos
const failedRegNos = [
  "VOL-001",
  "VOL-002",
  "VOL-003",
  "VOL-004",
  "VOL-005",
  "VOL-006",
  "VOL-007",
  "VOL-008",
  "VOL-009",
  "VOL-010",
  "VOL-011",
  "VOL-012",
  "VOL-013",
  "VOL-014",
  "VOL-015",
  "VOL-016",
  "VOL-017",
  "VOL-018",
  "VOL-019",
  "VOL-020",
];

// Filter to get only failed volunteers
const volunteers = allVolunteers.filter((v) => failedRegNos.includes(v.regNo));

console.log(
  "\n═══════════════════════════════════════════════════════════════"
);
console.log("           RETRYING FAILED VOLUNTEERS IMPORT");
console.log(
  "═══════════════════════════════════════════════════════════════\n"
);
console.log(`Total volunteers to retry: ${volunteers.length}\n`);
console.log("Starting import...\n");

// Import function
async function retryVolunteers() {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < volunteers.length; i++) {
    const volunteer = volunteers[i];

    try {
      // Remove temporary fields
      const { _original, division, area, ...cleanVolunteer } = volunteer;

      console.log(`\nAttempting: [${volunteer.regNo}] ${volunteer.name}`);
      console.log(`  Data:`, JSON.stringify(cleanVolunteer, null, 2));

      // Create the document
      const result = await client.create(cleanVolunteer);

      successCount++;
      console.log(`  ✅ SUCCESS`);
    } catch (error) {
      errorCount++;
      console.log(`  ❌ FAILED`);
      console.log(`  Error:`, error);
      console.log(`  Error message:`, error.message);
      console.log(`  Error details:`, JSON.stringify(error, null, 2));
      errors.push({
        regNo: volunteer.regNo,
        name: volunteer.name,
        error: error.message || error.toString(),
        details: error,
      });
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Final summary
  console.log(
    "\n\n═══════════════════════════════════════════════════════════════"
  );
  console.log("                    RETRY COMPLETE");
  console.log(
    "═══════════════════════════════════════════════════════════════\n"
  );

  console.log(`✅ Successfully imported: ${successCount} volunteers`);
  console.log(`❌ Still failed: ${errorCount} volunteers\n`);

  if (errors.length > 0) {
    console.log("Errors encountered:");
    errors.forEach((err) => {
      console.log(`  - [${err.regNo}] ${err.name}: ${err.error}`);
    });
    console.log("");

    // Save detailed error log
    const errorLogPath = path.join(__dirname, "retry-errors-detailed.json");
    fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
    console.log(`Detailed error log saved to: retry-errors-detailed.json\n`);
  }

  console.log(
    "═══════════════════════════════════════════════════════════════\n"
  );
}

// Run the retry
retryVolunteers()
  .then(() => {
    console.log("✨ Retry process completed!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error during retry:", error);
    process.exit(1);
  });
