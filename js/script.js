    // Funksioni Toastify per Alerta
    function showToast(message, type = "info") {
        Toastify({
            text: message,
            gravity: "top", 
            position: "right", 
            backgroundColor: type === "success" ? "green" : type === "error" ? "red" : "blue",
            duration: 3000, 
            stopOnFocus: true, 
            close: true, 
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

    // Funksioni i shtimit te kandidateve ku lejon shtimin e tyre
    async function addCandidate() {
        const name = document.getElementById("candidateName").value.trim();
        const description = document.getElementById("candidateDescription").value.trim();
        const infoLink = document.getElementById("candidateInfoLink").value.trim();
        const submitButton = document.querySelector('button[type="submit"]');

        if (!name || !description || !infoLink) {
            showToast("All fields are required!", "error");
            return;
        }

        setLoadingState(submitButton, true, "Submit");

        try {
            const response = await fetch("http://localhost:3000/candidates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, description, infoLink }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast("Candidate added successfully!", "success");
                document.getElementById("addCandidateForm").reset(); 
            } else {
                showToast(data.message || "Failed to add candidate.", "error");
            }
        } catch (error) {
            console.error("Error adding candidate:", error);
            showToast("An error occurred. Please try again.", "error");
        } finally {
            setLoadingState(submitButton, false, "Submit");
        }
    }

    // Thirja e funksionit
    document.getElementById("addCandidateForm").addEventListener("submit", function (event) {
        event.preventDefault();
        addCandidate();
    });
