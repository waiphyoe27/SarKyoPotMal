// Scroll-based fade-in animation
const fadeEls = document.querySelectorAll(".fade-up");
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    { threshold: 0.1 },
);

fadeEls.forEach((el) => {
    observer.observe(el);
});

// Optional: add a class on page load
window.addEventListener("load", () => {
    document.body.classList.add("loaded");
});

// Carousel Functionality
let currentPhotoIndex = 0;
let carouselInterval;

function initializeCarousel() {
    const photos = document.querySelectorAll(".inside-photo");

    if (photos.length === 0) return;

    // Ensure first photo is active
    photos[0].classList.add("active");

    function showNextPhoto() {
        photos[currentPhotoIndex].classList.remove("active");
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
        photos[currentPhotoIndex].classList.add("active");
    }

    // Start carousel after a short delay
    setTimeout(() => {
        carouselInterval = setInterval(showNextPhoto, 3000);
    }, 1000);
}

// Initialize carousel when page loads
window.addEventListener("load", initializeCarousel);

// === Schedule Message Form Handler ===
document.addEventListener("DOMContentLoaded", () => {
    const scheduleForm = document.getElementById("scheduleForm");
    if (scheduleForm) {
        scheduleForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const phone = document.getElementById("phone").value;
            const message = document.getElementById("message").value;
            const schedule = document.getElementById("scheduleTime").value;

            try {
                const res = await fetch("/api/schedule", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone, message, schedule }),
                });

                const data = await res.json();
                document.getElementById("scheduleResponse").innerHTML = `
          ✅ Your message has been scheduled.<br>
          🔐 Tracking Code: <strong>${data.code}</strong>
        `;
                scheduleForm.reset();
            } catch (err) {
                document.getElementById("scheduleResponse").innerHTML =
                    `❌ Something went wrong. Please try again.`;
            }
        });
    }
});

// Track Page Script
function initTrackPage() {
    const trackBtn = document.getElementById("trackBtn");
    if (!trackBtn) return; // Only run on track.html

    trackBtn.addEventListener("click", async () => {
        const code = document
            .getElementById("codeInput")
            .value.trim()
            .toUpperCase();
        const resultDiv = document.getElementById("result");

        // ✅ New validation for alphanumeric 6-digit codes
        if (!/^[A-Z0-9]{6}$/.test(code)) {
            resultDiv.innerHTML =
                '<p style="color: red;">Please enter a valid 6-digit code.</p>';
            return;
        }

        try {
            const res = await fetch(`/track/${code}`);
            if (res.ok) {
                const data = await res.json();
                resultDiv.innerHTML = `
          <div class="message-card fade-up visible">
              <button class="dismiss-btn" onclick="this.parentElement.remove()">×</button>
              <h3>🎉 Message Found</h3>
              <p><strong>Message:</strong> ${data.message}</p>
              <p><strong>Scheduled Time:</strong><br>${data.time}</p>
              <p><strong>Status:</strong> ${data.status}</p>
            </div>
        `;
            } else {
                resultDiv.innerHTML =
                    '<p style="color: red;">No message found for this code.</p>';
            }
        } catch (err) {
            resultDiv.innerHTML =
                '<p style="color: red;">Error fetching message.</p>';
        }
    });
}

// Initialize on load
document.addEventListener("DOMContentLoaded", initTrackPage);
