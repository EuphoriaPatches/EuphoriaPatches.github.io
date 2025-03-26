import fetch from "node-fetch";
import { AbortController } from "node-abort-controller";
import fs from 'fs/promises';
import path from 'path';

async function fetchWithTimeout(url, options = {}, timeout = 5000, responseType = "json") {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);

        if (responseType === "json") {
            return await response.json();
        } else if (responseType === "text") {
            return await response.text();
        } else {
            throw new Error(`Unsupported response type: ${responseType}`);
        }
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

async function countRegexMatches(fileUrl, regex) {
    try {
        const fileContent = await fetchWithTimeout(fileUrl, {}, 10000, "text");
        const matches = fileContent.match(regex) || [];
        return matches.length;
    } catch (error) {
        console.error("Error during regex matching:", error);
        return 0;
    }
}

async function updateDownloadStats() {
    const modrinthProjectId = "4H6sumDB";
    const curseforgeProjectId = "915902";

    const propertiesFileUrl = "https://raw.githubusercontent.com/EuphoriaPatches/propertiesFiles/main/block.properties";
    const propertiesRegex = /:(?![a-z_]+=)/g;

    console.time("Download Stats Update");

    try {
        console.time("Fetch Downloads");
        const [modrinthDownloads, curseforgeDownloads, matchesLength] = await Promise.all([
            fetchModrinthDownloads(modrinthProjectId),
            fetchCurseforgeDownloads(curseforgeProjectId),
            countRegexMatches(propertiesFileUrl, propertiesRegex),
        ]);
        console.timeEnd("Fetch Downloads");

        const totalDownloads = modrinthDownloads + curseforgeDownloads;
        const currentTimestamp = Date.now();
        
        // Ensure the data directory exists
        const dataDir = './assets/data';
        await fs.mkdir(dataDir, { recursive: true });
        
        // Path to the JSON stats file
        const statsFilePath = path.join(dataDir, 'download-stats.json');
        
        // Read existing data if available
        let previousData = { 
            totalDownloads: 0,
            modrinthDownloads: 0, 
            curseforgeDownloads: 0,
            yesterdayDownloads: 0,
            timestamp: 0
        };
        
        try {
            const fileExists = await fs.access(statsFilePath)
                .then(() => true)
                .catch(() => false);
                
            if (fileExists) {
                const fileContent = await fs.readFile(statsFilePath, 'utf8');
                previousData = JSON.parse(fileContent);
            }
        } catch (error) {
            console.error("Error reading previous stats:", error);
            // Continue with default values if file read fails
        }

        // Calculate download difference since last update
        const downloadDifference = totalDownloads - previousData.totalDownloads;

        // Create new stats object
        const newStats = {
            timestamp: currentTimestamp,
            lastUpdated: new Date().toISOString(),
            totalDownloads,
            modrinthDownloads,
            curseforgeDownloads,
            yesterdayDownloads: downloadDifference > 0 ? downloadDifference : 0,
            matchesLength
        };

        // Write to JSON file
        await fs.writeFile(statsFilePath, JSON.stringify(newStats, null, 2));

        console.log("Download counts updated:", newStats);
    } catch (error) {
        console.error("Error updating download stats:", error);
        throw error;
    }

    console.timeEnd("Download Stats Update");
}

updateDownloadStats()
    .then(() => {
        console.log("Script completed successfully.");
        process.exit(0); // Exit cleanly
    })
    .catch((err) => {
        console.error("Fatal error in updateDownloadStats:", err);
        process.exit(1); // Exit with error code
    });