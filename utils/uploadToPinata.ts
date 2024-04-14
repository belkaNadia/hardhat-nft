import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";

const pinataApiKey = process.env.PINATA_API_KEY || "";
const pinataApiSecret = process.env.PINATA_API_SECRET || "";
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

export async function storeImages(imagesFilePath: string) {
  const fullImagesPath = path.resolve(imagesFilePath);

  // Filter the files in case there's a file that in not a .png, .jpg or .jpeg
  const files = fs
    .readdirSync(fullImagesPath)
    .filter((file) => /\b.png|\b.jpg|\b.jpeg/.test(file));

  const responses: any[] = [];
  console.log("Uploading to IPFS");

  for (const fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    try {
      await pinata
        .pinFileToIPFS(readableStreamForFile, options)
        .then((result) => {
          responses.push(result);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  }
  return { responses, files };
}

export async function storeTokenUriMetadata(metadata: any) {
  const options = {
    pinataMetadata: {
      name: metadata.name,
    },
  };
  try {
    const response = await pinata.pinJSONToIPFS(metadata, options);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}
