import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Api_maladie from "@/api_maladie";
import Api_reservation from "@/api_reservation";
import Api_categorie from "@/api_categorie";
import EvilIcons from '@expo/vector-icons/EvilIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [healthAlertsVisible, setHealthAlertsVisible] = useState(false);
  const [foodPreferencesVisible, setFoodPreferencesVisible] = useState(false);
  const [reservationsVisible, setReservationsVisible] = useState(false);
  const [availableHealthIssues, setAvailableHealthIssues] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    age: "",
    points: "0 points",
    healthIssues: [],
    foodPreferences: []
  });
  const [selectedHealthIssues, setSelectedHealthIssues] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const storedUser = await AsyncStorage.getItem("userData");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserData({
              name: parsedUser.name || "",
              email: parsedUser.email || "",
              age: parsedUser.age ? `${parsedUser.age} ans` : "",
              points: "0 points",
              healthIssues: [],
              foodPreferences: []
            });
            setClientId(parsedUser.id);

            // Charger les maladies
            const maladiesResponse = await Api_maladie.getMaladies();
            if (maladiesResponse?.data?.maladies) {
              setAvailableHealthIssues(maladiesResponse.data.maladies);

              if (parsedUser.id) {
                const clientMaladies = await Api_maladie.getClientMaladies(parsedUser.id);
                if (clientMaladies?.data?.maladies) {
                  const clientMaladiesWithDetails = clientMaladies.data.maladies.map(clientMaladie => {
                    const maladieDetails = maladiesResponse.data.maladies.find(
                      m => m.id_maladie === clientMaladie.id_maladie
                    );
                    return {
                      ...clientMaladie,
                      ...maladieDetails
                    };
                  });

                  const maladiesIds = clientMaladiesWithDetails.map(m => m.id_maladie);
                  const maladiesNames = clientMaladiesWithDetails.map(m => m.nom_maladie);

                  setSelectedHealthIssues(maladiesIds);
                  setUserData(prev => ({
                    ...prev,
                    healthIssues: maladiesNames
                  }));
                }
              }
            }

            // Charger les catégories
            const categoriesResponse = await Api_categorie.getCategories();
            if (categoriesResponse?.data?.categories) {
              setAvailableCategories(categoriesResponse.data.categories);

              if (parsedUser.id) {
                const clientCategories = await Api_categorie.getClientCategories(parsedUser.id);
                if (clientCategories?.data?.clientCategorie) {
                  const categoriesNames = clientCategories.data.clientCategorie.map(c => c.nom_categorie);
                  setSelectedCategories(categoriesNames);
                  setUserData(prev => ({
                    ...prev,
                    foodPreferences: categoriesNames
                  }));
                }
              }
            }

            // Charger les réservations
            if (parsedUser.id) {
              const reservationsResponse = await Api_reservation.getClientReservations(parsedUser.id);
              setReservations(reservationsResponse.data.reservation || []);
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [isLoading])
  );

  const deleteReservation = async (id_reserv) => {
    try {
      if (!clientId) return;
      
      await Api_reservation.deleteReservation(clientId, id_reserv);
      alert("Réservation supprimée avec succès");
      
      // Rafraîchir les données
      const reservationsResponse = await Api_reservation.getClientReservations(clientId);
      if (reservationsResponse?.data?.reservation) {
        setReservations(reservationsResponse.data.reservation);
      } else if (reservationsResponse?.data) {
        setReservations(reservationsResponse.data);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de la réservation");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const toggleHealthIssue = (maladie) => {
    setSelectedHealthIssues(prev => {
      if (prev.includes(maladie.id_maladie)) {
        return prev.filter(id => id !== maladie.id_maladie);
      } else {
        return [...prev, maladie.id_maladie];
      }
    });
  };

  const saveHealthIssues = async () => {
    try {
      if (!clientId) return;

      const currentMaladiesResponse = await Api_maladie.getClientMaladies(clientId);
      const currentMaladies = currentMaladiesResponse?.data?.maladies || [];
      const currentMaladiesIds = currentMaladies.map(m => m.id_maladie);

      const toAdd = selectedHealthIssues.filter(id => !currentMaladiesIds.includes(id));
      const toRemove = currentMaladiesIds.filter(id => !selectedHealthIssues.includes(id));

      const validToRemove = toRemove.filter(id => 
        currentMaladies.some(m => m.id_maladie === id)
      );

      for (const id_maladie of toAdd) {
        try {
          await Api_maladie.linkClientMaladie(clientId, id_maladie);
        } catch (error) {
          continue;
        }
      }

      for (const id_maladie of validToRemove) {
        try {
          await Api_maladie.deleteClientMaladie(clientId, id_maladie);
        } catch (error) {
          continue;
        }
      }
      
      setIsLoading(prev => !prev);
      setHealthAlertsVisible(false);
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const toggleFoodPreference = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category.nom_categorie)) {
        return prev.filter(c => c !== category.nom_categorie);
      } else {
        return [...prev, category.nom_categorie];
      }
    });
  };

  const saveFoodPreferences = async () => {
    try {
      if (!clientId) return;

      // Récupérer les catégories actuelles du client
      const currentCategoriesResponse = await Api_categorie.getClientCategories(clientId);
      const currentCategories = currentCategoriesResponse?.data?.clientCategorie || [];
      const currentCategoriesNames = currentCategories.map(c => c.nom_categorie);

      // Déterminer les catégories à ajouter et à supprimer
      const toAdd = selectedCategories.filter(name => !currentCategoriesNames.includes(name));
      const toRemove = currentCategoriesNames.filter(name => !selectedCategories.includes(name));

      // Ajouter les nouvelles catégories
      for (const nom_categorie of toAdd) {
        try {
          await Api_categorie.addClientCategorie(clientId, nom_categorie);
        } catch (error) {
          console.error(`Erreur lors de l'ajout de la catégorie ${nom_categorie}:`, error);
          continue;
        }
      }

      // Supprimer les catégories désélectionnées
      for (const nom_categorie of toRemove) {
        try {
          await Api_categorie.deleteClientCategorie(clientId, nom_categorie);
        } catch (error) {
          console.error(`Erreur lors de la suppression de la catégorie ${nom_categorie}:`, error);
          continue;
        }
      }
      
      setIsLoading(prev => !prev);
      setFoodPreferencesVisible(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des préférences:", error);
    }
  };

  const renderReservationItem = ({ item }) => (
    <View style={styles.reservationItem}>
      <View style={styles.reservationInfo}>
        <View style={styles.reservationIconContainer}>
          <MaterialIcons name="table-restaurant" size={24} color="#4CAF50" />
          <Text style={styles.reservationText}>Table {item.id_table}</Text>
        </View>
        
        <View style={styles.reservationIconContainer}>
          <FontAwesome name="users" size={18} color="#2196F3" />
          <Text style={styles.reservationText}>{item.nb_personne} personnes</Text>
        </View>
        
        <View>
          <Text style={styles.reservationText}>Début: {formatDate(item.date_deb_res)}</Text>
          <Text style={styles.reservationText}>Fin: {formatDate(item.date_fin_res)}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={() => deleteReservation(item.id_reserv)}
        style={styles.deleteButton}
      >
        <MaterialIcons name="delete" size={24} color="#FF0000" />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.healthOption,
        selectedCategories.includes(item.nom_categorie) && styles.selectedOption,
      ]}
      onPress={() => toggleFoodPreference(item)}
    >
      <Text style={styles.healthOptionText}>{item.nom_categorie}</Text>
      {selectedCategories.includes(item.nom_categorie) && (
        <FontAwesome name="check" size={16} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      {/* Contenu principal avec défilement */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image de fond */}
        <View style={styles.backgroundContainer}>
          <Image
            source={require("../assets/background_image.png")}
            style={styles.backgroundImage}
          />
        </View>

        {/* Profil info */}
        <View style={styles.profileInfoSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require("../assets/photo_profile.png")}
              style={styles.profileImage}
            />
          </View>

          <View style={styles.userInfoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userData.name}</Text>
              <TouchableOpacity style={styles.editButton}>
                {/*<Image source={require('../assets/stylo.png')} style={styles.editIcon} /> */}
              </TouchableOpacity>
            </View>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <Text style={styles.userAge}>{userData.age}</Text>
            <Text style={styles.userPoints}>{userData.points}</Text>
          </View>
        </View>

        {/* Section Health Alerts */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Alerts</Text>
            <TouchableOpacity onPress={() => setHealthAlertsVisible(true)}>
              <EvilIcons name="pencil" size={30} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.healthIssuesContainer}>
            {userData.healthIssues.map((issue, index) => (
              <View key={index} style={styles.healthIssueTag}>
                <Text style={styles.healthIssueText}>{issue}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Food Preferences */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Food Preferences</Text>
            <TouchableOpacity onPress={() => setFoodPreferencesVisible(true)}>
              <EvilIcons name="pencil" size={30} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.healthIssuesContainer}>
            {userData.foodPreferences.map((preference, index) => (
              <View key={index} style={styles.foodPreferenceTag}>
                <Text style={styles.foodPreferenceText}>{preference}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Mes Réservations */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes Réservations</Text>
            <TouchableOpacity onPress={() => setReservationsVisible(true)}>
              <EvilIcons name="arrow-right" size={30} color="black" />
            </TouchableOpacity>
          </View>

          {reservations.length > 0 ? (
            <FlatList
              data={reservations.slice(0, 2)}
              renderItem={renderReservationItem}
              keyExtractor={(item) => item.id_reserv.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noReservationsText}>Aucune réservation</Text>
          )}

          {reservations.length > 2 && (
            <TouchableOpacity 
              style={styles.seeMoreButton}
              onPress={() => setReservationsVisible(true)}
            >
              <Text style={styles.seeMoreText}>Voir plus ({reservations.length - 2} autres)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal pour les problèmes de santé */}
        <Modal
          visible={healthAlertsVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setHealthAlertsVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Health Issues</Text>
              <ScrollView style={styles.healthOptionsList}>
                {availableHealthIssues.map((item) => (
                  <TouchableOpacity
                    key={item.id_maladie}
                    style={[
                      styles.healthOption,
                      selectedHealthIssues.includes(item.id_maladie) &&
                        styles.selectedOption,
                    ]}
                    onPress={() => toggleHealthIssue(item)}
                  >
                    <Text style={styles.healthOptionText}>{item.nom_maladie}</Text>
                    {selectedHealthIssues.includes(item.id_maladie) && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setHealthAlertsVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveHealthIssues}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal pour les préférences alimentaires */}
        <Modal
          visible={foodPreferencesVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setFoodPreferencesVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Food Preferences</Text>
              <ScrollView style={styles.healthOptionsList}>
                {availableCategories.map((item) => (
                  <TouchableOpacity
                    key={item.nom_categorie}
                    style={[
                      styles.healthOption,
                      selectedCategories.includes(item.nom_categorie) &&
                        styles.selectedOption,
                    ]}
                    onPress={() => toggleFoodPreference(item)}
                  >
                    <Text style={styles.healthOptionText}>{item.nom_categorie}</Text>
                    {selectedCategories.includes(item.nom_categorie) && (
                      <FontAwesome name="check" size={16} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setFoodPreferencesVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveFoodPreferences}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal pour les réservations */}
        <Modal
          visible={reservationsVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReservationsVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { height: hp(70) }]}>
              <Text style={styles.modalTitle}>Mes Réservations</Text>
              
              {reservations.length > 0 ? (
                <FlatList
                  data={reservations}
                  renderItem={renderReservationItem}
                  keyExtractor={(item) => item.id_reserv.toString()}
                  contentContainerStyle={styles.reservationsList}
                />
              ) : (
                <View style={styles.noReservationsContainer}>
                  <Text style={styles.noReservationsText}>Aucune réservation</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setReservationsVisible(false)}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Espace supplémentaire en bas */}
        <View style={{ height: hp(10) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: wp(4),
  },
  backIcon: {
    width: wp(6),
    height: wp(6),
  },
  headerText: {
    fontSize: wp(7),
    fontWeight: "bold",
  },
  scrollContent: {
    flex: 1,
  },
  backgroundContainer: {
    height: hp(20),
    width: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileInfoSection: {
    flexDirection: "row",
    paddingHorizontal: wp(5),
    marginTop: hp(-2),
    marginBottom: hp(3),
  },
  profileImageContainer: {
    marginRight: wp(5),
  },
  profileImage: {
    marginTop: wp(-8),
    width: wp(24),
    height: wp(24),
    borderRadius: wp(11),
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: hp(2),
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  userName: {
    fontSize: wp(5),
    fontWeight: "bold",
    marginRight: wp(2),
  },
  editButton: {
    padding: wp(1),
  },
  editIcon: {
    width: wp(4),
    height: wp(4),
    resizeMode: "contain",
  },
  userEmail: {
    fontSize: wp(3.5),
    color: "#666",
    marginBottom: hp(0.5),
  },
  userAge: {
    fontSize: wp(3.5),
    color: "#666",
    marginBottom: hp(0.5),
  },
  userPoints: {
    fontSize: wp(3.5),
    color: "#FFC01D",
    fontWeight: "bold",
  },
  sectionContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(3),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#000",
  },
  healthIssuesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  healthIssueTag: {
    backgroundColor: "#F8E6E6",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    marginRight: wp(2),
    marginBottom: hp(1),
  },
  healthIssueText: {
    fontSize: wp(3.5),
    color: "#8B0000",
  },
  foodPreferenceTag: {
    backgroundColor: "#E3F2FD",
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    marginRight: wp(2),
    marginBottom: hp(1),
  },
  foodPreferenceText: {
    fontSize: wp(3.5),
    color: "#0D47A1",
  },
  reservationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(1),
  },
  reservationInfo: {
    flex: 1,
  },
  reservationIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  reservationText: {
    fontSize: wp(3.5),
    marginLeft: wp(2),
    color: "#333",
  },
  deleteButton: {
    padding: wp(2),
  },
  noReservationsText: {
    fontSize: wp(3.5),
    color: "#666",
    textAlign: "center",
    marginVertical: hp(1),
  },
  seeMoreButton: {
    alignSelf: "center",
    marginTop: hp(1),
  },
  seeMoreText: {
    color: "#2196F3",
    fontSize: wp(3.5),
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: wp(85),
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(4),
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    marginBottom: hp(2),
    textAlign: "center",
  },
  healthOptionsList: {
    maxHeight: hp(40),
  },
  healthOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedOption: {
    backgroundColor: "#F8F8F8",
  },
  healthOptionText: {
    fontSize: wp(4),
    color: "#333",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryText: {
    fontSize: wp(4),
    color: "#333",
  },
  checkIcon: {
    color: "#4CAF50",
    fontSize: wp(4),
    fontWeight: "bold",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(2),
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: "center",
    marginHorizontal: wp(1),
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: wp(4),
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#FFC01D",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "red",
    marginTop: hp(2),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: "center",
    marginHorizontal: wp(1),
  },
  closeButtonText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "bold",
  },
  reservationsList: {
    paddingBottom: hp(2),
  },
  noReservationsContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: hp(30),
  },
});

export default ProfileScreen;