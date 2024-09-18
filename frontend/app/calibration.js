import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert, Image, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "expo-router";
import { calibrateImage } from "../api/api.js";
const CALIBRATION_FILE_PATH = `${FileSystem.documentDirectory}calibration.json`;
import { API_BASE_URL } from "@env";

export default function CalibrationScreen() {
    const [loading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const [calibrationImage, setCalibrationImage] = useState(null);
    const [calibrationData, setCalibrationData] = useState({
        distance: "10",
        actualSize: "20",
        pixelLength: "300",
    });

    useEffect(() => {
        loadCalibrationData();
    }, []);

    const loadCalibrationData = async () => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(CALIBRATION_FILE_PATH);

            if (!fileInfo.exists) {
                const defaultCalibration = {
                    distance: "10",
                    actualSize: "20",
                    pixelLength: "300",
                };
                await FileSystem.writeAsStringAsync(CALIBRATION_FILE_PATH, JSON.stringify(defaultCalibration));
                setCalibrationData(defaultCalibration);
            } else {
                const calibrationJSON = await FileSystem.readAsStringAsync(CALIBRATION_FILE_PATH);
                const calibrationData = JSON.parse(calibrationJSON);
                setCalibrationData(calibrationData);
            }
        } catch (error) {
            console.error("Error loading calibration data:", error);
        }
    };

    const handleCalibrationPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setCalibrationImage(result.assets[0]);
            }
        } catch (error) {
            console.error("Error selecting calibration photo: ", error);
        }
    };

    const handleCalibrate = async () => {
        if (!calibrationImage || !calibrationData.distance || !calibrationData.actualSize) {
            Alert.alert("Incomplete Calibration", "Please select a photo and enter both distance and actual size.");
            return;
        }

        try {
            setIsLoading(true);
            const response = await calibrateImage(calibrationImage);
            if (response && response.length_pixels) {
                const newPixelLength = response.length_pixels;
                const updatedCalibrationData = {
                    ...calibrationData,
                    pixelLength: newPixelLength,
                };

                await FileSystem.writeAsStringAsync(CALIBRATION_FILE_PATH, JSON.stringify(updatedCalibrationData));
                setCalibrationData(updatedCalibrationData);
                Alert.alert("Calibration Complete", "The calibration data has been updated successfully!");
                navigation.goBack();
            } else {
                Alert.alert("Calibration Failed", "The server did not return the length in pixels.");
            }
        } catch (error) {
            console.error("Error during calibration:", error);
            Alert.alert("Calibration Error", "Failed to calibrate the image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.calibrationBox}>
                <Text style={styles.description}>
                    Insert the distance between the object and camera from a flat angle. Please ensure only 1 object is
                    in the photo.
                </Text>
                <TouchableOpacity style={styles.button} onPress={handleCalibrationPhoto} disabled={loading}>
                    <Text style={styles.buttonText}>Select Calibration Photo</Text>
                </TouchableOpacity>
                {calibrationImage && <Image source={{ uri: calibrationImage.uri }} style={styles.imagePreview} />}

                {/* Input Fields with Labels */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Distance (cm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Distance (cm)"
                        keyboardType="numeric"
                        value={calibrationData.distance}
                        onChangeText={(text) => setCalibrationData({ ...calibrationData, distance: text })}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Actual Size (cm)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Actual Size of Wood Block (cm)"
                        keyboardType="numeric"
                        value={calibrationData.actualSize}
                        onChangeText={(text) => setCalibrationData({ ...calibrationData, actualSize: text })}
                    />
                </View>

                <TouchableOpacity style={styles.processButton} onPress={handleCalibrate} disabled={loading}>
                    <Text style={styles.buttonText}>Calibrate</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    description: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    calibrationBox: {
        width: "80%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    button: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: "#007bff",
        borderRadius: 5,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#ffffff",
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginVertical: 5,
    },
    label: {
        fontSize: 14,
        marginRight: 10,
        width: 80,
        textAlign: "right",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
    },
    imagePreview: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
    },
    processButton: {
        padding: 10,
        marginTop: 10,
        backgroundColor: "#28a745",
        borderRadius: 5,
        width: "100%",
        alignItems: "center",
    },
});
