// Funksioni Toastify per Alerta
function showToast(message, type = "info") {
    Toastify({
        text: message,
        gravity: "top", 
        position: "right",
        backgroundColor: type === "success" ? "green" : type === "error" ? "red" : "blue",
        duration: 3000, 
        close: true,
        stopOnFocus: true, 
        offset: {
            x: 10, 
            y: 10, 
        },
    }).showToast();
}

// Fillon me array te that
let selectedCandidates = [];

// Lejimi i votimit
document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (!username || !password) {
        showToast("You must log in to vote!", "error");
        window.location.href = "main.html"; 
        return;
    }

    fetchCandidates();
});

// Marja e kandidateve 
function fetchCandidates() {
    fetch("http://localhost:3000/candidates")
        .then(response => response.json())
        .then(data => displayCandidates(data.candidates))
        .catch(error => {
            console.error("Error fetching candidates:", error);
            showToast("An error occurred while fetching candidates.", "error");
        });
}

// Shfaqja visuale e secilit kandidateve
function displayCandidates(candidates) {
    const candidatesList = document.getElementById("candidatesList");
    candidatesList.innerHTML = ""; 

    candidates.forEach(candidate => {
        const candidateCard = document.createElement("div");
        candidateCard.classList.add("candidate-card");

        candidateCard.innerHTML = `
            <h3>${candidate.name}</h3>
            <p>${candidate.description || "No description available"}</p>
            <p>Votes: <span id="votes-${candidate._id}">${candidate.votes}</span></p>
            <input type="checkbox" class="vote-checkbox" value="${candidate._id}">
        `;

        candidatesList.appendChild(candidateCard);
    });

    document.querySelectorAll(".vote-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", handleCheckboxChange);
    });

    const submitButton = document.getElementById("submitVote");
    submitButton.disabled = true;
    submitButton.addEventListener("click", submitVote);
}

// Lejimi i votimit te 3 kandidateve
function handleCheckboxChange(event) {
    const candidateId = event.target.value;

    if (event.target.checked) {
        if (selectedCandidates.length >= 3) {
            event.target.checked = false;
            showToast("You can only vote for 3 candidates!", "error");
        } else {
            selectedCandidates.push(candidateId);
        }
    } else {
        selectedCandidates = selectedCandidates.filter(id => id !== candidateId);
    }

    document.getElementById("submitVote").disabled = selectedCandidates.length !== 3;
}

// Funksioni i submitit te voteve
async function submitVote() {
    if (selectedCandidates.length !== 3) {
        showToast("You must select exactly 3 candidates.", "error");
        return;
    }

    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");

    if (!storedUsername || !storedPassword) {
        showToast("You need to log in before voting.", "error");
        window.location.href = "main.html";
        return;
    }

    const submitButton = document.getElementById("submitVote");

    try {
      
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        const response = await fetch("http://localhost:3000/vote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: storedUsername,
                password: storedPassword,
                candidateIds: selectedCandidates,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Vote submitted successfully!", "success");
            selectedCandidates = [];
            fetchCandidates(); 
        } else {
            showToast(`Error: ${data.message}`, "error");
        }
    } catch (error) {
        console.error("Error submitting vote:", error);
        showToast("An error occurred while submitting your vote.", "error");
    } finally {
    
        submitButton.disabled = false;
        submitButton.textContent = "Submit Vote";
    }
}
