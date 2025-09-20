/* eslint-disable no-console */
import { promises as fs } from "fs";
import path from "path";

const API_URL = "https://t1gpe4f1f8.execute-api.us-east-1.amazonaws.com/ai";
const TOKEN =
  "eyJraWQiOiJGcXFEdERPZmdwZHF6OHFyXC96dXBXRGR0N3BhR0V5cHNPdmZ1KzQ5UVFBRT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NDg4NzRmOC0zMDIxLTcwZjQtMTAwZC0xMGJhMTAwMmMyZGIiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9ZblVrZ3ZsZUEiLCJjbGllbnRfaWQiOiIzbm1tdGhrZ25wZWphZjBqN2RiMDlrcXZwNiIsIm9yaWdpbl9qdGkiOiI3MjlhZDQ1ZC00MDg0LTQ2NjItOGZhMi1iZjA4OWY3MDNjNDgiLCJpbnRlcm5hbElkIjoiMzJjakl3amlvanpUVW00SThsc1ZtUTFlUTI4IiwiZXZlbnRfaWQiOiJlZmM2MmJjNC01MDg5LTQxMGQtYjc0NC0xNjEyYWU3Nzg4MTgiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzU4MDcwODkyLCJleHAiOjE3NTgxMTQwOTEsImlhdCI6MTc1ODA3MDg5MiwianRpIjoiZjAzYTFhOGQtYjFjOC00NTA3LWFlZDQtMGFlMDc2NWI2ZDMyIiwidXNlcm5hbWUiOiI2NDg4NzRmOC0zMDIxLTcwZjQtMTAwZC0xMGJhMTAwMmMyZGIifQ.cyPMoeeQrZcOGgiND8WK2jOpHy-q5-6KmIjg_z3fElRJyWj1BBgfuySQwEIdjBPdYkEVuiCoo_vcJS7U1EkfmT5NFgAjSq1O7hTpLvKB4LfNc7wlmU6fhBGRopJkF-0kpHnOcViYXz2I3qY0OOWQAq8LpOkKqFWfpSgNONHscBAeZTxRUpiQkYyEfok8hu6608eruWmTEvlzQSBCWGRwvZ3LtYqReny6kg9lw278emwFKKi012eB3e6V8eR0Rqzm0E0i9B89YFPZtEg66h_Na3yvQipTYuzSM-HikU6yjbUrEe8v75dOERRHWo3hvwg0kDE89grvF7Jkfm9grToU5A";

interface IPresignResponse {
  uploadSignature: string;
}

interface IPresignDecoded {
  url: string;
  fields: Record<string, string>;
}

async function readFile(
  filePath: string,
  type: "audio/m4a" | "image/jpeg"
): Promise<{
  data: Buffer;
  size: number;
  type: string;
}> {
  console.log(`🔍 Reading file from disk: ${filePath}`);
  const data = await fs.readFile(filePath);
  return {
    data,
    size: data.length,
    type,
  };
}

async function createAIResponse(
  fileType: string,
  fileSize: number,
  origin: string
): Promise<IPresignDecoded> {
  console.log(`🚀 Requesting presigned POST for ${fileSize} bytes of type ${fileType}`);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ file: { type: fileType, size: fileSize }, origin }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get presigned POST: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as IPresignResponse;
  const decoded = JSON.parse(
    Buffer.from(json.uploadSignature, "base64").toString("utf-8")
  ) as IPresignDecoded;

  console.log("✅ Received presigned POST data");
  return decoded;
}

function buildFormData(
  fields: Record<string, string>,
  fileData: Buffer,
  filename: string,
  fileType: string
): FormData {
  console.log(
    `📦 Building FormData with ${Object.keys(fields).length} fields and file ${filename}`
  );
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  //@ts-ignore
  const blob = new Blob([fileData], { type: fileType });
  form.append("file", blob, filename);
  return form;
}

async function uploadToS3(url: string, form: FormData): Promise<void> {
  console.log(`📤 Uploading to S3 at ${url}`);
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed: ${res.status} ${res.statusText} — ${text}`);
  }

  console.log("🎉 Upload completed successfully");
}

async function uploadFile(filePath: string, fileType: "audio/m4a" | "image/jpeg"): Promise<void> {
  try {
    const { data, size, type } = await readFile(filePath, fileType);
    const { url, fields } = await createAIResponse(type, size, "invoice-audio");
    const form = buildFormData(fields, data, path.basename(filePath), type);
    await uploadToS3(url, form);
  } catch (err) {
    console.error("❌ Error during uploadFile:", err);
    throw err;
  }
}

// uploadFile(path.resolve(__dirname, "assets", "refeicao.jpg"), "image/jpeg").catch(() =>
//   process.exit(1)
// );

uploadFile(path.resolve(__dirname, "assets", "audio.m4a"), "audio/m4a").catch(() =>
  process.exit(1)
);
