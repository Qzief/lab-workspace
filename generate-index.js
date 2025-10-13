const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "posts");

console.log("📁 Current directory:", process.cwd());
console.log("📂 Target directory:", dir);

if (!fs.existsSync(dir)) {
  console.error("❌ Folder 'posts' tidak ditemukan!");
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

console.log("📝 Files found:", files);

fs.writeFileSync(
  path.join(dir, "index.json"),
  JSON.stringify(files, null, 2)
);

console.log(`✅ index.json generated with ${files.length} file(s)`);
