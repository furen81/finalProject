import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert, Image, ScrollView, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Import icons from MaterialCommunityIcons
import { uploadImage } from "../../api/api.js";
import { useNavigation } from "expo-router";

const CALIBRATION_FILE_PATH = `${FileSystem.documentDirectory}calibration.json`; // Path to your calibration file
const DATA_FILE_PATH = `${FileSystem.documentDirectory}WoodBlockApp/data.json`; // Path to data.json file
const UPLOAD_FOLDER = `${FileSystem.documentDirectory}WoodBlockApp/upload/`; // Path to upload folder
const PROCESSED_FOLDER = `${FileSystem.documentDirectory}WoodBlockApp/processed/`; // Path to processed folder

export default function HomeScreen() {
    const navigation = useNavigation();
    const [image, setImage] = useState(null);
    const [calibrationImage, setCalibrationImage] = useState(null);

    useEffect(() => {
        (async () => {
            // Request camera and media library permissions on component mount
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Sorry, we need camera and media library permissions to make this work!"
                );
            }
        })();
    }, []);

    const handleTakePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1, // Adjust the quality of the image
            });

            if (!result.canceled) {
                const selectedImage = result.assets[0]; // Store the image URI
                setImage(selectedImage); // Save to state

                // Read calibration data
                const calibrationData = await readCalibrationData();

                if (!calibrationData) {
                    Alert.alert("Calibration data is missing or corrupted.");
                    return;
                }

                // Calculate pixelToCmRatio from calibration data
                const { pixelLength, actualSize } = calibrationData;
                const pixelToCmRatio = actualSize / pixelLength;

                // Call your uploadImage function with the selected image and calculated ratio
                const response = await uploadImage(selectedImage, pixelToCmRatio);

                // Navigate to the detail page with the result as a prop
                navigation.navigate("detail", {
                    originalImage: response.originalImage,
                    processedImage: response.processedImage,
                    block_details: response.block_details,
                    total_blocks: response.total_blocks,
                    g1_blocks: response.g1_blocks,
                    non_g1_blocks: response.non_g1_blocks,
                });
            }
        } catch (error) {
            console.error("Error taking photo: ", error);
        }
    };

    const handleSelectPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1, // Adjust the quality of the image
            });

            if (!result.canceled) {
                const selectedImage = result.assets[0]; // Store the image URI
                setImage(selectedImage); // Save to state

                // Read calibration data
                const calibrationData = await readCalibrationData();

                if (!calibrationData) {
                    Alert.alert("Calibration data is missing or corrupted.");
                    return;
                }

                // Calculate pixelToCmRatio from calibration data
                const { pixelLength, actualSize } = calibrationData;
                const pixelToCmRatio = actualSize / pixelLength;

                // Call your uploadImage function with the selected image and calculated ratio
                const response = await uploadImage(selectedImage, pixelToCmRatio);

                // Navigate to the detail page with the result as a prop
                navigation.navigate("detail", {
                    originalImage: response.originalImage,
                    processedImage: response.processedImage,
                    block_details: response.block_details,
                    total_blocks: response.total_blocks,
                    g1_blocks: response.g1_blocks,
                    non_g1_blocks: response.non_g1_blocks,
                });

                Alert.alert("Photo Uploaded Successfully!");
            }
        } catch (error) {
            console.error("Error selecting photo: ", error);
            Alert.alert("Error selecting photo!");
        }
    };

    const readCalibrationData = async () => {
        try {
            const calibrationJson = await FileSystem.readAsStringAsync(CALIBRATION_FILE_PATH);
            return JSON.parse(calibrationJson);
        } catch (error) {
            console.error("Error reading calibration data: ", error);
            return null; // Return null if there is an error reading the file
        }
    };

    const handleCalibrationPhoto = () => {
        navigation.navigate("calibration");
    };

    const resetData = async () => {
        try {
            // Delete files in upload and processed folders
            await deleteFolderFiles(UPLOAD_FOLDER);
            await deleteFolderFiles(PROCESSED_FOLDER);

            // Clear the data.json file
            await FileSystem.writeAsStringAsync(DATA_FILE_PATH, JSON.stringify([], null, 2)); // Reset data.json to an empty array

            Alert.alert("Data Reset", "All data has been cleared successfully.");
        } catch (error) {
            console.error("Error resetting data: ", error);
            Alert.alert("Error", "An error occurred while resetting the data.");
        }
    };
    const deleteFolderFiles = async (folderPath) => {
        const folderInfo = await FileSystem.getInfoAsync(folderPath);
        if (folderInfo.exists) {
            const files = await FileSystem.readDirectoryAsync(folderPath);
            for (const file of files) {
                const filePath = `${folderPath}${file}`;
                await FileSystem.deleteAsync(filePath);
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Three Square Boxes for Actions */}
            <View style={styles.boxContainer}>
                {/* Calibration Box with Reset Button */}
                <View style={styles.calibrationBoxContainer}>
                    <TouchableOpacity style={styles.box} onPress={handleCalibrationPhoto}>
                        <Icon name="magnify" size={40} color="#007bff" />
                        <Text style={styles.boxText}>Calibration</Text>
                    </TouchableOpacity>
                    {/* Reset Data Button Positioned at the Bottom Left */}
                    <TouchableOpacity style={styles.box} onPress={resetData}>
                        <Text style={styles.boxText}>Reset Data</Text>
                    </TouchableOpacity>
                </View>

                {/* Take Photo Box */}
                <TouchableOpacity style={styles.box} onPress={handleTakePhoto}>
                    <Icon name="camera" size={40} color="#28a745" />
                    <Text style={styles.boxText}>Take Photo</Text>
                </TouchableOpacity>

                {/* Select Photo Box */}
                <TouchableOpacity style={styles.box} onPress={handleSelectPhoto}>
                    <Icon name="folder" size={40} color="#ff7f50" />
                    <Text style={styles.boxText}>Select Photo</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f8f8f8",
    },
    boxContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 20,
    },
    calibrationBoxContainer: {
        flexDirection: "column", // Align reset button below the calibration box
        alignItems: "center", // Center the calibration box horizontally
        position: "relative", // Make it possible to use absolute positioning for the reset button
    },
    box: {
        width: 100,
        height: 100,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        marginBottom: 16,
    },
    boxText: {
        marginTop: 5,
        fontSize: 14,
        textAlign: "center",
    },
    calibrationContainer: {
        marginBottom: 20,
        alignItems: "center",
    },
    calibrationTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        width: 200,
        marginVertical: 10,
    },
    imagePreviewContainer: {
        marginBottom: 20,
        alignItems: "center",
    },
    previewText: {
        fontSize: 16,
        marginBottom: 5,
    },
    imagePreview: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    resultContainer: {
        marginTop: 20,
        alignItems: "center",
    },
    resultImageContainer: {
        marginBottom: 10,
        alignItems: "center",
    },
    resultImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
    resultText: {
        fontSize: 16,
        marginTop: 10,
        textAlign: "center",
    },
    processButton: {
        padding: 10,
        marginTop: 10,
        backgroundColor: "#28a745",
        borderRadius: 5,
    },
});
