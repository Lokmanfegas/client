import { useState, useCallback, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Dimensions,
  FlatList
} from "react-native";
import { 
  FontAwesome, 
  MaterialIcons, 
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import PlatPref from "../composent/plat_pref";
import Api_plat_pref from "../api_pla_pref";
import Api_plat from "../api_plats";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get("window");
const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

const MyListScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const navigation = useNavigation();

  // Catégories avec icônes

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

  useFocusEffect(
    useCallback(() => {
      if (!clientId) return;

      const fetchData = async () => {
        try {
          const favoritePlatsResponse = await Api_plat_pref.getFavoritePlats(clientId);
          const favoritePlats = favoritePlatsResponse.data.plats;
          const availablePlatsResponse = await Api_plat.getAvailablePlats();
          const availablePlats = availablePlatsResponse.data.plats;
          
          const merged = availablePlats.map((availablePlat) => {
            const isFavorite = favoritePlats.some(
              (favoritePlat) => favoritePlat.id_plat === availablePlat.id_plat
            );
            if (isFavorite) return availablePlat;
          });
          
          setFoodItems(merged.filter(item => item !== undefined));
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      };
      fetchData();
    }, [clientId])
  );

  const removeItem = (id) => {
    if (!clientId) {
      console.warn("Client ID non disponible");
      return;
    }
    setFoodItems(foodItems.filter((item) => item.id_plat !== id));
    Api_plat_pref.deleteFavoritePlat(clientId, id);
  };

  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.nom_plat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || 
      item.categorie_plat.toLowerCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Favorites</Text>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={wp(4.5)} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search favorites..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('Mycart')}
          >
            <FontAwesome name="shopping-cart" size={wp(5)} color="#8B0000" />
          </TouchableOpacity>
        </View>
      </View>

     
      {/* Food Items List */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={({item}) => (
            <PlatPref key={item.id_plat} item={item} removeItem={removeItem} />
          )}
          keyExtractor={(item) => item.id_plat.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="heart-off" 
            size={wp(20)} 
            color="#ccc" 
          />
          <Text style={styles.emptyText}>Your favorites list is empty</Text>
          <Text style={styles.emptySubText}>
            {searchQuery || activeCategory !== 'all' 
              ? 'No matches for your search' 
              : 'Add items to your favorites'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: wp(5),
    paddingTop: hp(3),
    backgroundColor: "#fff",
  },
  headerText: {
    fontFamily: "SFProDisplay-Bold",
    fontWeight: "700",
    fontSize: wp(8),
    color: '#8B0000',
    marginBottom: hp(1),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    height: hp(6),
  },
  searchIcon: {
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    color: "#555",
    fontSize: wp(4),
  },
  cartButton: {
    marginLeft: wp(3),
    backgroundColor: "#FFC01D",
    height: hp(5.5),
    width: hp(5.5),
    borderRadius: wp(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: "#fff",
    paddingVertical: hp(1),
  },
  categoryContent: {
    paddingHorizontal: wp(4),
  },
  categoryButton: {
    alignItems: "center",
    marginRight: wp(6),
    padding: wp(2),
    minWidth: wp(18),
  },
  categoryButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#8B0000",
  },
  categoryText: {
    fontFamily: "SFProDisplay-Medium",
    fontSize: wp(3.5),
    color: "#555",
    marginTop: hp(0.5),
  },
  categoryTextActive: {
    color: "#8B0000",
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  emptyText: {
    fontSize: wp(5),
    color: '#555',
    marginTop: hp(2),
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: wp(4),
    color: '#888',
    marginTop: hp(1),
    textAlign: 'center',
  },
});

export default MyListScreen;