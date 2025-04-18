import React, {useState} from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput,
  Dimensions
} from 'react-native';
// loukman 3ndkoum 6  champions league w7na 16 
// loukman ntouma froucha 








import { useNavigation } from '@react-navigation/native';
import Api_plat from '../api_plats';
import Plat from '../composent/plat';
import { useEffect } from 'react';
const {width, height} = Dimensions.get('window');

import { CartContext } from '../CartContext';
import { useContext } from 'react';
const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

const MenuScreen = () => {

  const { cartItems, setCartItems } = useContext(CartContext);

  const navigation = useNavigation();
  const [plats, setPlats] = useState([]);

  console.log("cartItems ",cartItems);
useEffect(() => {

  const fetchAvailablePlats = async () => {
    try {
      const response = await Api_plat.getAvailablePlats();
      setPlats(response.data.plats);
    } catch (error) {
      console.error('Error fetching available plats:', error);
    }
  };

  fetchAvailablePlats();


}, []);





  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Menu</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#888"
          />
          <View style={styles.cartContainer}>
            <TouchableOpacity>
              <Image 
                source={require('../assets/panier.png')} 
                style={styles.cartIcon}
              />
            </TouchableOpacity>
          </View> 
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        <TouchableOpacity style={styles.categoryButtonActive}>
          <Image 
            source={require('../assets/all.png')}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryButton}>
          <Image 
            source={require('../assets/burger1.png')}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Burger</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryButton}>
          <Image 
            source={require('../assets/pasta1.png')}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Pasta</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryButton}>
          <Image 
            source={require('../assets/seafood.png')}
            style={styles.categoryImage}
          />
          <Text style={styles.categoryText}>Sea Food</Text>
        </TouchableOpacity>
      </ScrollView>

     
  <ScrollView style={styles.menuContainer}>
  <View style={styles.menuRow}>
    {plats.map((item) => (
      <Plat key={item.id_plat} item={item} setCartItems={setCartItems} />
    ))}
  </View>
  </ScrollView>

     





     

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: hp(2.5),
    backgroundColor: '#fff',
  },
  headerText: {
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
    fontSize: wp(8.5),
    lineHeight: hp(4),
    letterSpacing: 0,
  },
  searchContainer: {
    
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: wp(2.7),
    width: wp(75),
  },
  searchInput: {
    flex: 1,
    color: '#555',
    paddingLeft: wp(6.7),
    fontSize: wp(4.3),
    
  },
  cartContainer: {
    marginRight: wp(-15),
    backgroundColor: '#FFC01D',
    height: hp(6.3),
    width: wp(13.1),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(2.7),
  },
  cartIcon: {
    width: wp(6.7),
    height: hp(3.1),
    resizeMode: 'contain',
  },
  categoryContainer: {
    paddingHorizontal: wp(4),
    backgroundColor: '#fff',
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: wp(5.3),
  },
  categoryButtonActive: {
    alignItems: 'center',
    marginRight: wp(5.3),
  },
  categoryImage: {
    width: wp(19.7),
    height: hp(10.1),
    borderRadius: wp(2.7),
    marginBottom: hp(0.6),
  },
  categoryText: {
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
    fontSize: wp(4),
    lineHeight: hp(4),
    letterSpacing: 0,
  },
 
  menuContainer: {
    flex: 1,
    paddingHorizontal: wp(4), // Réduisez le padding horizontal
    backgroundColor: '#F4F5F6',
    borderRadius: wp(2.7),
    margin: wp(2.1),
    marginTop: -530
  },
  menuRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: hp(2),
    paddingHorizontal: wp(2), // Ajustez selon vos besoins
  },
  
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: hp(1.8),
  },
  pageButton: {
    backgroundColor: '#D9D9D9',
    borderRadius: wp(2.7),
    marginRight: wp(1.3),
    paddingHorizontal: wp(2.7),
  },
  pageNumber: {
    paddingHorizontal: wp(2.7),
  },
  pageNumberActive: {
    paddingHorizontal: wp(2.7),
    backgroundColor: '#9E090F',
    borderRadius: wp(13.3),
    paddingVertical: hp(0.5),
  },
  pageText: {
    color: '#fff',
    fontSize: wp(3.7),
  },
  pageNumberText: {
    color: '#555',
    fontSize: wp(3.7),
  },
  pageNumberTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wp(3.7),
  },
  

});

export default MenuScreen;

