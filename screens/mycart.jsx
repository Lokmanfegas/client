import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import Api_commande from '../api_commande';
import { useContext , useCallback , useEffect ,useState } from 'react';
import { CartContext } from '../CartContext';
import { useFocusEffect } from '@react-navigation/native';
import Api_plat from '../api_plats';
import Cart_item from '@/composent/cart_item';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

const {width, height} = Dimensions.get('window');

const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

const MycartScreen = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const [foodItems, setFoodItems] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [clientId, setclientId] = useState(null);
  const [isTableEnabled, setIsTableEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');


  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const id = await AsyncStorage.getItem('clientId');
        if (id) {
          setclientId(parseInt(id));
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
    checkLoginStatus();
  }, []);

  const id_client = clientId; 

  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;
      foodItems.forEach(item => {
        const cartItem = cartItems.find(cartItem => cartItem.id_plat === item.id_plat);
        if (cartItem) {
          total += item.Prix_plat * cartItem.quantite;
        }
      });
      setTotalPrice(total);
    };
    calculateTotal();
  }, [foodItems, cartItems]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const availablePlatsResponse = await Api_plat.getAvailablePlats();
          const availablePlats = availablePlatsResponse.data.plats;
          const merged = availablePlats.map((availablePlat) => {
            const cartItem = cartItems.find((item) => item.id_plat === availablePlat.id_plat);
            if (cartItem) {
              return availablePlat;
            }
            return null;
          });
          const food = merged.filter((item) => item !== null);
          setFoodItems(food);
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      };
      fetchData();
    }, [cartItems])
  );

  const removeFromCart = (id_plat) => {
    setCartItems(prevItems => {
      return prevItems.filter(item => item.id_plat !== id_plat);
    });
  };

  const handleRemoveItem = (id_plat) => {
    removeFromCart(id_plat);
  };

  const send_commandes = async () => {
    if (isTableEnabled && !tableNumber) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de table');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Erreur', 'Votre panier est vide');
      return;
    }

    const commandeData = {
      id_client: id_client,
      id_table: isTableEnabled ? parseInt(tableNumber) : null,
      mode_payment: paymentMethod,
      montant: totalPrice,
    };

    const plats = cartItems;

    try {
      const response = await Api_commande.createCommande(commandeData, plats);
      
      if (paymentMethod === 'carte_banquaire') {
        const paymentUrl = response.data.paymentUrl; // Supposons que l'API retourne cette info
        WebBrowser.openBrowserAsync(paymentUrl)
          .then(result => {
            if (result.type === 'success') {
              Alert.alert('Succès', 'Paiement réussi');
            } else {
              Alert.alert('Annulé', 'Paiement annulé');
            }
          })
          .catch(error => {
            console.error('Erreur lors de la redirection vers le paiement :', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la redirection vers le paiement');
          });

         
      } else {
        Alert.alert('Succès', 'Commande passée avec succès');
      }
      
      setCartItems([]);
      setTableNumber('');
    } catch (error) {
      console.error('Erreur lors de la création de la commande :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la commande');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Mon Panier</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="cart-remove" 
            size={wp(25)} 
            color="#8B0000" 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>Votre panier est vide</Text>
          <Text style={styles.emptySubText}>Ajoutez des articles depuis le menu</Text>
        </View>
      ) : (
        <>
          <ScrollView 
            style={styles.itemsContainer}
            contentContainerStyle={styles.itemsContent}
          >
            {foodItems.map((item) => {
              const cartItem = cartItems.find(cartItem => cartItem.id_plat === item.id_plat);
              return (
                <GestureHandlerRootView key={item.id_plat}>
                  <Cart_item 
                    key={item.id_plat} 
                    item={item} 
                    onRemove={() => handleRemoveItem(item.id_plat)}
                    quantity={cartItem?.quantite || 1}
                  />
                </GestureHandlerRootView>
              );
            })}
          </ScrollView>

          <View style={styles.summaryContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total :</Text>
              <Text style={styles.totalValue}>{totalPrice.toFixed(2)} DA</Text>
            </View>

            <View style={styles.tableToggleContainer}>
              <View style={styles.toggleLabelContainer}>
                <MaterialCommunityIcons 
                  name="table-furniture" 
                  size={wp(5)} 
                  color={isTableEnabled ? '#8B0000' : '#888'} 
                />
                <Text style={[
                  styles.toggleLabel,
                  isTableEnabled && styles.toggleLabelActive
                ]}>
                  Commander sur place
                </Text>
              </View>
              <Switch
                value={isTableEnabled}
                onValueChange={setIsTableEnabled}
                thumbColor={isTableEnabled ? '#8B0000' : '#f4f3f4'}
                trackColor={{ false: '#767577', true: '#FFC01D' }}
              />
            </View>

            {isTableEnabled && (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.tableInput}
                  placeholder="Numéro de table"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={tableNumber}
                  onChangeText={setTableNumber}
                />
              </View>
            )}

            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  paymentMethod === 'cash' && styles.paymentButtonActive
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <FontAwesome 
                  name="money" 
                  size={wp(5)} 
                  color={paymentMethod === 'cash' ? '#fff' : '#8B0000'} 
                />
                <Text style={[
                  styles.paymentText,
                  paymentMethod === 'cash' && styles.paymentTextActive
                ]}>
                  Payer sur place
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  paymentMethod === 'carte_banquaire' && styles.paymentButtonActive
                ]}
                onPress={() => setPaymentMethod('carte_banquaire')}
              >
                <FontAwesome 
                  name="credit-card" 
                  size={wp(5)} 
                  color={paymentMethod === 'carte_banquaire' ? '#fff' : '#8B0000'} 
                />
                <Text style={[
                  styles.paymentText,
                  paymentMethod === 'carte_banquaire' && styles.paymentTextActive
                ]}>
                  Payer par carte
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.orderButton} 
              onPress={send_commandes}
              activeOpacity={0.8}
            >
              <Text style={styles.orderButtonText}>
                {paymentMethod === 'carte_banquaire' ? 'Procéder au paiement' : 'Valider la commande'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: hp(3),
    paddingHorizontal: wp(5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
    fontSize: wp(8),
    lineHeight: hp(4),
    color: '#8B0000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(15),
  },
  emptyIcon: {
    opacity: 0.7,
    marginBottom: hp(2),
  },
  emptyText: {
    fontSize: wp(5),
    color: '#8B0000',
    fontWeight: '600',
    marginTop: hp(2),
  },
  emptySubText: {
    fontSize: wp(4),
    color: '#888',
    marginTop: hp(1),
  },
  itemsContainer: {
    flex: 1,
  },
  itemsContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalLabel: {
    fontSize: wp(5),
    fontWeight: '600',
    color: '#555',
  },
  totalValue: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#8B0000',
  },
  tableToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  toggleLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: wp(4),
    color: '#888',
    marginLeft: wp(2),
  },
  toggleLabelActive: {
    color: '#8B0000',
    fontWeight: '600',
  },
  inputRow: {
    marginBottom: hp(3),
  },
  tableInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp(2),
    padding: wp(3.5),
    fontSize: wp(4),
    color: '#555',
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: wp(2),
    paddingVertical: hp(1.5),
    marginHorizontal: wp(1),
  },
  paymentButtonActive: {
    backgroundColor: '#8B0000',
  },
  paymentText: {
    fontSize: wp(3.8),
    fontWeight: '600',
    color: '#8B0000',
    marginLeft: wp(2),
  },
  paymentTextActive: {
    color: '#fff',
  },
  orderButton: {
    backgroundColor: '#8B0000',
    borderRadius: wp(2),
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default MycartScreen;