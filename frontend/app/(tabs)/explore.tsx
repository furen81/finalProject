import React, { useState, useEffect } from "react";
import { StyleSheet, Text, ScrollView, View, ActivityIndicator, RefreshControl } from "react-native";
import Card from "../../components/cards.js";
import * as FileSystem from "expo-file-system";

const DIRECTORY_PATH = `${FileSystem.documentDirectory}WoodBlockApp/`;
const JSON_FILE_PATH = `${DIRECTORY_PATH}data.json`;

export default function TabTwoScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(JSON_FILE_PATH);

            if (fileInfo.exists) {
                const jsonData = await FileSystem.readAsStringAsync(JSON_FILE_PATH);
                const parsedData = JSON.parse(jsonData);
                setData(parsedData);
            } else {
                console.log("JSON file does not exist.");
                setData([]);
            }
        } catch (error) {
            console.error("Error reading JSON file:", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);
    const onRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };
    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>History</Text>
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : data && data.length > 0 ? (
                data.map((item, index) => (
                    <Card key={index} data={item} /> // Render Card component for each item
                ))
            ) : (
                <Text>No data available</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 8,
        paddingVertical: 20,
        backgroundColor: "#f8f8f8",
    },
    header: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1d1d1d",
    },
});
