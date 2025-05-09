import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Easing,
  Dimensions
} from 'react-native';
import { 
  FontAwesome, 
  MaterialCommunityIcons,
  MaterialIcons
} from '@expo/vector-icons';
import Api_maladie from '../api_maladie';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CartContext } from '../CartContext';
import Api_plat from '../api_plats';

const { width, height } = Dimensions.get('window');
const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

const DescriptionScreen = () => {
  const [ingredients_plat, setIngredients] = useState([]);
  const { cartItems, setCartItems } = useContext(CartContext);
  const [clientId, setClientId] = useState(null);
  const [incr, setIncr] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const slideAnim = useRef(new Animated.Value(hp('100%'))).current;
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;

  // Couleur et icône dynamiques selon la catégorie
  const getCategoryColor = () => {
    switch(item.categorie_plat.toLowerCase()) {
      case 'salad': return '#4CAF50';
      case 'meat': return '#F44336';
      case 'pasta': return '#FF9800';
      case 'dessert': return '#9C27B0';
      case 'drink': return '#2196F3';
      default: return '#8B0000';
    }
  };

  const getCategoryIcon = () => {
    switch(item.categorie_plat.toLowerCase()) {
      case 'salad': return 'food-apple';
      case 'meat': return 'food-steak';
      case 'pasta': return 'food-variant';
      case 'dessert': return 'cupcake';
      case 'drink': return 'glass-cocktail';
      case 'sandwich': return 'sandwich';
      default: return 'food';
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const id = await AsyncStorage.getItem('clientId');
        if (id) setClientId(parseInt(id));
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const ingredients_res = await Api_plat.getIngredients();
        const plat_ingredients_res = await Api_plat.getIngredientsByPlat(item.id_plat);
        
        const ingredientNames = ingredients_res.data.ingredients
          .filter(ing => plat_ingredients_res.data.ingredients.some(pi => pi.id_ingredient === ing.id_ingedient))
          .map(ing => ing.nom_igredient);
        
        setIngredients(ingredientNames);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };
    fetchIngredients();
  }, []);

  const fetchMaladies = async (id_plat) => {
    try {
      const maladieclient = await Api_maladie.getClientMaladies(clientId);
      const maladiesplat = await Api_maladie.getMaladiesByPlat(id_plat);
      
      const alerts = maladieclient.data.maladies.filter(mc => 
        maladiesplat.data.maladies.some(mp => mp.id_maladie === mc.id_maladie)
      );
      
      if (alerts.length > 0) {
        alert("Attention : Ce plat contient des ingrédients auxquels vous êtes allergique");
      }
    } catch (error) {
      console.error('Error fetching allergies:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!clientId) return;
    
    try {
      if (isFavorite) {
        await Api_plat_pref.deleteFavoritePlat(clientId, item.id_plat);
      } else {
        await Api_plat_pref.addFavoritePlat(item.id_plat, clientId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const addToCart = () => {
    fetchMaladies(item.id_plat);
    showCartAlert();
    
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id_plat === item.id_plat);
    const newItem = { id_plat: item.id_plat, quantite: incr };
    
    setCartItems(existingItemIndex !== -1 
      ? cartItems.map((item, idx) => 
          idx === existingItemIndex 
            ? { ...item, quantite: item.quantite + incr } 
            : item
        )
      : [...cartItems, newItem]
    );
  };

  const showCartAlert = () => {
    setShowAlert(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const hideAlert = () => {
    Animated.timing(slideAnim, {
      toValue: hp('100%'),
      duration: 250,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setShowAlert(false));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header avec boutons */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={wp(6)} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <FontAwesome 
              name={isFavorite ? 'heart' : 'heart-o'} 
              size={wp(6)} 
              color={isFavorite ? '#FF3B30' : '#FFF'} 
            />
          </TouchableOpacity>
        </View>

        {/* Section icône du plat */}
        <View style={[styles.iconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
          <MaterialCommunityIcons 
            name={getCategoryIcon()} 
            size={wp(30)} 
            color={getCategoryColor()} 
          />
        </View>

        {/* Titre et prix */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.nom_plat}</Text>
          <Text style={[styles.price, { color: getCategoryColor() }]}>{item.Prix_plat} DA</Text>
        </View>

        {/* Badges d'info */}
        <View style={styles.badgeContainer}>
          <View style={styles.ratingBadge}>
            <FontAwesome name="star" size={wp(4)} color="#FFC107" />
            <Text style={styles.ratingText}>{item.note_plat}</Text>
          </View>
          
          <View style={styles.calorieBadge}>
            <MaterialCommunityIcons name="fire" size={wp(4)} color="#FFD747" />
            <Text style={styles.calorieText}>{item.info_calorie}</Text>
          </View>
        </View>

        {/* Contrôle de quantité */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              onPress={() => setIncr(Math.max(1, incr - 1))}
              style={styles.quantityButton}
            >
              <MaterialIcons name="remove" size={wp(5)} color="#555" />
            </TouchableOpacity>
            
            <Text style={styles.quantityValue}>{incr}</Text>
            
            <TouchableOpacity 
              onPress={() => setIncr(incr + 1)}
              style={styles.quantityButton}
            >
              <MaterialIcons name="add" size={wp(5)} color="#555" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={addToCart}
            style={[styles.addButton, { backgroundColor: getCategoryColor() }]}
          >
            <Text style={styles.addButtonText}>Add to Cart</Text>
            <FontAwesome name="shopping-cart" size={wp(4.5)} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Section ingrédients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsGrid}>
            {ingredients_plat.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <MaterialCommunityIcons 
                  name="checkbox-marked-circle" 
                  size={wp(4)} 
                  color={getCategoryColor()} 
                />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{item.Description_plat}</Text>
        </View>
       
      </ScrollView>

      {/* Alerte d'ajout au panier (remplace le Modal) */}
      {showAlert && (
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={hideAlert}
        >
        <View style={styles.alertContainer}>
        <View style={[styles.alertIconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
              <MaterialCommunityIcons 
                name={getCategoryIcon()} 
                size={wp(15)} 
                color={getCategoryColor()} 
              />
            </View>
            
            <Text style={styles.alertTitle}>Added to Cart!</Text>
            <Text style={styles.alertText}>
              {incr} {item.nom_plat} {incr > 1 ? 'have' : 'has'} been added to your cart
            </Text>
            
            <View style={styles.alertButtons}>
              <TouchableOpacity 
                onPress={() => {
                  hideAlert();
                  navigation.navigate('Mycart');
                }}
                style={[styles.alertButton, { backgroundColor: getCategoryColor() }]}
              >
                <Text style={styles.alertButtonText}>View Cart</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={hideAlert}
                style={styles.alertSecondaryButton}
              >
                <Text style={[styles.alertButtonText, { color: getCategoryColor() }]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>

        </View>
        </TouchableOpacity>
      )}
    </View>
  );
};
/*
 <View style={[styles.alertIconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
              <MaterialCommunityIcons 
                name={getCategoryIcon()} 
                size={wp(15)} 
                color={getCategoryColor()} 
              />
            </View>
            
            <Text style={styles.alertTitle}>Added to Cart!</Text>
            <Text style={styles.alertText}>
              {incr} {item.nom_plat} {incr > 1 ? 'have' : 'has'} been added to your cart
            </Text>
            
            <View style={styles.alertButtons}>
              <TouchableOpacity 
                onPress={() => {
                  hideAlert();
                  navigation.navigate('Mycart');
                }}
                style={[styles.alertButton, { backgroundColor: getCategoryColor() }]}
              >
                <Text style={styles.alertButtonText}>View Cart</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={hideAlert}
                style={styles.alertSecondaryButton}
              >
                <Text style={[styles.alertButtonText, { color: getCategoryColor() }]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>

*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    paddingBottom: hp(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(5),
    paddingBottom: hp(2),
    backgroundColor: '#8B0000',
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
    height: hp(15),
  },
  backButton: {
    padding: wp(2),
    marginLeft: wp(-2),
  },
  favoriteButton: {
    padding: wp(2),
    marginRight: wp(-2),
  },
  iconContainer: {
    alignSelf: 'center',
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(7),
    marginBottom: hp(2),
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  title: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#082953',
    flex: 1,
  },
  price: {
    fontSize: wp(6),
    fontWeight: 'bold',
    marginLeft: wp(2),
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(3),
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9B2',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    marginRight: wp(3),
  },
  calorieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B02522',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  ratingText: {
    color: '#FFC107',
    fontSize: wp(4),
    fontWeight: '600',
    marginLeft: wp(1),
  },
  calorieText: {
    color: '#FFD747',
    fontSize: wp(4),
    fontWeight: '600',
    marginLeft: wp(1),
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    marginBottom: hp(4),
  },
  quantityLabel: {
    fontSize: wp(4),
    color: '#555',
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F6',
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
  },
  quantityButton: {
    padding: wp(2),
  },
  quantityValue: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    marginHorizontal: wp(3),
    color: '#082953',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: wp(3),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: wp(4),
    marginRight: wp(2),
  },
  section: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#082953',
    marginBottom: hp(1.5),
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp(1),
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: hp(1.5),
  },
  ingredientText: {
    fontSize: wp(4),
    color: '#555',
    marginLeft: wp(2),
  },
  descriptionText: {
    fontSize: wp(4),
    color: '#666',
    lineHeight: hp(3),
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  alertContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    padding: wp(6),
    alignItems: 'center',
  },
  alertIconContainer: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  alertTitle: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#082953',
    marginBottom: hp(1),
  },
  alertText: {
    fontSize: wp(4),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(3),
    lineHeight: hp(3),
  },
  alertButtons: {
    width: '100%',
  },
  alertButton: {
    borderRadius: wp(3),
    padding: hp(1.5),
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  alertButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: wp(4.5),
  },
  alertSecondaryButton: {
    borderRadius: wp(3),
    padding: hp(1.5),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B0000',
  },
});

export default DescriptionScreen;