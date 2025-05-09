import axios from "axios";

const API_URL = "https://pfebackend-production.up.railway.app/api";

const Api_login_register = {

    loginClient : async (email, password) => {
        try {
          const body = {
            email,
            password,
          };
          const response = await axios.post(`${API_URL}/login`, body);
    
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
    
          if (error.response) {
            if (error.response.status === 400) {
                alert("Erreur : Veuillez fournir un email et un mot de passe.");
            } else if (error.response.status === 401) {
                alert("Erreur : Mot de passe incorrect.");
            } else if (error.response.status === 404) {
                alert("Erreur : Client non trouvé.");
    
            } else {
                alert("Erreur serveur : " + error.response.data.message);
            }
          } 
    
          throw error;
        }
      },
      registerClient : async (clientData, maladies,categorie) => {
        try {

          const body = {
            ...clientData,
            maladies,
            categorie
          };
      
      
          const response = await axios.post(`${API_URL}/inscription`, body);
      
          if (response.status === 201) {
            return response.data; 
          }
        } catch (error) {
      
          if (error.response) {
            if (error.response.status === 400) {
              console.error("Erreur : ", error.response.data.message);
            } else {
              console.error("Erreur serveur :", error.response.data.message);
            }
          } 
      
          throw error;
        }
      }
}








export default Api_login_register;