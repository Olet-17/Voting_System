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

    if (!username) {
        showToast("You must log in to vote!", "error");
        window.location.href = "main.html"; 
        return;
    }

    fetchCandidates();
});
document.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem("username");
    console.log("Username from localStorage:", username);

    if (!username) {
        console.error("No username found in localStorage. Redirecting...");
        window.location.href = "main.html";
    } else {
        console.log("User is logged in as:", username);
    }
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
    const username = localStorage.getItem("username");

    if (!username) {
        showToast("You need to log in before voting.", "error");
        window.location.href = "main.html";
        return;
    }

    const response = await fetch("http://localhost:3000/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            candidateIds: selectedCandidates, // Only send username and candidate IDs
        }),
    });

    const data = await response.json();

    if (response.ok) {
        showToast("Vote submitted successfully!", "success");
        selectedCandidates = [];
        fetchCandidates(); // Refresh candidate data
    } else {
        showToast(data.message || "Failed to submit your vote.", "error");
    }
}