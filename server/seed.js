const path = require("path");
const fs = require("fs");

const seedsDir = path.join(__dirname, "seeds");

async function runSeeds() {
  const seedFiles = fs
    .readdirSync(seedsDir)
    .filter((file) => file.endsWith(".js"));

  for (const file of seedFiles) {
    const seed = require(path.join(seedsDir, file));
    console.log(`Running seed file: ${file}`);
    await seed();
  }
}

runSeeds()
  .then(() => {
    console.log("Seeding completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error running seeds: ", err);
    process.exit(1);
  });
