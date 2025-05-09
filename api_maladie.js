import axios from "axios";



const API_URL = "https://pfebackend-production.up.railway.app/api";

const Api_maladie = {
    getClientMaladies : async (id_client) => {
        try {
        
          const response = await axios.get(`${API_URL}/clientmaladie/${id_client}` );
      
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
      
          if (error.response) {
            console.error("Erreur serveur :", error.response.data.message);
          } else if (error.request) {
            console.error("Aucune réponse reçue du serveur.");
          } 
          throw error;
        }
      },
      getMaladies : async () => {
        try {
          const response = await axios.get(`${API_URL}/maladie`);
      
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 404) {
              console.error("Aucune maladie trouvée :", error.response.data.message);
            } else {
              console.error("Erreur serveur :", error.response.data.message);
            }
         
          throw error;
        }
      };},
      getMaladiesByPlat :async (id_plat) => {
        try {
          const url = `${API_URL}/platmaladie/${id_plat}`;
          const response = await axios.get(url);
    
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
    
          if (error.response) {
            if (error.response.status === 404) {
              console.error(`Aucune maladie trouvée pour le plat avec id ${id_plat}.`);
            } else {
              console.error("Erreur serveur :", error.response.data.message);
            }
            }
          throw error;
        }
      },
      linkClientMaladie : async (id_client, id_maladie) => {
        try {
          const body = {
            id_client,
            id_maladie,
          };
      
          const response = await axios.post(`${API_URL}/clientmaladie`, body);
      
          if (response.status === 201) {
            return response.data; 
          }
        } catch (error) {
      
          if (error.response) {
            if (error.response.status === 400) {
              console.error("Erreur : Missing fields: id_client and id_maladie are required.");
            } else {
              console.error("Erreur serveur :", error.response.data.message);
            }
          }
          
        }
      },
      deleteClientMaladie : async (id_client, id_maladie) => {
        try {
      
          const url = `${API_URL}/clientmaladie/${id_client}`;
      
          const body = {
            id_maladie,
          };
      
      
          const response = await axios.delete(url,{ data: body });
      
      
          if (response.status === 204) {
            console.log("Maladie supprimée avec succès.");
          }
        } catch (error) {
      
          if (error.response) {
            if (error.response.status === 404) {
              console.error("Erreur : Maladie not found or could not be deleted.");
              throw new Error("Maladie not found or could not be deleted");
            } else {
              console.error("Erreur serveur :", error.response.data.message);
              throw new Error("Erreur serveur");
            }
          }
        }
      }
    





}


export default Api_maladie;


