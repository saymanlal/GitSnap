document.addEventListener("DOMContentLoaded", () => {

    /* ---------- Protect Page ---------- */

    if (!AuthManager.isAuthenticated()) {
        window.location.href = "auth.html";
        return;
    }

    const user = AuthManager.getCurrentUser();

    document.getElementById("userNameDisplay").textContent =
        "👋 " + user.fullName;

    /* ---------- Logout ---------- */

    document.getElementById("logoutBtn").addEventListener("click", () => {
        AuthManager.logout();
    });

    /* ---------- Upload ---------- */

    const fileInput = document.getElementById("fileInput");
    const dropzone = document.getElementById("dropzone");
    const gallery = document.getElementById("galleryGrid");

    const STORAGE_KEY = "gallery_" + user.userId;

    dropzone.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {
        const files = Array.from(fileInput.files);

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = function (e) {

                const image = {
                    name: file.name,
                    src: e.target.result
                };

                const existing =
                    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

                existing.unshift(image);

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(existing)
                );

                loadGallery();
            };

            reader.readAsDataURL(file);
        });
    });

    /* ---------- Gallery ---------- */

    function loadGallery() {

        const images =
            JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        gallery.innerHTML = "";

        if (images.length === 0) {
            gallery.innerHTML =
                "<p>No images uploaded yet.</p>";
            return;
        }

        images.forEach((img, index) => {

            const card = document.createElement("div");
            card.className = "photo-card";

            card.innerHTML = `
                <img class="photo-img" src="${img.src}">
                <div class="photo-actions">
                    <span>${img.name}</span>
                    <button data-id="${index}" class="deleteBtn">
                        🗑️
                    </button>
                </div>
            `;

            gallery.appendChild(card);
        });

        document.querySelectorAll(".deleteBtn").forEach(btn => {
            btn.addEventListener("click", () => {

                const id = Number(btn.dataset.id);

                const images =
                    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

                images.splice(id, 1);

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(images)
                );

                loadGallery();
            });
        });
    }

    loadGallery();

});