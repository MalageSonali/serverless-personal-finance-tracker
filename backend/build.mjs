import fs from "node:fs";
import archiver from "archiver";

const functions = ["createTransaction", "listTransactions", "updateTransaction", "deleteTransaction", "manageBudget", "getDashboardSummary"];
fs.mkdirSync("dist", { recursive: true });

for (const name of functions) {
    const out = fs.createWriteStream(`dist/${name}.zip`);
    const zip = archiver("zip", { zlib: { level: 9 } });
    zip.pipe(out);
    zip.file(`${name}.mjs`, { name: `${name}.mjs` });
    zip.file("package.json", { name: "package.json" });
    zip.directory("shared", "shared");
    zip.directory("node_modules", "node_modules");
    await zip.finalize();
    await new Promise((r) => out.on("close", r));
    console.log(`built dist/${name}.zip`);
}