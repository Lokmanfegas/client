"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  FlatList,
  Modal,
  ActivityIndicator
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { FontAwesome, MaterialIcons, MaterialCommunityIcons , Ionicons } from '@expo/vector-icons';
import Api_reservation from "../api_reservation"
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Api_plat_pref from "../api_plat_recemendé";
import Api_plat from "../api_plats";
import Plat from "@/composent/plat";
import Api_commande from "@/api_commande";
import { Badge } from 'react-native-elements';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

const { width, height } = Dimensions.get("window")

const wp = (size) => (width / 100) * size
const hp = (size) => (height / 100) * size

const HomeScreen = () => {
  const [clientId, setClientId] = useState(null);
  const [recommendedPlats, setRecommendedPlats] = useState([]);
  const [trendingPlats, setTrendingPlats] = useState([]);
  const [allPlats, setAllPlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 2 * 60 * 60 * 1000));
  const [numberOfPeople, setNumberOfPeople] = useState("1");
  const [dateError, setDateError] = useState(false);
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [callWaiterModalVisible, setCallWaiterModalVisible] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [callWaiterLoading, setCallWaiterLoading] = useState(false);
  const [callWaiterError, setCallWaiterError] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  const navigation = useNavigation();



  useEffect(() => {
    const loadData = async () => {
      try {
        const id = await AsyncStorage.getItem('clientId');
        if (id) {
          setClientId(parseInt(id));
          await fetchRecommendedPlats(parseInt(id));
        }
        await fetchTrendingPlats();
        await fetchAllPlats();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  useEffect(  () => {
    const fechnotif = async()=>{
      if (!clientId) return;
  
    const q = query(
      collection(db, 'client_rating_notifications'),
      where('id_client', '==', clientId),
      where('isRead', '==', false),
      where('status', '==', 'sent')
   
    );
    const querySnapshot = await getDocs(q);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notificationsData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() || null;
      return {
        id: doc.id,
        ...data,
        createdAt,
      };
    }).filter(order => {
      const orderDate = order.createdAt;
      return orderDate && orderDate >= today;
    });

     setNotificationCount(notificationsData.length);

    }
    fechnotif();
    const intervalId = setInterval(() => {
      fechnotif();
    }, 10000);
  
    return () => clearInterval(intervalId);
        

  }, [clientId]);

 

console.log(notificationCount);
  useEffect(() => {
    if (bookingModalVisible) {
      fetchTables();
      fetchReservations();
    }
  }, [bookingModalVisible]);

  useEffect(() => {
    if (startDate) {
      checkTableAvailability();
    }
  }, [startDate, endDate, reservations]);




  const handleCallWaiter = async () => {
    if (!tableNumber) {
      setCallWaiterError("Veuillez entrer le numéro de table");
      return;
    }
  
    try {
    
      setCallWaiterLoading(true);
      setCallWaiterError("");
      
      const response = await Api_commande.callWaiter(clientId, tableNumber);
     
      
        alert("Serveur appelé avec succès!");
        setCallWaiterModalVisible(false);
        setTableNumber("");
      
    } catch (error) {
      console.error("Error calling waiter:", error);
      setCallWaiterError(error.message || "Erreur lors de l'appel du serveur");
    } finally {
      setCallWaiterLoading(false);
    }
  };



  const fetchRecommendedPlats = async (clientId) => {
    try {
      const clientResponse = await Api_plat_pref.getClientById(clientId);
      if (clientResponse.success) {
        const recommendedNames = clientResponse.recommendations;
        const allPlatsResponse = await Api_plat.getAvailablePlats();
        const filteredPlats = allPlatsResponse.data.plats.filter(plat => 
          recommendedNames.includes(plat.nom_plat)
        );
        setRecommendedPlats(filteredPlats);
      }
    } catch (error) {
      console.error('Error fetching recommended plats:', error);
    }
  };

  const fetchTrendingPlats = async () => {
    try {
      const response = await Api_plat_pref.getRecommendedPlats("dinner");
      setTrendingPlats(response.data);
    } catch (error) {
      console.error('Error fetching trending plats:', error);
    }
  };

  const fetchAllPlats = async () => {
    try {
      const response = await Api_plat.getAvailablePlats();
      setAllPlats(response);
    } catch (error) {
      console.error('Error fetching all plats:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await Api_reservation.getTables();
      setTables(res.data.table);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await Api_reservation.getReservations();
      setReservations(res.data.reservation);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const checkTableAvailability = () => {
    if (!startDate || !endDate) return;
  
    const updatedTables = tables.map(table => {
      const isReserved = reservations.some(reservation => {
        const resStart = new Date(reservation.date_deb_res);
        const resEnd = new Date(reservation.date_fin_res);
        return (
          reservation.id_table === table.id_table &&
          ((startDate >= resStart && startDate < resEnd) ||
           (endDate > resStart && endDate <= resEnd) ||
           (startDate <= resStart && endDate >= resEnd))
        );
      });
      return { ...table, available: !isReserved };
    });
    
    setTables(updatedTables);
  };

  const handleBookTable = () => {
    setBookingModalVisible(true);
  };

  const handleTableSelection = (tableId) => {
    const table = tables.find(t => t.id_table === tableId);
    if (table && table.available) {
      setSelectedTable(tableId === selectedTable ? null : tableId);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const now = new Date();
      const minDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      
      if (selectedDate < minDate) {
        setDateError(true);
        return;
      }
      
      setDateError(false);
      setStartDate(selectedDate);
      if (selectedDate >= endDate) {
        setEndDate(new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000));
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      if (selectedDate <= startDate) {
        setDateError(true);
        return;
      }
      setDateError(false);
      setEndDate(selectedDate);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDone = async () => {
    if (!selectedTable || !startDate || !endDate) {
      setDateError(true);
      return;
    }
  
    const now = new Date();
    const minDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    
    if (startDate < minDate) {
      setDateError(true);
      return;
    }
  
    if (startDate >= endDate) {
      setDateError(true);
      return;
    }
  
    const selectedTableData = tables.find(t => t.id_table === selectedTable);
    const nbPlaces = selectedTableData.nb_place_table;
    const nbPersonnes = parseInt(numberOfPeople);
  
    if (nbPersonnes < Math.ceil(nbPlaces-2) || nbPersonnes > nbPlaces) {
      setDateError(true);
      alert(`Le nombre de personnes doit être entre ${Math.ceil(nbPlaces-2)} et ${nbPlaces} pour cette table`);
      return;
    }
  
    try {
      setLoading(true);
  
      const reservationData = {
        id_client: clientId,
        id_table: selectedTable,
        nb_personne: nbPersonnes,
        date_deb_rese: startDate.toISOString(),
        date_fin_res: endDate.toISOString(),
      };
  
      const response = await Api_reservation.createReservation(reservationData);
      alert("Reservation created successfully!");
  
      setBookingModalVisible(false);
      setSelectedTable(null);
      setStartDate(new Date());
      setEndDate(new Date(new Date().getTime() + 2 * 60 * 60 * 1000));
      setNumberOfPeople("1");
      setDateError(false);
      
      await fetchReservations();
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Erreur lors de la création de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title, data, viewAll = false) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {viewAll && (
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        )}
      </View>
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={({item}) => <Plat item={item} key={item.id_plat}/>}
          keyExtractor={(item) => item.id_plat.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foodList}
        />
      ) : (
        <Text style={styles.emptyText}>No items available</Text>
      )}
    </View>
  );

  const renderTableItem = (table) => {
    const isSelected = selectedTable === table.id_table;
    let tableColor;
    if (!table.available) {
      tableColor = "#FF0000";
    } else if (isSelected) {
      tableColor = "#2196F3";
    } else {
      tableColor = "#4CAF50";
    }
  
    return (
      <View key={table.id_table} style={styles.tableItem}>
        <MaterialIcons name="table-bar" size={40} color={tableColor} />
        <View style={styles.tableCapacity}>
          <Text style={styles.capacityNumber}>{table.nb_place_table}</Text>
          <FontAwesome name="group" size={12} color="black" />
        </View>
        <Text style={styles.tableNumber}>Table {table.id_table}</Text>
        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => handleTableSelection(table.id_table)}
          disabled={!table.available}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} />
        </TouchableOpacity>
      </View>
    );
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
  <Text style={styles.headerText}>Home</Text>
  <View style={{ flexDirection: "row", alignItems: "center" }}>
    <TouchableOpacity 
      onPress={() => navigation.navigate('Notification')}
      style={{ marginRight: 15, position: 'relative' }}
    >
      <MaterialCommunityIcons name="bell" size={wp(7)} color="#8B0000" />
      {notificationCount > 0 && (
        <Badge
          value={notificationCount}
          status="error"
          containerStyle={{ position: 'absolute', top: -5, right: -5 }}
        />
      )}
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
      <MaterialCommunityIcons name="account-circle" size={wp(10)} color="#8B0000" />
    </TouchableOpacity>
  </View>
</View>

          <View style={styles.searchRow}>
  <View style={styles.searchContainer}>
    <FontAwesome name="search" size={wp(5)} color="#888" />
    <TextInput 
      style={styles.searchInput} 
      placeholder="Search" 
      placeholderTextColor="#888" 
    />
  </View>
  <View style={styles.iconsContainer}>
    <TouchableOpacity 
      style={styles.iconButton}
      onPress={() => navigation.navigate('Game')}
    >
      <Ionicons name="game-controller" size={wp(6)} color="#8B0000" />
    </TouchableOpacity>
    <TouchableOpacity 
      style={styles.iconButton}
      onPress={() => navigation.navigate('Mycart')}
    >
      <FontAwesome name="shopping-cart" size={wp(6)} color="#8B0000" />
    </TouchableOpacity>
  </View>
</View>

          {/* Promo Banner */}
          <TouchableOpacity style={styles.promoBanner}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoPercentage}>20% OFF</Text>
              <Text style={styles.promoTitle}>SPECIAL{"\n"}OFFER</Text>
              <Text style={styles.promoValidity}>Valid until Mars 30th</Text>
            </View>
            <MaterialCommunityIcons name="food" size={wp(30)} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Recommended Section */}
        {recommendedPlats.length > 0 && renderSection("Picked for you", recommendedPlats, true)}

        {/* Trending Section */}
        {trendingPlats.length > 0 && renderSection("Trending Now", trendingPlats)}

        {/* All Plats Section */}
        {allPlats.length > 0 && renderSection("Discover More", allPlats, true)}

        {/* Book a Table Card */}
        <View style={styles.serviceCardContainer}>
          <View style={styles.bookTableCard}>
            <View style={styles.bookTableTextContainer}>
              <Text style={styles.bookTableTitle}>Book a table in advance</Text>
              <Text style={styles.bookTableSubtitle}>and save your time</Text>
              <TouchableOpacity style={styles.bookButton} onPress={handleBookTable}>
                <Text style={styles.bookButtonText}>Book here</Text>
                <MaterialIcons name="arrow-forward" size={wp(4)} color="#fff" />
              </TouchableOpacity>
            </View>
            <MaterialCommunityIcons name="table-furniture" size={wp(30)} color="#8B0000" />
          </View>
        </View>

        {/* Call Waiter Card */}
        <View style={styles.serviceCardContainer}>
          <View style={styles.callWaiterCard}>
            <Text style={styles.callWaiterTitle}>Call the waiter</Text>
            <MaterialCommunityIcons 
              name="account-tie-voice" 
              size={wp(30)} 
              color="#2196F3" 
              style={styles.waiterImage}
            />
            <TouchableOpacity 
            style={styles.callButton}
            onPress={() => setCallWaiterModalVisible(true)}
          >
            <Text style={styles.callButtonText}>Call waiter</Text>
            <MaterialIcons name="arrow-forward" size={wp(4)} color="#fff" />
          </TouchableOpacity>
          </View>
        </View>

        {/* Extra space */}
        <View style={{ height: hp(10) }} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bookingModalVisible}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Book table</Text>
                <Text style={styles.modalSubtitle}>Book your table</Text>
              </View>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionLabel}>Start date & Time</Text>
              <TouchableOpacity 
                style={[styles.dateInput, dateError && !startDate && styles.inputError]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text>{formatDateTime(startDate)}</Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="datetime"
                  minimumDate={new Date(new Date().getTime() + 3 * 60 * 60 * 1000)}
                  onChange={handleStartDateChange}
                />
              )}

              <Text style={styles.sectionLabel}>End date & Time</Text>
              <TouchableOpacity 
                style={[styles.dateInput, dateError && !endDate && styles.inputError]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text>{formatDateTime(endDate)}</Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="datetime"
                  minimumDate={new Date(startDate.getTime() + 60 * 60 * 1000)}
                  onChange={handleEndDateChange}
                />
              )}

<Text style={styles.sectionLabel}>Number of people</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="1"
                value={numberOfPeople}
                onChangeText={setNumberOfPeople}
                keyboardType="numeric"
              />

              {selectedTable && (
                <Text style={styles.infoText}>
                  Pour cette table ({tables.find(t => t.id_table === selectedTable)?.nb_place_table} places), 
                  entrez entre {Math.ceil(tables.find(t => t.id_table === selectedTable)?.nb_place_table-2)} 
                  et {tables.find(t => t.id_table === selectedTable)?.nb_place_table} personnes
                </Text>
              )}

              {dateError && (
                <Text style={styles.errorText}>
                  {startDate < new Date(new Date().getTime() + 3 * 60 * 60 * 1000) 
                    ? "La réservation doit être au moins 3 heures à l'avance" 
                    : "Dates invalides ou table non disponible"}
                </Text>
              )}
              <Text style={styles.sectionLabel}>Select table</Text>

              <View style={styles.tablesGrid}>
                {tables.map((table) => renderTableItem(table))}
              </View>

            

            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setBookingModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.doneButton, loading && styles.disabledButton]} 
                onPress={handleDone}
                disabled={loading}
              >
                <Text style={styles.doneButtonText}>
                  {loading ? "Processing..." : "Done"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  
<Modal
  animationType="none"
  transparent={true}
  visible={callWaiterModalVisible}
  onRequestClose={() => setCallWaiterModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <View>
          <Text style={styles.modalTitle}>Call Waiter</Text>
          <Text style={styles.modalSubtitle}>Request assistance</Text>
        </View>
        <TouchableOpacity onPress={() => setCallWaiterModalVisible(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modalBody}>
        <Text style={styles.sectionLabel_waiter}>Table Number</Text>
        <TextInput
          style={[styles.dateInput, callWaiterError && styles.inputError]}
          placeholder="Enter your table number"
          value={tableNumber}
          onChangeText={setTableNumber}
          keyboardType="numeric"
        />
        
        {callWaiterError && (
          <Text style={styles.errorText}>{callWaiterError}</Text>
        )}
      </View>

      <View style={styles.modalFooter}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setCallWaiterModalVisible(false)}
          disabled={callWaiterLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.doneButton_waiter, callWaiterLoading && styles.disabledButton]} 
          onPress={handleCallWaiter}
          disabled={callWaiterLoading}
        >
          <Text style={styles.doneButtonText}>
            {callWaiterLoading ? "Calling..." : "Call Waiter"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  header: {
    padding: hp(2.5),
    backgroundColor: "#fff",
  },
  headerText: {
    fontFamily: "SFProDisplay-Bold",
    fontWeight: "700",
    fontSize: wp(8.5),
    lineHeight: hp(4),
    letterSpacing: 0,
    color: '#8B0000'
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(2),
    justifyContent: "space-between",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: wp(2.7),
    paddingHorizontal: wp(3),
    flex: 1,
    height: hp(6),
  },
  searchInput: {
    flex: 1,
    color: "#555",
    fontSize: wp(4),
    marginLeft: wp(2)
  },
  cartContainer: {
    marginLeft: wp(3),
    backgroundColor: "#FFC01D",
    height: hp(6),
    width: wp(13),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(2.7),
  },
  promoBanner: {
    flexDirection: "row",
    backgroundColor: "#8B0000",
    borderRadius: wp(4),
    marginTop: hp(2),
    padding: wp(4),
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
  },
  promoTextContainer: {
    flex: 1,
  },
  promoPercentage: {
    color: "#FFC01D",
    fontSize: wp(4),
    fontWeight: "700",
  },
  promoTitle: {
    color: "#fff",
    fontSize: wp(6),
    fontWeight: "bold",
    marginVertical: hp(0.5),
  },
  promoValidity: {
    color: "#FFC01D",
    fontSize: wp(3.5),
  },
  sectionContainer: {
    paddingHorizontal: wp(4),
    marginTop: hp(2),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontWeight: "600",
    color: "#8B0000",
  },
  viewAllText: {
    fontSize: wp(3.5),
    color: "#888",
  },
  emptyText: {
    fontSize: wp(3.5),
    color: "#888",
    textAlign: 'center',
    marginVertical: hp(2)
  },
  foodList: {
    paddingRight: wp(4),
  },
  serviceCardContainer: {
    paddingHorizontal: wp(4),
    marginTop: hp(2),
  },
  bookTableCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: wp(4),
    padding: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookTableTextContainer: {
    flex: 1,
  },
  bookTableTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#000",
  },
  bookTableSubtitle: {
    fontWeight: "700",
    fontSize: wp(3.5),
    color: "#000",
    marginBottom: hp(1),
  },
  bookButton: {
    backgroundColor: "#8B0000",
    borderRadius: wp(5),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "500",
    marginRight: wp(1),
  },
  callWaiterCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: wp(4),
    padding: wp(4),
    alignItems: "center",
  },
  callWaiterTitle: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#000",
    marginBottom: hp(1),
    alignSelf: "flex-start",
  },
  waiterImage: {
    marginBottom: hp(1),
  },
  callButton: {
    backgroundColor: "#2196F3",
    borderRadius: wp(5),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  callButtonText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "500",
    marginRight: wp(1),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: wp(90),
    maxHeight: hp(80),
    borderRadius: wp(4),
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#000",
  },
  modalSubtitle: {
    fontSize: wp(3.5),
    color: "#666",
    marginTop: hp(0.5),
  },
  closeButton: {
    fontSize: wp(6),
    color: "#000",
    padding: wp(2),
  },
  modalBody: {
    padding: wp(5),
    maxHeight: hp(60),
  },
  sectionLabel: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: hp(1.5),
    marginTop: hp(1),
    color: '#8B0000'
  },
  tablesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  tableItem: {
    width: wp(19),
    marginBottom: hp(2),
    alignItems: "center",
  },
  tableCapacity: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  capacityNumber: {
    fontSize: wp(3.5),
    marginRight: wp(1),
  },
  tableNumber: {
    fontSize: wp(3.5),
    textAlign: "center",
    marginBottom: hp(0.5),
  },
  checkboxContainer: {
    width: wp(5),
    height: wp(5),
    justifyContent: "center",
    alignItems: "center",
  },
  checkbox: {
    width: wp(5),
    height: wp(5),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp(1),
  },
  checkboxSelected: {
    backgroundColor: "#8B0000",
    borderColor: "#8B0000",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(2),
    fontSize: wp(4),
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: wp(3.5),
    marginBottom: hp(2),
  },
  infoText: {
    color: "#666",
    fontSize: wp(3),
    marginBottom: hp(1),
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    borderRadius: wp(2),
  },
  cancelButtonText: {
    fontSize: wp(4),
    color: "#000",
  },
  doneButton: {
    backgroundColor: "#8B0000",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    borderRadius: wp(2),
  },
  doneButtonText: {
    fontSize: wp(4),
    color: "#fff",
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#888",
  },
  doneButton_waiter: {
    backgroundColor: "#2196F3",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    borderRadius: wp(2),
  },
  sectionLabel_waiter: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: hp(1.5),
    marginTop: hp(1),
    color: '#2196F3'
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: wp(3),
    backgroundColor: "#FFC01D",
    height: hp(6),
    width: wp(13),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(2.7),
  },
});

export default HomeScreen;