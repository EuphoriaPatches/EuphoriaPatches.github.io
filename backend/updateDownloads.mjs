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

async function updatePropertiesFile(fileUrl) {
    try {
        // Fetch the latest properties file
        const fileContent = await fetchWithTimeout(fileUrl, {}, 10000, "text");
        
        // Ensure directory exists
        const dataDir = './assets/data';
        await fs.mkdir(dataDir, { recursive: true });
        
        // Save to local file
        const localFilePath = path.join(dataDir, 'block.properties');
        await fs.writeFile(localFilePath, fileContent);
        
        console.log("Properties file updated successfully");
        return fileContent;
    } catch (error) {
        console.error("Error updating properties file:", error);
        
        // Try to return existing file if available
        try {
            const localFilePath = path.join('./assets/data', 'block.properties');
            return await fs.readFile(localFilePath, 'utf8');
        } catch (fallbackError) {
            console.error("Could not read existing properties file:", fallbackError);
            return "";
        }
    }
}

async function countRegexMatches(fileUrl, regex) {
    try {
        // First update the local properties file
        const fileContent = await updatePropertiesFile(fileUrl);
        
        // Then perform regex matching on the content
        const matches = fileContent.match(regex) || [];
        return matches.length;
    } catch (error) {
        console.error("Error during regex matching:", error);
        return 0;
    }
}

async function countUniqueModdedBlocks(fileUrl) {
    try {
        // First update the local properties file
        const fileContent = await updatePropertiesFile(fileUrl);
        
        // Set to store unique modded blocks (mod:block format)
        const uniqueModdedBlocks = new Set();
        
        // Split by lines
        const lines = fileContent.split('\n');
        
        // Process each line
        for (let line of lines) {
            line = line.trim();
            
            // Skip empty lines, comments, preprocessor directives
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            
            // Extract all potential block IDs
            // First check if we're in a block definition 
            if (line.startsWith('block.')) {
                // Extract everything after the equals sign
                const equalSignIndex = line.indexOf('=');
                if (equalSignIndex > 0) {
                    line = line.substring(equalSignIndex + 1).trim();
                }
            }
            
            // Skip if just a backslash
            if (line === '\\') {
                continue;
            }
            
            // Split into potential block IDs
            const potentialIds = line.split(/\s+/);
            
            for (let id of potentialIds) {
                // Skip empty, backslash, or tag identifiers
                if (!id || id === '\\' || id.startsWith('%') || id.startsWith('tags_')) {
                    continue;
                }
                
                // Check if it could be a modded block (contains a colon)
                if (id.includes(':')) {
                    // Extract the mod name and block name
                    const parts = id.split(':');
                    
                    // If it has at least 2 parts and the first part isn't a blockstate
                    if (parts.length >= 2 && !parts[0].includes('=')) {
                        // Create the base mod:block identifier without blockstate
                        const modBlockId = parts[0] + ':' + parts[1];
                        uniqueModdedBlocks.add(modBlockId);
                    }
                }
            }
        }
        
        console.log(`Found ${uniqueModdedBlocks.size} unique modded blocks`);
        return uniqueModdedBlocks.size;
    } catch (error) {
        console.error("Error counting modded blocks:", error);
        return 0;
    }
}

async function updateDownloadStats() {
    const modrinthProjectId = "4H6sumDB";
    const curseforgeProjectId = "915902";
    const propertiesFileUrl = "https://raw.githubusercontent.com/EuphoriaPatches/propertiesFiles/main/block.properties";
    
    console.time("Download Stats Update");
    
    // Retry wait times in minutes
    const retryWaitTimes = [10, 15, 20, 25, 30];
    let attempt = 0;
    let valid = false;
    
    // Load existing data first
    const dataDir = './assets/data';
    await fs.mkdir(dataDir, { recursive: true });
    const statsFilePath = path.join(dataDir, 'download-stats.json');
    
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
    }
    
    // Try fetching data with retries
    while (attempt <= retryWaitTimes.length && !valid) {
        try {
            console.time("Fetch Downloads");
            const [modrinthDownloads, curseforgeDownloads, matchesLength] = await Promise.all([
                fetchModrinthDownloads(modrinthProjectId),
                fetchCurseforgeDownloads(curseforgeProjectId),
                countUniqueModdedBlocks(propertiesFileUrl),
            ]);
            console.timeEnd("Fetch Downloads");

            const totalDownloads = modrinthDownloads + curseforgeDownloads;
            const downloadDifference = totalDownloads - previousData.totalDownloads;
            
            // Check if we have valid data (download count increased)
            if (downloadDifference > 0) {
                const currentTimestamp = Date.now();
                
                // Create new stats object
                const newStats = {
                    timestamp: currentTimestamp,
                    lastUpdated: new Date().toISOString(),
                    totalDownloads,
                    modrinthDownloads,
                    curseforgeDownloads,
                    yesterdayDownloads: downloadDifference,
                    matchesLength
                };

                // Write to JSON file
                await fs.writeFile(statsFilePath, JSON.stringify(newStats, null, 2));
                console.log("Download counts updated:", newStats);
                valid = true;
                break;
            } else {
                console.warn(`Invalid download difference: ${downloadDifference}. API may be down.`);
                
                if (attempt < retryWaitTimes.length) {
                    const waitMinutes = retryWaitTimes[attempt];
                    const now = new Date();
                    const nextRetry = new Date(now.getTime() + waitMinutes * 60 * 1000);
                    
                    console.log(
                        `Current time: ${now.toISOString()}\n` +
                        `Retrying in ${waitMinutes} minutes at ${nextRetry.toISOString()}...`
                    );
                    
                    await new Promise(resolve => setTimeout(resolve, waitMinutes * 60 * 1000));
                } else {
                    console.error("All retry attempts failed. No updates were made to the stats file.");
                }
            }
        } catch (error) {
            console.error(`Error during attempt ${attempt + 1}:`, error);
        }
        
        attempt++;
    }
    
    console.timeEnd("Download Stats Update");
    return valid;
}

updateDownloadStats()
    .then((success) => {
        console.log(success ? "Script completed successfully." : "Script completed but no updates were made.");
        process.exit(success ? 0 : 1);
    })
    .catch((err) => {
        console.error("Fatal error in updateDownloadStats:", err);
        process.exit(1);
    });