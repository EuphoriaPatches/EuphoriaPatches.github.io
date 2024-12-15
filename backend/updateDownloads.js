// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBheyXP71wW38Pr1Pz7td5fA1ceNF7I-4U",
    authDomain: "ep-website-backend.firebaseapp.com",
    databaseURL: "https://ep-website-backend-default-rtdb.firebaseio.com",
    projectId: "ep-website-backend",
    storageBucket: "ep-website-backend.appspot.com",
    messagingSenderId: "527249989649",
    appId: "1:527249989649:web:7c4913be47d320cbb891b0",
    measurementId: "G-W72RZF1WBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Fetch Modrinth Downloads
async function fetchModrinthDownloads(projectId) {
    try {
        const response = await fetch(`https://api.modrinth.com/v2/project/${projectId}`);
        const data = await response.json();
        return data.downloads || 0;
    } catch (error) {
        console.error('Error fetching Modrinth downloads:', error);
        return 0;
    }
}

// Fetch CurseForge Downloads
async function fetchCurseforgeDownloads(projectId) {
    try {
        const response = await fetch(`https://api.curseforge.com/v1/mods/${projectId}`, {
            headers: {
                'Accept': 'application/json',
                'x-api-key': '$2a$10$izPaCsTGxUGv.3h62ZixYelNErqfLizoCjVJphyCNFs00riMLc5wK'
            }
        });                
        const data = await response.json();
        return data.data.downloadCount || 0;
    } catch (error) {
        console.error('Error fetching Curseforge downloads:', error);
        return 0;
    }
}

async function updateDownloadCounter() {
    const modrinthProjectId = '4H6sumDB';
    const curseforgeProjectId = '915902';

    try {
        const modrinthDownloads = await fetchModrinthDownloads(modrinthProjectId);
        const curseforgeDownloads = await fetchCurseforgeDownloads(curseforgeProjectId);
        const totalDownloads = modrinthDownloads + curseforgeDownloads;

        console.log(`Modrinth Downloads: ${modrinthDownloads}`);
        console.log(`Curseforge Downloads: ${curseforgeDownloads}`);
        console.log(`Total Downloads: ${totalDownloads}`);

        const currentTimestamp = Date.now();
        const dbRef = ref(database, 'totals');

        // Fetch previous data from the database
        const snapshot = await get(dbRef);
        const previousData = snapshot.exists() ? snapshot.val() : { 
            timestamp: currentTimestamp, 
            totalDownloads: totalDownloads, 
            yesterdayDownloads: 0
        };

        const downloadDifference = totalDownloads - previousData.totalDownloads;

        // Save the updated data to the database
        await set(dbRef, {
            timestamp: currentTimestamp,
            totalDownloads: totalDownloads,
            yesterdayDownloads: downloadDifference > 0 ? downloadDifference : yesterdayDownloads
        });

        console.log('Download counts updated:', {
            timestamp: currentTimestamp,
            totalDownloads,
            yesterdayDownloads: downloadDifference,
        });

    } catch (error) {
        console.error('Error updating download counter:', error);
        document.getElementById('download-counter').innerText = 'Error';
    }
}

// Call the function
updateDownloadCounter();