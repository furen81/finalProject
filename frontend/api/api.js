import axios from "axios";
import * as FileSystem from "expo-file-system";
// import { API_BASE_URL } from "@env";

const API_BASE_URL = "https://localhost:5000";
const DIRECTORY_PATH = `${FileSystem.documentDirectory}WoodBlockApp/`;
const UPLOAD_FOLDER = `${DIRECTORY_PATH}upload/`;
const RESULT_FOLDER = `${DIRECTORY_PATH}result/`;
const JSON_FILE_PATH = `${DIRECTORY_PATH}data.json`;

const ensureDirectoryExists = async (directory) => {
    const dirInfo = await FileSystem.getInfoAsync(directory);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }
};

const updateDataJson = async (uploadedImagePath, resultImagePath, resultData) => {
    const fileInfo = await FileSystem.getInfoAsync(JSON_FILE_PATH);
    let existingData = [];

    if (fileInfo.exists) {
        const jsonData = await FileSystem.readAsStringAsync(JSON_FILE_PATH);
        existingData = JSON.parse(jsonData);
    }

    // Add the new entry at the beginning
    const newEntry = {
        uploaded_image_path: uploadedImagePath,
        result_image_path: resultImagePath,
        result: resultData,
    };

    existingData.unshift(newEntry); // Add to the start of the array (newest first)

    // If more than 50 entries, remove the oldest one
    if (existingData.length > 50) {
        const removedEntry = existingData.pop(); // Remove the oldest entry (last in the array)

        // Delete the corresponding images of the removed entry
        await deleteFile(removedEntry.uploaded_image_path);
        await deleteFile(removedEntry.result_image_path);
    }

    // Write updated data back to data.json
    await FileSystem.writeAsStringAsync(JSON_FILE_PATH, JSON.stringify(existingData, null, 2));
};

// Function to delete a file
const deleteFile = async (filePath) => {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
    }
};

const saveBase64ImageLocally = async (base64Image, path) => {
    const base64Data = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    await FileSystem.writeAsStringAsync(path, base64Data, { encoding: FileSystem.EncodingType.Base64 });
};

const saveImageLocally = async (uri, path) => {
    await FileSystem.copyAsync({
        from: uri,
        to: path,
    });
};

export const uploadImage = async (image, ratio) => {
    try {
        // Step 1: Prepare FormData for upload
        const formData = new FormData();
        if (image.uri.startsWith("data:image")) {
            formData.append("image", image.uri);
        } else {
            formData.append("image", {
                uri: image.uri,
                type: image.mimeType,
                name: image.fileName || "photo.jpg",
            });
        }
        formData.append("pixel_to_cm_ratio", ratio);

        // Step 2: Make the API call
        const url = `${API_BASE_URL}upload`;
        const response = await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 30000,
        });
        const responseData = response.data;
        // Step 3: Create directories if they don't exist
        await ensureDirectoryExists(UPLOAD_FOLDER);
        await ensureDirectoryExists(RESULT_FOLDER);

        // Step 4: Generate unique filenames for the uploaded and result images
        const uniqueName = await generateIncrementalName();
        const uploadedImagePath = `${UPLOAD_FOLDER}${uniqueName}.jpg`;
        const resultImagePath = `${RESULT_FOLDER}${uniqueName}_result.jpg`;

        // Step 5: Save the original uploaded image
        await saveImageLocally(image.uri, uploadedImagePath);

        // Step 6: Save the processed result image
        await saveBase64ImageLocally(responseData.processed_image, resultImagePath);

        // Step 7: Update or create data.json file
        await updateDataJson(uploadedImagePath, resultImagePath, responseData);

        return {
            originalImage: uploadedImagePath,
            processedImage: resultImagePath,
            block_details: JSON.stringify(responseData.block_details),
            total_blocks: responseData.total_blocks,
            g1_blocks: responseData.g1_blocks,
            non_g1_blocks: responseData.non_g1_blocks,
        };
    } catch (error) {
        if (error.response) {
            // Server responded with a status code out of 2xx range
            console.error("Server Error:", error.response.data);
        } else if (error.request) {
            // No response was received from the server
            console.error("No response received from server:", error.request);
        } else {
            // Error occurred during request setup
            console.error("Error in request setup:", error.message);
        }
        throw error;
    }
};

export const calibrateImage = async (image) => {
    try {
        const formData = new FormData();
        if (image.uri.startsWith("data:image")) {
            // Append the Base64 string directly
            formData.append("image", image.uri);
        } else {
            // Otherwise, handle it as a regular file URI
            formData.append("image", {
                uri: image.uri,
                type: image.mimeType,
                name: image.fileName || "photo.jpg",
            });
        }

        var url = API_BASE_URL + "calibrate";
        const response = await axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 10000,
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            // Server responded with a status code out of 2xx range
            console.error("Server Error:", error.response.data);
        } else if (error.request) {
            // No response was received from the server
            console.error("No response received from server:", error.request);
        } else {
            // Error occurred during request setup
            console.error("Error in request setup:", error.message);
        }
        throw error;
    }
};

const generateIncrementalName = async () => {
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");

    // Read current data.json to find the last incremental number for today
    let lastIncremental = 0;
    const fileInfo = await FileSystem.getInfoAsync(JSON_FILE_PATH);
    if (fileInfo.exists) {
        const jsonData = await FileSystem.readAsStringAsync(JSON_FILE_PATH);
        const existingData = JSON.parse(jsonData);

        // Filter entries for today's date
        const todayEntries = existingData.filter((entry) => entry.uploaded_image_path.includes(`${yy}_${mm}_${dd}`));
        if (todayEntries.length > 0) {
            const lastEntry = todayEntries[0]; // Newest first
            const lastNameParts = lastEntry.uploaded_image_path.split("/");
            const lastIncrement = parseInt(lastNameParts[lastNameParts.length - 1].split("_").pop(), 10);
            if (!isNaN(lastIncrement)) {
                lastIncremental = lastIncrement;
            }
        }
    }

    const newIncremental = lastIncremental + 1; // Increment by 1 for the new entry
    return `${yy}_${mm}_${dd}_${newIncremental.toString().padStart(5, "0")}`;
};
