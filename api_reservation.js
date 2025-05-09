import axios from "axios";

const API_URL = "https://pfebackend-production.up.railway.app/api";

const Api_reservation = {



    getReservations : async () => {
        try {
    
          const response = await axios.get(`${API_URL}/reservation`);
      
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
      
          if (error.response) {
            if (error.response.status === 404) {
              console.error("Erreur : Aucune réservation trouvée.");
              throw new Error("Aucune réservation trouvée.");
            } else {
              console.error("Erreur serveur :", error.response.data.message);
              throw new Error("Erreur serveur");
            }
          }
        }
      },
    
    createReservation : async (reservationData) => {
        try {
    
          const body = {
            id_client: reservationData.id_client,
            id_table: reservationData.id_table,
            nb_personne: reservationData.nb_personne,
            date_deb_res: reservationData.date_deb_rese,
            date_fin_res: reservationData.date_fin_res,
          };
      
    
          const response = await axios.post(`${API_URL}/reservation`, body);
      
    
          if (response.status === 201) {
            return response.data; 
          }
        } catch (error) {
     
          if (error.response) {
            if (error.response.status === 400) {
              const errorMessage = error.response.data.message;
      
              if (errorMessage.includes("Missing fields")) {
                console.error("Erreur : Des champs requis sont manquants.");
                throw new Error("Des champs requis sont manquants.");
              } else if (errorMessage.includes("Start date must be before end date")) {
                console.error("Erreur : La date de début doit être avant la date de fin.");
                throw new Error("La date de début doit être avant la date de fin.");
              } else if (errorMessage.includes("Reservation not added")) {
                console.error("Erreur : La réservation n'a pas été ajoutée.");
                throw new Error("La réservation n'a pas été ajoutée.");
              } else {
                console.error("Erreur : ", errorMessage);
                throw new Error(errorMessage);
              }
            } }
        }
      },
      getTables : async () => {
        try {
    
          const response = await axios.get(`${API_URL}/table`);
    
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 404) {
              console.error("Erreur : Aucune table trouvée.");
              throw new Error("Aucune table trouvée.");
            } else {
              console.error("Erreur serveur :", error.response.data.message);
              throw new Error("Erreur serveur");
            }
        }
        }
      },
      deleteReservation : async (id_client, id_reserv) => {
        try {
    
          const url = `${API_URL}/reservation/${id_client}`;
          const body = {
            id_reserv,
          };
          const response = await axios.delete(url, { data: body });
          if (response.status === 200) {
            console.log("Réservation supprimée avec succès.");
          }
        } catch (error) {
    
          if (error.response) {
            if (error.response.status === 404) {
              console.error("Erreur : Aucune réservation trouvée.");
              throw new Error("Aucune réservation trouvée.");
            } else {
              console.error("Erreur serveur :", error.response.data.message);
              throw new Error("Erreur serveur");
            }
        }
        }
      },
      getClientReservations : async (id_client) => {
        try {
     
          const url = `${API_URL}/reservation/${id_client}`;
      
    
          const response = await axios.get(url);
      
     
          if (response.status === 200) {
            console.log(response.data)
            return response.data; 
          }
        } catch (error) {
    
          if (error.response) {
            if (error.response.status === 404) {
              console.error("Erreur : Aucune réservation trouvée pour ce client.");
              throw new Error("Aucune réservation trouvée pour ce client.");
            } else {
              console.error("Erreur serveur :", error.response.data.message);
              throw new Error("Erreur serveur");
            }
        }
        }
      }



}


export default Api_reservation;
