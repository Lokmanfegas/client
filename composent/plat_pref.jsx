import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");
const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

export default function PlatPref({ item, removeItem }) {
    // Fonction pour obtenir l'icône et la couleur selon la catégorie
    const getCategoryIcon = () => {
        switch(item.categorie_plat.toLowerCase()) {
            case 'salad': return { icon: 'food-apple', color: '#4CAF50' };
            case 'meat': return { icon: 'food-steak', color: '#F44336' };
            case 'pasta': return { icon: 'food-pasta', color: '#FF9800' };
            case 'dessert': return { icon: 'cupcake', color: '#9C27B0' };
            case 'drink': return { icon: 'glass-cocktail', color: '#2196F3' };
            case 'burger': return { icon: 'hamburger', color: '#FF5722' };
            case 'seafood': return { icon: 'fish', color: '#00BCD4' };
            default: return { icon: 'food', color: '#8B0000' };
        }
    };

    const { icon, color } = getCategoryIcon();

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Icône de catégorie */}
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <MaterialCommunityIcons 
                        name={icon} 
                        size={wp(15)} 
                        color={color} 
                    />
                </View>

                {/* Détails du plat */}
                <View style={styles.detailsContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title} numberOfLines={1}>{item.nom_plat}</Text>
                        <TouchableOpacity 
                            onPress={() => removeItem(item.id_plat)}
                            style={styles.heartButton}
                        >
                            <FontAwesome 
                                name="heart" 
                                size={wp(5)} 
                                color="#FF3B30" 
                            />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.description} numberOfLines={2}>{item.Description_plat}</Text>

                    <View style={styles.footer}>
                        <View style={styles.ratingContainer}>
                            <FontAwesome name="star" size={wp(4)} color="#FFC107" />
                            <Text style={styles.ratingText}>{item.note_plat}</Text>
                        </View>

                        <View style={[styles.priceContainer, { backgroundColor: color }]}>
                            <Text style={styles.priceText}>{item.Prix_plat} DA</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: hp(2),
        paddingHorizontal: wp(4),
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: wp(4),
        padding: wp(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    iconContainer: {
        width: wp(25),
        height: wp(25),
        borderRadius: wp(4),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(3),
    },
    detailsContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: wp(4.5),
        fontWeight: '700',
        color: '#082953',
        flex: 1,
        marginRight: wp(2),
    },
    heartButton: {
        padding: wp(1),
    },
    description: {
        fontSize: wp(3.8),
        color: '#666',
        marginVertical: hp(1),
        lineHeight: hp(2.5),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE9B2',
        borderRadius: wp(3),
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
    },
    ratingText: {
        color: '#FFC107',
        fontSize: wp(3.8),
        fontWeight: '600',
        marginLeft: wp(1),
    },
    priceContainer: {
        borderRadius: wp(3),
        paddingHorizontal: wp(4),
        paddingVertical: hp(0.7),
    },
    priceText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: wp(4),
    },
});