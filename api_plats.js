import axios from "axios";


const API_URL = "https://pfebackend-production.up.railway.app/api";

const Api_plat = {
    getAvailablePlats : async () => {
        try {
            const url = `${API_URL}/Gerant_plat`;
          const response = await axios.get(url);
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
    
          if (error.response) {
            if (error.response.status === 404) {
              console.error("Aucun plat disponible trouvé.");
            } else {
              console.error("Erreur serveur :", error.response.data.message);
            }
          }
      
          throw error;
        }
      },
    getIngredients : async () => {
        try {
          const url = `${API_URL}/ingredient`;
          const response = await axios.get(url);
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 404) {
              console.error("Aucun ingrédient trouvé :", error.response.data.message);
            } else {
              console.error("Erreur serveur :", error.response.data.message);
            }
        
          throw error;
        }
        }
      },
      getIngredientsByPlat : async (id_plat) => {
        try {
         
          const url = `${API_URL}/ingredient/plat/${id_plat}`;
          const response = await axios.get(url);
          if (response.status === 200) {
            return response.data; 
          }
        } catch (error) {
      
          if (error.response) {
            if (error.response.status === 404) {
              console.error(`Aucun ingrédient trouvé pour le plat avec id ${id_plat}.`);
            } else {
              console.error("Erreur serveur :", error.response.data.message);
            }
          }
          throw error;
        }
      },
      submitPlatNote : async (id_client, id_plat, nb_etoile, avis) => {
        try {
       
          const body = {
            id_client: Number(id_client),
            id_plat: Number(id_plat),
            nb_etoile: Number(nb_etoile),
            avis: avis || 'Aucun commentaire',
          };
      
          const response = await axios.post(`${API_URL}/noteplat`, body);
      
          if (response.status === 201) {
            return response.data; 
          }
        } catch (error) {
      
          if (error.response) {
            if (error.response.status === 400) {
              console.error("Erreur : Champs manquants.");
              throw new Error("Champs manquants.");
            } else {
              console.error("Erreur serveur :", error.response.data.message || "Erreur inconnue.");
              throw new Error(error.response.data.message || "Erreur serveur");
            }
          }
        }
      }


}

 

export default Api_plat;