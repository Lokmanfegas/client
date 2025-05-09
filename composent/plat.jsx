import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useEffect } from "react";
import { useCallback } from 'react';
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Api_plat_pref from "../api_pla_pref";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

export default function Plat({ item }) {
    const navigation = useNavigation();
    const [isFavorite, setIsFavorite] = useState(false);
    const [clientId, setClientId] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const id = await AsyncStorage.getItem('clientId');
                if (id) {
                    setClientId(parseInt(id));
                }
            } catch (error) {
                console.error('Error checking login status:', error);
            }
        };
        checkLoginStatus();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (!clientId) return;

            const fetchFavorites = async () => {
                try {
                    const favoritePlatsResponse = await Api_plat_pref.getFavoritePlats(clientId);
                    const favoritePlats = favoritePlatsResponse.data.plats;
                    const isFav = favoritePlats.some((fav) => fav.id_plat === item.id_plat);
                    setIsFavorite(isFav);
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                }
            };
        
            fetchFavorites();
        }, [clientId, item.id_plat])
    );
      
    const handleFavoritePress = async () => {
        if (!clientId) {
            console.warn("Client ID not available");
            return;
        }
      
        try {
            if (!isFavorite) {
                await Api_plat_pref.addFavoritePlat(item.id_plat, clientId);
                setIsFavorite(true);
            } else {
                await Api_plat_pref.deleteFavoritePlat(clientId, item.id_plat);
                setIsFavorite(false);
            }
        } catch (error) {
            console.error("Error handling favorite:", error);
        }
    };

    const getCategoryIcon = () => {
        switch(item.categorie_plat.toLowerCase()) {
            case 'salad':
                return 'food-apple';
            case 'meat':
                return 'food-steak';
            case 'pasta':
                return 'food-variant';
            case 'dessert':
                return 'cupcake';
            case 'drink':
                return 'glass-cocktail';
            case 'sandwich':
                return 'sandwich';
            default:
                return 'food';
        }
    };

    const getCategoryColor = () => {
        switch(item.categorie_plat.toLowerCase()) {
            case 'salad':
                return '#4CAF50'; // Green
            case 'meat':
                return '#F44336'; // Red
            case 'pasta':
                return '#FF9800'; // Orange
            case 'dessert':
                return '#9C27B0'; // Purple
            case 'drink':
                return '#2196F3'; // Blue
            default:
                return '#8B0000'; // Default burgundy
        }
    };

    return (
        <TouchableOpacity   
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Description", { item })}
            style={styles.container}
            onPressIn={() => setIsHovered(true)}
            onPressOut={() => setIsHovered(false)}
        >
            <View style={[styles.card, isHovered && styles.cardHovered]}>
                <TouchableOpacity 
                    onPress={handleFavoritePress} 
                    style={styles.favoriteButton}
                >
                    <FontAwesome
                        name={isFavorite ? 'heart' : 'heart-o'}
                        size={wp(4.5)}
                        color={isFavorite ? '#FF3B30' : '#FFF'}
                        style={{ textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}
                    />
                </TouchableOpacity>

                <View style={[styles.imageContainer, { backgroundColor: getCategoryColor() + '20' }]}>
                    <MaterialCommunityIcons 
                        name={getCategoryIcon()} 
                        size={wp(20)} 
                        color={getCategoryColor()} 
                    />
                </View>

                <View style={styles.badgeContainer}>
                    <View style={styles.newBadge}>
                        <MaterialCommunityIcons 
                            name="lightning-bolt" 
                            size={wp(3.5)} 
                            color="#FFD747" 
                        />
                        <Text style={styles.newBadgeText}>NEW</Text>
                    </View>

                    <View style={styles.ratingBadge}>
                        <FontAwesome 
                            name="star" 
                            size={wp(3.5)} 
                            color="#FFC107" 
                        />
                        <Text style={styles.ratingText}>{item.note_plat}</Text>
                    </View>
                </View>

                <Text style={styles.name} numberOfLines={1}>{item.nom_plat}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.Description_plat}</Text>
                
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.price}>{item.Prix_plat} DA</Text>
                        <Text style={styles.calories}>{item.info_calorie}</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.addButton, { backgroundColor: getCategoryColor() }]}
                        onPress={() => navigation.navigate("Description", { item })}
                    >
                        <FontAwesome name="plus" size={wp(4)} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: wp(42),
        marginRight: wp(4),
        marginBottom: hp(2),
        height: hp(32) 
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: wp(4),
        padding: wp(3.5),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'transparent',
        height: '100%', 
        flex: 1, 
        justifyContent: 'space-between' 
    },
    cardHovered: {
        borderColor: '#8B0000',
        transform: [{ scale: 1.02 }]
    },
    favoriteButton: {
        position: 'absolute',
        top: wp(3),
        right: wp(3),
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: wp(5),
        padding: wp(2),
        width: wp(10),
        height: wp(10),
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageContainer: {
        width: '100%',
        height: hp(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(1),
        borderRadius: wp(3),
    },
    badgeContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: hp(1)
    },
    newBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#B02522',
        borderRadius: wp(5),
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5)
    },
    newBadgeText: {
        color: '#FFD747',
        fontSize: wp(3.2),
        fontWeight: '600',
        marginLeft: wp(1)
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE9B2',
        borderRadius: wp(5),
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5)
    },
    ratingText: {
        color: '#FFC107',
        fontSize: wp(3.2),
        fontWeight: '600',
        marginLeft: wp(1)
    },
    name: {
        color: '#082953',
        fontSize: wp(4),
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: hp(0.5),
        width: '100%'
    },
    description: {
        color: '#666',
        fontSize: wp(3.2),
        textAlign: 'center',
        marginBottom: hp(1),
        width: '100%'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 'auto'
    },
    price: {
        fontSize: wp(4.2),
        fontWeight: '700',
        color: '#8B0000'
    },
    calories: {
        fontSize: wp(2.8),
        color: '#888'
    },
    addButton: {
        borderRadius: wp(3),
        width: wp(9),
        height: wp(9),
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3
    }
});