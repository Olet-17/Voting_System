// Funksionet Toastify per alerta
function showToast(message, type = "info") {
    Toastify({
        text: message,
        gravity: "top", 
        position: "right", 
        backgroundColor: type === "success" ? "green" : type === "error" ? "red" : "blue",
        duration: 3000, 
        stopOnFocus: true, 
    }).showToast();
}


function setLoadingState(button, isLoading, defaultText) {
    if (isLoading) {
        button.disabled = true;
        button.textContent = "Loading...";
    } else {
        button.disabled = false;
        button.textContent = defaultText;
    }
}
// Funksioni i regjistrimit te votuesve

async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const registerButton = document.querySelector('button[onclick="register()"]');

    if (!username || !password) {
        showToast("Please fill in both fields!", "error");
        return;
    }

    try {
        
        registerButton.disabled = true;
        registerButton.textContent = "Registering...";

        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Registration successful! Please log in.", "success");
            window.location.href = "main.html";
        } else {
            showToast(data.message || "Registration failed.", "error");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        showToast("An error occurred. Please try again.", "error");
    } finally {
        
        registerButton.disabled = false;
        registerButton.textContent = "Register";
    }
}

// Funksioni i login ku e bon check ne databaz a ka user me at username the password ose nese eshte admin admin te dergohet ne faqen e shtimit te kandidateve
async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const loginButton = document.querySelector('button[onclick="login()"]');

    if (!username || !password) {
        showToast("Please fill in both fields!", "error");
        return;
    }


    if (username === "admin" && password === "admin") {
        showToast("Admin login successful!", "success");
        window.location.href = "index.html"; 
        return;
    }

    try {
       
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Login successful!", "success");
            localStorage.setItem("username", username);
            window.location.href = "user-page.html";
        } else {
            showToast(data.message || "Invalid username or password.", "error");
        }
    } catch (error) {
        console.error("Error during login:", error);
        showToast("An error occurred. Please try again.", "error");
    } finally {
       
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
}

