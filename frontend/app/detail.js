import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { View, Text, Image, StyleSheet, ScrollView, FlatList, TouchableOpacity, Modal, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DetailScreen() {
    const navigation = useNavigation();
    const { processedImage, originalImage, block_details, total_blocks, g1_blocks, non_g1_blocks, response } =
        useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState("");

    const screenWidth = Dimensions.get("window").width - 16;

    const [images, setImages] = useState([
        { uri: "https://via.placeholder.com/300x200" },
        { uri: "https://via.placeholder.com/300x200" },
    ]);

    const handleImagePress = (uri) => {
        setSelectedImageUri(uri);
        setIsModalVisible(true);
    };
    const handleScroll = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / event.nativeEvent.layoutMeasurement.width);
        setCurrentImageIndex(currentIndex);
    };

    useEffect(() => {
        if (response) {
            console.log("Function for entry from take a photo / select a photo");
        } else if (!response) {
            if (originalImage && processedImage) {
                setImages([{ uri: originalImage }, { uri: processedImage }]);
                setIsLoading(false);
            } else {
                console.log("Parameters missing: originalImage or processedImage is undefined.");
            }
        }
    }, [response, originalImage, processedImage]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Image Carousel */}
            <View style={styles.imageCarousel}>
                {!isLoading && (
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleImagePress(item.uri)}>
                                <Image
                                    source={{ uri: item.uri }}
                                    style={[styles.carouselImage, { width: screenWidth - 16 }]}
                                />
                            </TouchableOpacity>
                        )}
                        onScroll={handleScroll}
                        style={{ width: screenWidth }} // Ensures FlatList is also full width
                        decelerationRate="fast" // Optional: Makes the swipe more responsive
                    />
                )}

                {/* Pagination Dots */}
                <View style={styles.paginationDots}>
                    {images.map((_, index) => (
                        <View key={index} style={[styles.dot, currentImageIndex === index && styles.activeDot]} />
                    ))}
                </View>
            </View>

            {/* Full-Screen Image Modal */}
            <Modal visible={isModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Image source={{ uri: selectedImageUri }} style={styles.fullScreenImage} resizeMode="contain" />
                </View>
            </Modal>

            {/*Details */}
            <View style={styles.salonDetails}>
                <Text style={styles.salonName}>Total Blocks : {total_blocks}</Text>
                <Text style={styles.salonAddress}>Grade 1 Blocks : {g1_blocks}</Text>
                <Text style={styles.salonAddress}>Non-Grade Blocks : {non_g1_blocks}</Text>
            </View>

            {/*List */}
            <View style={styles.measurementList}>
                <Text style={styles.sectionTitle}>Measurements</Text>

                {/* Header Row */}

                <View style={styles.items}>
                    <Text style={[styles.textHeader, styles.flex1]}>Block</Text>
                    <Text style={[styles.textHeader, styles.flex1]}>P</Text>
                    <Text style={[styles.textHeader, styles.flex1]}>L</Text>
                    <Text style={[styles.textHeader, styles.flex1]}>T</Text>
                    <Text style={[styles.textHeader, styles.flex1]}>V</Text>
                </View>

                {/* Data Rows */}
                {JSON.parse(block_details).map((el, index) => {
                    return (
                        <View style={styles.items} key={index}>
                            <Text style={[styles.text, styles.flex1]}>{el.Name}</Text>
                            <Text style={[styles.text, styles.flex1]}>{el.length.toFixed(2)}</Text>
                            <Text style={[styles.text, styles.flex1]}>{el.width.toFixed(2)}</Text>
                            <Text style={[styles.text, styles.flex1]}>{el.height.toFixed(2)}</Text>
                            <Text style={[styles.text, styles.flex1]}>{el.volume.toFixed(2)}</Text>
                        </View>
                    );
                })}
            </View>
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
    imageCarousel: {
        marginBottom: 16,
    },
    carouselImage: {
        height: 200,
        borderRadius: 10,
        resizeMode: "cover",
        marginHorizontal: 8,
    },
    paginationDots: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: "#007bff",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
    },
    fullScreenImage: {
        width: "90%",
        height: "70%",
        borderRadius: 10,
    },
    salonDetails: {
        marginBottom: 16,
    },
    salonName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
    },
    salonAddress: {
        fontSize: 14,
        color: "gray",
    },
    appointmentInfo: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: "gray",
        marginLeft: 4,
        marginRight: 16,
    },
    bookingNumber: {
        fontSize: 14,
        color: "#FF7F50",
        marginTop: 8,
    },
    measurementList: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    items: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#EAEAEA",
    },
    textHeader: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
    },
    text: {
        fontSize: 14,
        textAlign: "center",
    },
    flex1: {
        flex: 1,
    },
});
