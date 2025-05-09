import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Dimensions,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import Api_plat from '../api_plats';
import Plat from '../composent/plat';
import { CartContext } from '../CartContext';

const {width, height} = Dimensions.get('window');
const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

const ITEMS_PER_PAGE = 8;

const MenuScreen = () => {
  const { cartItems, setCartItems } = useContext(CartContext);
  const navigation = useNavigation();
  
  const [plats, setPlats] = useState([]);
  const [filteredPlats, setFilteredPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Catégories avec icônes
  const categories = [
    { id: 'all', name: 'All', icon: 'food' },
    { id: 'beverage', name: 'Beverage', icon: 'glass-cocktail' },
    { id: 'chinese', name: 'Chinese', icon: 'noodles' },
    { id: 'dessert', name: 'Dessert', icon: 'cupcake' },
    { id: 'french', name: 'French', icon: 'food-croissant' },
    { id: 'healthy food', name: 'Healthy', icon: 'food-apple' },
    { id: 'indian', name: 'Indian', icon: 'food-curry' },
    { id: 'italian', name: 'Italian', icon: 'food-pasta' },
    { id: 'japanese', name: 'Japanese', icon: 'food-sushi' },
    { id: 'korean', name: 'Korean', icon: 'food-variant' },
    { id: 'mexican', name: 'Mexican', icon: 'food-taco' },
    { id: 'nepalese', name: 'Nepalese', icon: 'food-drumstick' },
    { id: 'snack', name: 'Snack', icon: 'food-hot-dog' },
    { id: 'spanish', name: 'Spanish', icon: 'food-fork-drink' },
    { id: 'thai', name: 'Thai', icon: 'food-variant' },
    { id: 'vietnamese', name: 'Vietnamese', icon: 'food-variant' }
  ];

  useEffect(() => {
    const fetchAvailablePlats = async () => {
      try {
        setLoading(true);
        const response = await Api_plat.getAvailablePlats();
        setPlats(response.data?.plats || []);
        setFilteredPlats(response.data?.plats || []);
        calculatePages(response.data?.plats || []);
      } catch (error) {
        console.error('Error fetching available plats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailablePlats();
  }, []);

  useEffect(() => {
    let result = plats;
    
    if (activeCategory !== 'all') {
      result = result.filter(plat => 
        plat.categorie_plat.toLowerCase() === activeCategory
      );
    }
    
    if (searchQuery) {
      result = result.filter(plat =>
        plat.nom_plat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plat.Description_plat.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredPlats(result);
    calculatePages(result);
    setCurrentPage(1);
  }, [activeCategory, searchQuery, plats]);

  const calculatePages = (items) => {
    const total = Math.ceil(items.length / ITEMS_PER_PAGE);
    setTotalPages(total > 0 ? total : 1);
  };

  const getPaginatedPlats = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPlats.slice(startIndex, endIndex);
  };

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Fonction pour afficher les boutons de pagination de manière optimisée
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Nombre maximum de pages visibles à la fois

    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Afficher avec des ellipses (...)
      if (currentPage <= 3) {
        // Premières pages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Dernières pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Pages au milieu
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <Text key={`ellipsis-${index}`} style={styles.pageEllipsis}>
            ...
          </Text>
        );
      }

      return (
        <TouchableOpacity
          key={page}
          style={[
            styles.pageNumber,
            currentPage === page && styles.pageNumberActive
          ]}
          onPress={() => handlePageChange(page)}
        >
          <Text style={[
            styles.pageNumberText,
            currentPage === page && styles.pageNumberTextActive
          ]}>
            {page}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Menu</Text>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={wp(5)} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.cartContainer}
            onPress={() => navigation.navigate('Mycart')}
          >
            <FontAwesome name="shopping-cart" size={wp(5)} color="#8B0000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity 
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <MaterialCommunityIcons 
              name={category.icon} 
              size={wp(6)} 
              color={activeCategory === category.id ? '#8B0000' : '#555'} 
            />
            <Text style={[
              styles.categoryText,
              activeCategory === category.id && styles.categoryTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      {filteredPlats.length > 0 ? (
        <>
          <FlatList
            data={getPaginatedPlats()}
            renderItem={({item}) => (
              <Plat key={item.id_plat} item={item} setCartItems={setCartItems} />
            )}
            keyExtractor={(item) => item.id_plat.toString()}
            numColumns={2}
            columnWrapperStyle={styles.menuRow}
            contentContainerStyle={styles.menuContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Pagination améliorée */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              style={styles.pageButton}
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FontAwesome 
                name="chevron-left" 
                size={wp(4)} 
                color={currentPage === 1 ? '#ccc' : '#8B0000'} 
              />
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.paginationScrollContent}
            >
              {renderPageNumbers()}
            </ScrollView>

            <TouchableOpacity 
              style={styles.pageButton}
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FontAwesome 
                name="chevron-right" 
                size={wp(4)} 
                color={currentPage === totalPages ? '#ccc' : '#8B0000'} 
              />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="food-off" size={wp(20)} color="#ccc" />
          <Text style={styles.emptyText}>No items found</Text>
          <Text style={styles.emptySubText}>Try another category or search term</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: hp(2.5),
    backgroundColor: '#fff',
  },
  headerText: {
    fontFamily: 'SFProDisplay-Bold',
    fontWeight: '700',
    fontSize: wp(8.5),
    lineHeight: hp(4),
    letterSpacing: 0,
    color: '#8B0000',
    marginBottom: hp(1),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: wp(2.7),
    paddingHorizontal: wp(3),
    height: hp(6),
    justifyContent: 'space-between', // Modifiez cette ligne
  },
  searchIcon: {
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    color: '#555',
    fontSize: wp(4),
    marginLeft: wp(2), // Ajoutez cette ligne
  },
  cartContainer: {
    backgroundColor: '#FFC01D',
    height: hp(6),
    width: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(2.7),
    marginRight : -10, // Ajoutez cette ligne
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: hp(1),
  },
  categoryContent: {
    paddingHorizontal: wp(2),// Ajoutez cette ligne
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: wp(4),
    paddingHorizontal: wp(2),
    paddingTop: wp(2),
    paddingBottom: wp(3), // Plus d'espace en bas
    minWidth: wp(20),
 // Ajoutez cette ligne
  },
  categoryButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
    marginBottom: -8, // Compensation parfaite
  },
  categoryText: {
    fontFamily: 'SFProDisplay-Medium',
    fontSize: wp(3.5),
    color: '#555',
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#8B0000',
    fontWeight: 'bold',
  },
  menuContainer: {
    paddingHorizontal: wp(2),
    paddingBottom: hp(2),
    marginTop: hp(4),
  },
  menuRow: {
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  emptyText: {
    fontSize: wp(4.5),
    color: '#555',
    marginTop: hp(2),
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: wp(3.5),
    color: '#888',
    marginTop: hp(1),
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#eee',
    width: '100%', // Ajoutez cette ligne
  },
  paginationScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Ajoutez cette ligne
    flexGrow: 1, // Ajoutez cette ligne
  },
  pageButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  pageNumber: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    marginHorizontal: wp(0.5),
  },
  pageNumberActive: {
    backgroundColor: '#8B0000',
    borderRadius: wp(1),
  },
  pageNumberText: {
    fontSize: wp(4),
    color: '#555',
  },
  pageNumberTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageEllipsis: {
    fontSize: wp(4),
    color: '#555',
    paddingHorizontal: wp(2),
  },
});

export default MenuScreen;