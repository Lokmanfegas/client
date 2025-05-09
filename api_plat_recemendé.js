import axios from "axios";

const API_URL = "https://pfebackend-production.up.railway.app/api";


const Api_plat_pref = {

    getRecommendedPlats : async (moment) => {
        try {
    
          const url = `${API_URL}/platClient/recommandes?moment=${encodeURIComponent(moment)}`;
      
          const response = await axios.get(url);
      
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
    
          if (error.response) {
            console.error("Erreur serveur :", error.response.data.message || "Erreur inconnue.");
            throw new Error(error.response.data.message || "Erreur serveur");
          } else if (error.request) {
            console.error("Aucune réponse reçue du serveur.");
            throw new Error("Aucune réponse reçue du serveur");
          } else {
            console.error("Erreur lors de la requête :", error.message);
            throw new Error("Erreur lors de la requête");
          }
        }
      },
      getClientById : async (clientId) => {
        try {
         
          const url = `${API_URL}/${clientId}`;
      
          const response = await axios.get(url);
      
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
          if (error.response) {
            console.error("Erreur serveur :", error.response.data.message || "Erreur inconnue.");
            throw new Error(error.response.data.message || "Erreur serveur");
          } 
        }
      }




};






export default Api_plat_pref;