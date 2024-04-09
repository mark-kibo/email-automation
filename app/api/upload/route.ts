import path from "path";
import { readFile, writeFile, access, unlink } from "fs/promises";
import { NextResponse } from "next/server";

export const POST = async (req: { formData: () => any; }, res: any) => {
  const formData = await req.formData();

  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename =  file.name.replaceAll(" ", "_");
  console.log(filename);

  const filePath = path.join(process.cwd(), "public/assets/" + filename);

  try {
    // Check if the file exists
    await access(filePath);

    // If file exists, delete it
    await unlink(filePath);

    // Write the new file
    await writeFile(filePath, buffer);

    // Read the content of the file
    const content = await readFile(filePath, 'utf8');
    // console.log(filep)

    return NextResponse.json({ message: "Success", status: 201 , filename: filename, type: file.type, filepath: filePath, content: content });
  } catch (error) {
    console.log("Error occured ", error);
    return NextResponse.json({ message: "Failed", status: 500 });
  }
};
