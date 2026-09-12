// Recomprime as imagens já publicadas no Storage (mesmo path → URLs no banco
// não mudam). Uso: npm run storage:compress [-- --dry]
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKETS = ["package-images", "blog-covers", "promotion-images"];
const MIN_BYTES = 300 * 1024; // abaixo disso não compensa mexer
const MAX_WIDTH = 1600;
const dry = process.argv.includes("--dry");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

async function listAll(bucket, prefix = "") {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw error;
  const files = [];
  for (const item of data) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) files.push({ path, size: item.metadata?.size ?? 0, mime: item.metadata?.mimetype ?? "" });
    else files.push(...(await listAll(bucket, path)));
  }
  return files;
}

let before = 0;
let after = 0;

for (const bucket of BUCKETS) {
  const files = (await listAll(bucket)).filter((f) => f.size >= MIN_BYTES && f.mime !== "image/gif");
  console.log(`\n${bucket}: ${files.length} arquivo(s) acima de ${MIN_BYTES / 1024}KB`);

  for (const file of files) {
    const { data, error } = await supabase.storage.from(bucket).download(file.path);
    if (error) throw error;
    const output = await sharp(Buffer.from(await data.arrayBuffer()))
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    before += file.size;
    after += output.length;
    console.log(`  ${file.path}: ${(file.size / 1024).toFixed(0)}KB → ${(output.length / 1024).toFixed(0)}KB`);

    if (dry) continue;
    const { error: upError } = await supabase.storage.from(bucket).upload(file.path, output, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });
    if (upError) throw upError;
  }
}

console.log(`\nTotal: ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB${dry ? " (dry run, nada enviado)" : ""}`);
