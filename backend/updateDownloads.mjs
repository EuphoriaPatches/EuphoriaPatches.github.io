import admin from "firebase-admin";
import fetch from "node-fetch";
import { AbortController } from "node-abort-controller";

// Firebase Admin Service Account credentials from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://ep-website-backend-default-rtdb.firebaseio.com",
    });
}

const db = admin.database();

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`Error fetching ${url}:`, error.message);
        throw error;
    }
}

async function fetchModrinthDownloads(projectId) {
    const url = `https://api.modrinth.com/v2/project/${projectId}`;
    try {
        const data = await fetchWithTimeout(url);
        return data.downloads || 0;
    } catch (error) {
        console.error("Error fetching Modrinth downloads:", error);
        return 0;
    }
}

async function fetchCurseforgeDownloads(projectId) {
    const url = `https://api.curseforge.com/v1/mods/${projectId}`;
    try {
        const data = await fetchWithTimeout(
            url,
            {
                headers: {
                    "Accept": "application/json",
                    "x-api-key": process.env.CURSEFORGE_API_KEY,
                },
            }
        );
        return data.data.downloadCount || 0;
    } catch (error) {
        console.error("Error fetching Curseforge downloads:", error);
        return 0;
    }
}

async function updateDownloadCounts() {
    const modrinthProjectId = "4H6sumDB";
    const curseforgeProjectId = "915902";

    console.time("Update Downloads Script");

    try {
        console.time("Fetch Downloads");
        const [modrinthDownloads, curseforgeDownloads] = await Promise.all([
            fetchModrinthDownloads(modrinthProjectId),
            fetchCurseforgeDownloads(curseforgeProjectId),
        ]);
        console.timeEnd("Fetch Downloads");

        const totalDownloads = modrinthDownloads + curseforgeDownloads;
        const currentTimestamp = Date.now();

        console.time("Fetch Firebase Data");
        const ref = db.ref("totals");
        const snapshot = await ref.once("value");
        console.timeEnd("Fetch Firebase Data");

        const previousData = snapshot.exists() ? snapshot.val() : { totalDownloads: 0 };
        const downloadDifference = totalDownloads - previousData.totalDownloads;

        console.time("Set Firebase Data");
        await ref.set({
            timestamp: currentTimestamp,
            totalDownloads,
            yesterdayDownloads: downloadDifference > 0 ? downloadDifference : 0,
        });
        console.timeEnd("Set Firebase Data");

        console.log("Download counts updated:", {
            timestamp: currentTimestamp,
            totalDownloads,
            yesterdayDownloads: downloadDifference,
        });
    } catch (error) {
        console.error("Error updating download counts:", error);
        throw error;
    }

    console.timeEnd("Update Downloads Script");
}

updateDownloadCounts().catch((err) => {
    console.error("Fatal error in updateDownloadCounts:", err);
});
