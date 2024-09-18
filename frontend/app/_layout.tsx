import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

SplashScreen.preventAutoHideAsync();
const DIRECTORY_PATH = `${FileSystem.documentDirectory}WoodBlockApp/`;

const createAppStorageFolder = async () => {
    try {
        const folderInfo = await FileSystem.getInfoAsync(DIRECTORY_PATH);

        if (!folderInfo.exists) {
            await FileSystem.makeDirectoryAsync(DIRECTORY_PATH, { intermediates: true });
            console.log("Folder created at: ", DIRECTORY_PATH);
        } else {
            console.log("Folder already exists at: ", DIRECTORY_PATH);
        }
    } catch (error) {
        console.error("Error creating folder: ", error);
    }
};

const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") {
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
        return false;
    }

    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
    if (mediaLibraryStatus !== "granted") {
        Alert.alert("Permission Denied", "Storage permission is required to save images.");
        return false;
    }
    return true;
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
        const initializeApp = async () => {
            const permissionsGranted = await requestPermissions();
            if (permissionsGranted) {
                await createAppStorageFolder();
            }
            if (loaded) {
                SplashScreen.hideAsync();
            }
        };

        initializeApp();
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="detail" options={{ title: "Measurement details" }} />
                <Stack.Screen name="calibration" options={{ title: "Calibration" }} />
                <Stack.Screen name="+not-found" />
            </Stack>
        </ThemeProvider>
    );
}
