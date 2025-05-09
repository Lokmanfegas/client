import { registerRootComponent } from 'expo';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, setLogLevel } from 'firebase/firestore';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  ActivityIndicator
} from 'react-native';
import Api_commande from '../api_commande';
import AsyncStorage from '@react-native-async-storage/async-storage';
setLogLevel('debug');

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [clientId, setClientId] = useState(null);  

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

  const id_client = clientId; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ Utilisateur connecté :", user.uid);
        setIsAuthReady(true);
      } else {
        console.log("❌ Aucun utilisateur connecté");
        setIsAuthReady(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch notifications from Firebase
  useEffect(() => {
    if (!isAuthReady || !id_client) return;

    const fetchNotifications = async () => {
      try {
        const q = query(
          collection(db, 'notifications_client'),
          where('id_client', '==', id_client),
          where('isRead', '==', false)
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
            time: calculateTimeElapsed(createdAt)
          };
        }).filter(order => {
          const orderDate = order.createdAt;
          return orderDate && orderDate >= today;
        });

        // Garder uniquement la notification la plus récente pour chaque commande
        const latestNotifications = getLatestNotifications(notificationsData);
        setNotifications(latestNotifications);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [isAuthReady, id_client]);

  // Garde uniquement la notification la plus récente pour chaque commande
  const getLatestNotifications = (notifications) => {
    const commandesMap = new Map();
    
    notifications.forEach(notification => {
      const commandeId = notification.id_commande.toString(); // Convertir en string pour uniformiser
      
      if (!commandesMap.has(commandeId) || 
          new Date(notification.createdAt) > new Date(commandesMap.get(commandeId).createdAt)) {
        commandesMap.set(commandeId, notification);
      }
    });
    
    return Array.from(commandesMap.values());
  };

  // Fetch order details when modal opens
  const fetchOrderDetails = async (id_commande) => {
    try {
      const details = await Api_commande.getCommandPlats(id_commande);
      setOrderDetails(details.data.plat_commande);
    } catch (err) {
      console.error("Erreur:", err);
      setError(err.message);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.id_commande);
    setModalVisible(true);
  };

  const calculateTimeElapsed = (date) => {
    if (!date) return 'Date inconnue';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} secondes`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} heures`;
    return `${Math.floor(diffInSeconds / 86400)} jours`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'en_attente': return '#FFA500'; // Orange
      case 'en_cours_de_préparation': return '#FFD700'; // Jaune
      case 'prête': return '#32CD32'; // Vert
      default: return '#FF0000'; // Rouge
    }
  };

  const getStatusIndex = (status) => {
    switch(status) {
      case 'en_attente': return 0;
      case 'en_cours_de_préparation': return 1;
      case 'prête': return 2;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>My Orders</Text>
      <ScrollView>
        {/* Orders Section */}
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id_commande}
              style={styles.orderCard}
              onPress={() => openOrderDetails(notification)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Commande #{notification.id_commande}</Text>
                <Text style={styles.orderTime}>{notification.time}</Text>
              </View>
              <Text style={styles.orderMessage}>{notification.message}</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                {['en_attente', 'en_cours_de_préparation', 'prête'].map((status, index) => (
                  <View key={status} style={styles.progressStep}>
                    <View 
                      style={[
                        styles.progressDot,
                        { 
                          backgroundColor: index <= getStatusIndex(notification.status) 
                            ? getStatusColor(status) 
                            : '#E0E0E0'
                        }
                      ]}
                    />
                    <Text style={styles.progressText}>
                      {status.replace(/_/g, ' ')}
                    </Text>
                    {index < 2 && (
                      <View 
                        style={[
                          styles.progressLine,
                          { 
                            backgroundColor: index < getStatusIndex(notification.status) 
                              ? getStatusColor(status) 
                              : '#E0E0E0'
                          }
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noOrdersText}>Aucune commande en cours</Text>
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Détails de la commande #{selectedOrder.id_commande}</Text>
                <Text style={styles.modalInfo}>Table: {selectedOrder.id_table}</Text>
                <Text style={styles.modalInfo}>Date: {new Date(selectedOrder.createdAt).toLocaleString()}</Text>
                
                <Text style={styles.detailsTitle}>Plats commandés:</Text>
                {orderDetails.length > 0 ? (
                  orderDetails.map((item) => (
                    <View key={`${item.id_plat}-${item.id_commande}`} style={styles.detailItem}>
                      <Text style={styles.detailName}>{item.nom_plat}</Text>
                      <Text style={styles.detailQuantity}>x{item.quantite}</Text>
                    </View>
                  ))
                ) : (
                  <ActivityIndicator size="small" color="#FF0000" />
                )}
              </>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  headerText: {
    fontFamily: "SFProDisplay-Bold",
    fontWeight: "700",
    fontSize: 34,
    marginBottom: 20,
    color: 'black',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
  },
  orderMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  noOrdersText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  progressLine: {
    position: 'absolute',
    top: 8,
    left: '50%',
    width: '100%',
    height: 2,
    zIndex: -1,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF0000',
  },
  modalInfo: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  detailName: {
    fontSize: 14,
    color: '#333',
  },
  detailQuantity: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF0000',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default App;