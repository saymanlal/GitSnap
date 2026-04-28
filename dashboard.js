// Check authentication
if (!AuthManager.isAuthenticated()) {
    window.location.href = 'auth.html';
}

const currentUser = AuthManager.getCurrentUser();
document.getElementById('userNameDisplay').textContent = `👋 ${currentUser.fullName}`;

let pendingFiles = [];

// Dropzone handling
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    addToQueue(files);
});

fileInput.addEventListener('change', (e) => {
    addToQueue(Array.from(e.target.files));
    fileInput.value = '';
});

function addToQueue(files) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    for (const file of files) {
        if (!allowed.includes(file.type)) {
            showToast(`${file.name} not supported`, true);
            continue;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast(`${file.name} exceeds 10MB`, true);
            continue;
        }
        pendingFiles.push(file);
    }
    updateQueueUI();
}

function updateQueueUI() {
    const preview = document.getElementById('queuePreview');
    if (pendingFiles.length === 0) {
        preview.innerHTML = '';
        return;
    }
    preview.innerHTML = `<div class="queue-badge">📦 ${pendingFiles.length} image(s) ready to upload</div>`;
}

document.getElementById('clearQueueBtn').onclick = () => {
    pendingFiles = [];
    updateQueueUI();
    showToast('Queue cleared');
};

document.getElementById('uploadAllBtn').onclick = async () => {
    if (pendingFiles.length === 0) {
        showToast('No files to upload', true);
        return;
    }
    
    const btn = document.getElementById('uploadAllBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Uploading...';
    
    try {
        await ImageStorage.uploadImages(pendingFiles, currentUser.userId);
        showToast(`✅ Uploaded ${pendingFiles.length} images!`);
        pendingFiles = [];
        updateQueueUI();
        await loadGallery();
    } catch (err) {
        showToast('Upload failed: ' + err.message, true);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Upload All Images';
    }
};

async function loadGallery() {
    const gallery = document.getElementById('galleryGrid');
    gallery.innerHTML = '<div class="loading-spinner">📸 Loading your photos...</div>';
    
    try {
        const images = await ImageStorage.getUserImages(currentUser.userId);
        
        if (images.length === 0) {
            gallery.innerHTML = '<div class="empty-gallery">✨ No photos yet. Upload your first image!</div>';
            return;
        }
        
        gallery.innerHTML = '';
        for (const img of images) {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.innerHTML = `
                <img class="photo-img" src="${img.url}" alt="${img.name}" loading="lazy">
                <div class="photo-actions">
                    <span class="photo-name">${img.name.substring(0, 20)}</span>
                    <button class="btn-download" data-url="${img.url}" data-name="${img.name}">⬇️</button>
                    <button class="btn-delete" data-path="${img.path}">🗑️</button>
                </div>
            `;
            gallery.appendChild(card);
        }
        
        // Attach download handlers
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.onclick = async () => {
                const url = btn.dataset.url;
                const name = btn.dataset.name;
                const response = await fetch(url);
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = name;
                link.click();
                URL.revokeObjectURL(link.href);
            };
        });
        
        // Attach delete handlers
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = async () => {
                if (confirm('Delete this image permanently?')) {
                    await ImageStorage.deleteImage(btn.dataset.path);
                    await loadGallery();
                    showToast('Image deleted');
                }
            };
        });
        
    } catch (err) {
        gallery.innerHTML = '<div class="error">Failed to load gallery</div>';
        showToast(err.message, true);
    }
}

document.getElementById('refreshGalleryBtn').onclick = loadGallery;
document.getElementById('logoutBtn').onclick = () => AuthManager.logout();

// Initial load
loadGallery();