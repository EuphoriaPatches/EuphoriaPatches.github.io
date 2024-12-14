const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fetch = require('node-fetch');

// Firebase Admin Service Account credentials from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase
initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://ep-website-backend-default-rtdb.firebaseio.com",
});

const db = getDatabase();

async function fetchModrinthDownloads(projectId) {
    const response = await fetch(`https://api.modrinth.com/v2/project/${projectId}`);
    const data = await response.json();
    return data.downloads || 0;
}

async function fetchCurseforgeDownloads(projectId) {
    const response = await fetch(`https://api.curseforge.com/v1/mods/${projectId}`, {
        headers: { 'x-api-key': process.env.CURSEFORGE_API_KEY }
    });
    const data = await response.json();
    return data.data.downloadCount || 0;
}

async function updateDownloadCounts() {
    const modrinthProjectId = '4H6sumDB';
    const curseforgeProjectId = '915902';

    // Fetch downloads from both platforms
    const modrinthDownloads = await fetchModrinthDownloads(modrinthProjectId);
    const curseforgeDownloads = await fetchCurseforgeDownloads(curseforgeProjectId);
    const totalDownloads = modrinthDownloads + curseforgeDownloads;

    const currentTimestamp = Date.now();

    // Get existing data from Firebase
    const ref = db.ref('totals');
    const snapshot = await ref.once('value');
    const previousData = snapshot.exists() ? snapshot.val() : { totalDownloads: 0 };

    // Calculate download difference
    const downloadDifference = totalDownloads - previousData.totalDownloads;

    // Update Firebase with the new data
    await ref.set({
        timestamp: currentTimestamp,
        totalDownloads: totalDownloads,
        yesterdayDownloads: downloadDifference > 0 ? downloadDifference : 0,
    });

    console.log('Download counts updated:', {
        timestamp: currentTimestamp,
        totalDownloads,
        yesterdayDownloads: downloadDifference,
    });
}

updateDownloadCounts().catch((err) => {
    console.error('Error updating download counts:', err);
});
