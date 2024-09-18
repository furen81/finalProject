import React from "react";
import { useNavigation } from "expo-router";
import { StyleSheet, Image, Text, View, TouchableOpacity } from "react-native";

export default function Card({ data }) {
    const navigation = useNavigation();
    const handleSeeDetail = () => {
        navigation.navigate("detail", {
            originalImage: data.uploaded_image_path,
            processedImage: data.result_image_path,
            block_details: JSON.stringify(data.result.block_details),
            total_blocks: data.result.total_blocks,
            g1_blocks: data.result.g1_blocks,
            non_g1_blocks: data.result.non_g1_blocks,
        });
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handleSeeDetail}>
            <Image source={{ uri: data.uploaded_image_path }} style={styles.cardImage} />
            <View style={styles.separator} />
            <View style={styles.cardContent}>
                <View style={styles.textRow}>
                    <Text style={styles.blockType}>Total Blocks</Text>
                    <Text style={styles.blockValue}>{data.result.total_blocks}</Text>
                </View>
                <View style={styles.textRow}>
                    <Text style={styles.blockType}>Grade 1 Blocks</Text>
                    <Text style={styles.blockValue}>{data.result.g1_blocks}</Text>
                </View>
                <View style={styles.textRow}>
                    <Text style={styles.blockType}>Other Blocks</Text>
                    <Text style={styles.blockValue}>{data.result.non_g1_blocks}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 0,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
        height: 120,
    },
    cardImage: {
        width: 120,
        height: 120,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        marginRight: 0,
        separator: {
            width: 1,
            backgroundColor: "#ededed",
            height: "100%",
            alignSelf: "stretch",
        },
        cardContent: {
            flex: 1,
            justifyContent: "center",
            paddingLeft: 10,
        },
        textRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
        },
        blockType: {
            fontSize: 14,
            fontWeight: "bold",
            color: "#666",
            width: 110,
            textAlign: "left",
        },
        blockValue: {
            fontSize: 14,
            color: "#666",
            textAlign: "left",
        },
    },
});
