import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard
  } from "react-native";
  import { useState, useEffect } from 'react';
  import { db, auth } from '../firebase';
  import { onAuthStateChanged } from 'firebase/auth';
  import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
  import Api_plat from "../api_plats";
  
  export default function NotificationScreen({ navigation }) {
    const [clientId, setClientId] = useState(null);  
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [currentPlatIndex, setCurrentPlatIndex] = useState(0);
    const [ratings, setRatings] = useState([]);
    const [comments, setComments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
  
    const calculateTimeElapsed = (date) => {
      if (!date) return 'Unknown time';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };
  
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
  
    const fetchNotifications = async () => {
      if (!isAuthReady) return;
    
      try {
        const q = query(
          collection(db, 'client_rating_notifications'),
          where('id_client', '==', id_client),
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
            time: calculateTimeElapsed(createdAt)
          };
        }).filter(order => {
          const orderDate = order.createdAt;
          return orderDate && orderDate >= today;
        });
  
        setNotifications(notificationsData);
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (!isAuthReady) return;
      
      fetchNotifications();
    
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 10000);
    
      return () => clearInterval(intervalId);
    }, [isAuthReady]);
  
    const handleNotificationPress = async (notification) => {
      setSelectedNotification(notification);
 
      setRatings(new Array(notification.plats.length).fill(0));
      setComments(new Array(notification.plats.length).fill(''));
      setCurrentPlatIndex(0);
      setRatingModalVisible(true);
      
     
      try {
        const notificationRef = doc(db, 'client_rating_notifications', notification.id);
        await updateDoc(notificationRef, {
          isRead: true
        });
 
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    };
  
    const handleNextPlat = () => {
      if (currentPlatIndex < selectedNotification.plats.length - 1) {
        setCurrentPlatIndex(currentPlatIndex + 1);
      }
    };
  
    const handlePreviousPlat = () => {
      if (currentPlatIndex > 0) {
        setCurrentPlatIndex(currentPlatIndex - 1);
      }
    };
  
    const handleRatingChange = (rating) => {
      const newRatings = [...ratings];
      newRatings[currentPlatIndex] = rating;
      setRatings(newRatings);
    };
  
    const handleCommentChange = (text) => {
      const newComments = [...comments];
      newComments[currentPlatIndex] = text;
      setComments(newComments);
    };
  
    const handleSubmitAllRatings = async () => {
      if (ratings.some(rating => rating === 0)) {
        alert("Veuillez noter tous les plats avant de soumettre");
        return;
      }
      
      setSubmitting(true);
      try {
        for (let i = 0; i < selectedNotification.plats.length; i++) {
        
          console.log(ratings[i] * 2)
          console.log(comments[i] || 'aucun commentaire')


          await Api_plat.submitPlatNote(
            selectedNotification.id_client,
            selectedNotification.plats[i].id_plat,
            ratings[i] * 2, 
            comments[i] 
          );
        }
        
        alert("Merci pour vos évaluations!");
        setRatingModalVisible(false);
        setRatings([]);
        setComments([]);
      } catch (error) {
        console.error("Error submitting ratings:", error);
        alert("Erreur lors de l'envoi des évaluations");
      } finally {
        setSubmitting(false);
      }
    };
  
    const renderStarRating = () => {
      return (
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRatingChange(star)}>
              <MaterialIcons 
                name={star <= ratings[currentPlatIndex] ? "star" : "star-border"} 
                size={40} 
                color={star <= ratings[currentPlatIndex] ? "#FFD700" : "#ccc"} 
              />
            </TouchableOpacity>
          ))}
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
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
  
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-off" size={60} color="#8B0000" />
              <Text style={styles.emptyText}>Aucune nouvelle notification</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity 
                key={notification.id} 
                style={styles.notificationCard}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationIcon}>
                  <MaterialIcons name="rate-review" size={24} color="#8B0000" />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>Évaluation demandée</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.platsCount}>
                    {notification.plats.length} plat(s) à évaluer
                  </Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
  
        {/* Rating Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={ratingModalVisible}
          onRequestClose={() => setRatingModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              style={styles.modalOverlay}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Évaluer votre repas ({currentPlatIndex + 1}/{selectedNotification?.plats?.length || 0})
                  </Text>
                  <TouchableOpacity onPress={() => setRatingModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
  
                <ScrollView 
                  contentContainerStyle={styles.modalBody}
                  keyboardShouldPersistTaps="handled"
                >
                  {selectedNotification && (
                    <>
                      <Text style={styles.platName}>
                        {selectedNotification.plats[currentPlatIndex].nom_plat}
                      </Text>
                      <Text style={styles.ratingText}>Donnez une note de 1 à 5 étoiles</Text>
                      {renderStarRating()}
                      
                      <Text style={styles.commentLabel}>Commentaire (optionnel)</Text>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Décrivez votre expérience avec ce plat..."
                        value={comments[currentPlatIndex]}
                        onChangeText={handleCommentChange}
                        multiline
                      />
                    </>
                  )}
                </ScrollView>
  
                <View style={styles.modalFooter}>
                  <View style={styles.navigationButtons}>
                    {currentPlatIndex > 0 && (
                      <TouchableOpacity 
                        style={styles.navButton}
                        onPress={handlePreviousPlat}
                      >
                        <Text style={styles.navButtonText}>Précédent</Text>
                      </TouchableOpacity>
                    )}
  
                    {currentPlatIndex < selectedNotification?.plats?.length - 1 ? (
                      <TouchableOpacity 
                        style={[styles.navButton, styles.nextButton]}
                        onPress={handleNextPlat}
                        disabled={ratings[currentPlatIndex] === 0}
                      >
                        <Text style={styles.navButtonText}>Suivant</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.submitButton, ratings.some(r => r === 0) && styles.disabledButton]}
                        onPress={handleSubmitAllRatings}
                        disabled={ratings.some(r => r === 0) || submitting}
                      >
                        <Text style={styles.submitButtonText}>
                          {submitting ? "Envoi..." : "Terminer"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
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
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#8B0000',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 18,
      color: '#888',
      marginTop: 20,
    },
    notificationCard: {
      flexDirection: 'row',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      backgroundColor: '#fff',
    },
    notificationIcon: {
      marginRight: 15,
      justifyContent: 'center',
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#8B0000',
      marginBottom: 5,
    },
    notificationMessage: {
      fontSize: 14,
      color: '#333',
      marginBottom: 5,
    },
    platsCount: {
      fontSize: 12,
      color: '#8B0000',
      fontStyle: 'italic',
      marginBottom: 5,
    },
    notificationTime: {
      fontSize: 12,
      color: '#888',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      width: '90%',
      maxHeight: '80%',
      borderRadius: 10,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#8B0000',
    },
    closeButton: {
      fontSize: 20,
      color: '#000',
    },
    modalBody: {
      padding: 20,
      flexGrow: 1,
    },
    platName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
      textAlign: 'center',
    },
    starContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 20,
    },
    ratingText: {
      textAlign: 'center',
      fontSize: 16,
      marginBottom: 10,
      color: '#333',
    },
    commentLabel: {
      fontSize: 14,
      color: '#333',
      marginBottom: 10,
    },
    commentInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    modalFooter: {
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    navButton: {
      backgroundColor: '#8B0000',
      padding: 10,
      borderRadius: 5,
      minWidth: 100,
      alignItems: 'center',
    },
    nextButton: {
      marginLeft: 'auto',
    },
    navButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    submitButton: {
      backgroundColor: '#8B0000',
      padding: 10,
      borderRadius: 5,
      minWidth: 100,
      alignItems: 'center',
      alignSelf: 'flex-end',
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: '#ccc',
    },
  });