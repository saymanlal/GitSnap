// This file handles all GitHub operations - users never see these details
const STORAGE_CONFIG = {
    owner: 'YOUR_GITHUB_USERNAME',  // ← CHANGE THIS
    repo: 'gitsnap-images',          // ← CREATE THIS REPO  
    token: 'YOUR_GITHUB_TOKEN'       // ← GENERATE THIS
};

class ImageStorage {
    static async uploadImages(files, userId) {
        const uploaded = [];
        for (const file of files) {
            const reader = new FileReader();
            const content = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result.split(',')[1]);
                reader.readAsDataURL(file);
            });
            
            const path = `users/${userId}/${Date.now()}_${file.name}`;
            const response = await fetch(`https://api.github.com/repos/${STORAGE_CONFIG.owner}/${STORAGE_CONFIG.repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${STORAGE_CONFIG.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Upload ${file.name} by ${userId}`,
                    content: content
                })
            });
            
            if (response.ok) uploaded.push({ name: file.name, path: path });
        }
        return uploaded;
    }
    
    static async getUserImages(userId) {
        const folderPath = `users/${userId}`;
        const response = await fetch(`https://api.github.com/repos/${STORAGE_CONFIG.owner}/${STORAGE_CONFIG.repo}/contents/${folderPath}`, {
            headers: { 'Authorization': `token ${STORAGE_CONFIG.token}` }
        });
        
        if (!response.ok) return [];
        const files = await response.json();
        return files.filter(f => f.type === 'file').map(f => ({
            name: f.name,
            url: f.download_url,
            path: f.path,
            size: f.size
        }));
    }
    
    static async deleteImage(path) {
        // Get file SHA first
        const getResp = await fetch(`https://api.github.com/repos/${STORAGE_CONFIG.owner}/${STORAGE_CONFIG.repo}/contents/${path}`, {
            headers: { 'Authorization': `token ${STORAGE_CONFIG.token}` }
        });
        const fileData = await getResp.json();
        
        const response = await fetch(`https://api.github.com/repos/${STORAGE_CONFIG.owner}/${STORAGE_CONFIG.repo}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${STORAGE_CONFIG.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete ${path}`,
                sha: fileData.sha
            })
        });
        
        return response.ok;
    }
}