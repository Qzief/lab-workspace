import fs from "fs";

const dir = "./posts";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

fs.writeFileSync(`${dir}/index.json`, JSON.stringify(files, null, 2));
console.log("✅ index.json generated with", files.length, "files");
