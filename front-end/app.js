// Event listener to show login form when "Login" button is clicked
document.getElementById("goToLogin").addEventListener("click", () => {
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
});

// Register Form Submission
document.getElementById("register").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  try {
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    if (response.ok) {
      document.getElementById("registerStatus").textContent =
        "Registration successful!";
      document.getElementById("registerForm").style.display = "none";
      document.getElementById("loginForm").style.display = "block";
    } else {
      document.getElementById("registerStatus").textContent =
        result.message || "Registration failed";
    }
  } catch (error) {
    document.getElementById("registerStatus").textContent =
      "Error occurred: " + error.message;
  }
});

// Login Form Submission
document.getElementById("login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const credentials = {
    username: document.getElementById("loginUsername").value,
    password: document.getElementById("loginPassword").value,
  };

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    if (response.ok) {
      document.getElementById("loginStatus").textContent = "Login successful!";
      document.getElementById("loginForm").style.display = "none";
      document.getElementById("uploadForm").style.display = "block";
    } else {
      document.getElementById("loginStatus").textContent =
        result.message || "Login failed";
    }
  } catch (error) {
    document.getElementById("loginStatus").textContent =
      "Error occurred: " + error.message;
  }
});

// File Upload
document.getElementById("upload").addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("websiteUrl").value;
  const username = document.getElementById("username").value; // Assuming you have a username field
  const file = document.getElementById("fileInput").files[0];
  console.log("filr", file);

  if (url) {
    const data = {
      username: username,
      url: url,
    };

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        document.getElementById(
          "status"
        ).textContent = `Success! CID: ${result.cid}`;
      } else {
        document.getElementById("status").textContent =
          "Upload failed. Please try again.";
      }
    } catch (error) {
      document.getElementById("status").textContent =
        "Error occurred: " + error.message;
    }
  } else if (file) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        document.getElementById(
          "status"
        ).textContent = `Success! CID: ${result.cid}`;
      } else {
        document.getElementById("status").textContent =
          "Upload failed. Please try again.";
      }
    } catch (error) {
      document.getElementById("status").textContent =
        "Error occurred: " + error.message;
    }
  } else {
    document.getElementById("status").textContent =
      "Please provide a URL or select a file.";
    return;
  }
});

// Retrieve File or URL from IPFS
document.getElementById("getFileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const cid = document.getElementById("cidInput").value;

  try {
    const response = await fetch(`http://localhost:5000/getData/${cid}`);

    if (response.ok) {
      const contentType = response.headers.get("Content-Type");

      if (contentType.includes("application/json")) {
        const result = await response.json();
        console.log(result.url);

        if (result.type === "url") {
          const urlLink = document.getElementById("urlLink");
          urlLink.innerHTML = `<a href="${result.url}" target="_blank">Click here to visit the URL</a>`;
          urlLink.style.display = "block";
          document.getElementById("downloadLink").style.display = "none";
        }
      } else {
        // This handles file download
        const blob = await response.blob();
        const downloadLink = document.getElementById("downloadLink");
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = cid;
        downloadLink.textContent = "Download File";
        downloadLink.style.display = "block";
        document.getElementById("urlLink").style.display = "none";
      }
    } else {
      alert("Failed to retrieve data. Please try again.");
    }
  } catch (error) {
    alert("Error occurred: " + error.message);
  }
});
