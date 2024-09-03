const express = require("express");
const cors = require("cors"); // Import CORS package
const { create } = require("ipfs-http-client");
// const fileUpload = require("express-fileupload");
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

const ipfs = create({ host: "127.0.0.1", port: "5001", protocol: "http" });

const app = express();
const { registerUser, loginUser, uploadFile } = require("./connectToNetwork");
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
// Enable files upload
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );

// Registration API
app.post("/register", async (req, res) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;
    await registerUser(username, firstName, lastName, email, password);
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Login API
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await loginUser(username, password);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload File API
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { username, url } = req.body;

    if (url) {
      // Handle URL upload
      console.log(`Received URL: ${url}`);
      console.log(`Received Username: ${username}`);

      if (!/^https?:\/\/.+\..+$/.test(url)) {
        return res.status(400).json({ message: "Invalid URL" });
      }

      // Fetch the website content
      const { path: cid } = await ipfs.add(Buffer.from(url));

      await uploadFile(username, cid);
      res.status(200).json({ message: "Website uploaded successfully", cid });
    } else if (req.file) {
      // Upload file content to IPFS
      const file = fs.readFileSync(req.file.path);

      const fileAdded = await ipfs.add(file);

      const cid = fileAdded.cid.toString();

      await uploadFile(username, cid);
      return res
        .status(200)
        .json({ message: "File uploaded successfully", cid });
    } else {
      return res.status(400).json({ message: "No file or URL provided" });
    }
  } catch (error) {
    console.log("error ", error.message);
    res.status(500).json({ message: error.message });
  }
});

app.get("/getData/:cid", async (req, res) => {
  const { cid } = req.params;

  try {
    // Fetch the data from IPFS
    const fileStream = ipfs.cat(cid);
    let data = "";
    let file = [];

    // Collect the streamed data
    for await (const chunk of fileStream) {
      data += chunk.toString();
      file.push(chunk);
    }

    // Determine if the data is a URL
    if (isValidUrl(data.trim())) {
      res.json({ type: "url", url: data.trim() });
    } else {
      const fileBuffer = Buffer.concat(file);
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${cid}"`,
      });
      res.end(fileBuffer);
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving data from IPFS" });
  }
});

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
};
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
