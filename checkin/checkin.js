const BASE_URL = 
  "http://127.0.0.1:5000/api";

const token = 
  localStorage.getItem("token");

const user = 
  JSON.parse(
    localStorage.getItem("user")
  );

const form = 
  document.getElementById("checkinForm");

const messageDiv = 
  document.getElementById("message");

const successCard = 
  document.getElementById("successCard");

const checkinIdSpan = 
  document.getElementById("checkinId");

if (!token || !user) {
  window.location.href = "../auth/login.html";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const bookingId = 
    document.getElementById(
      "bookingId"
    ).value.trim();

  if (!bookingId) {
    showMessage(
      "Please enter a booking ID",
      "error"
    );
    return;
  }

  try {
    messageDiv.innerHTML = `
      <div class="loading">
        Initiating check-in...
      </div>
    `;

    const res = await fetch(
      `${BASE_URL}/checkins`,
      {
        method: "POST",
        headers: {
          "Content-Type": 
            "application/json",
          "Authorization": 
            `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: parseInt(bookingId),
        }),
      }
    );

    const data = 
      await res.json();

    if (!data.success) {
      showMessage(
        data.message || 
        "Failed to initiate check-in",
        "error"
      );
      return;
    }

    checkinIdSpan.textContent = 
      data.data.checkInId;

    form.parentElement.style.display = 
      "none";

    successCard.style.display = 
      "block";

    messageDiv.innerHTML = "";

  } catch (error) {
    console.error(error);
    showMessage(
      "Error: " + 
      error.message,
      "error"
    );
  }
});

function showMessage(
  message, 
  type
) {
  messageDiv.innerHTML = `
    <div class="message ${type}">
      ${message}
    </div>
  `;

  if (type === "error") {
    setTimeout(() => {
      messageDiv.innerHTML = "";
    }, 5000);
  }
}
