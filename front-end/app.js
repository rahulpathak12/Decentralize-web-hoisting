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

  const fileInput = document.getElementById("fileInput").files[0];
  const formData = new FormData();
  formData.append("file", fileInput);
  // formData.append("username", loggedInUsername); // Assuming you store logged-in user's username

  try {
      const response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
      });

      const result = await response.json();
      if (response.ok) {
          document.getElementById("status").textContent = `Success! CID: ${result.cid}`;
      } else {
          document.getElementById("status").textContent = "Upload failed. Please try again.";
      }
  } catch (error) {
      document.getElementById("status").textContent = "Error occurred: " + error.message;
  }
});
