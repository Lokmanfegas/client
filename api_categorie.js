import axios from "axios";

const API_URL = "https://pfebackend-production.up.railway.app/api";

const Api_categorie = {


getCategories : async () => {
    try {

      const response = await axios.get(`${API_URL}/Categorie`);

      if (response.status === 200) {
        return response.data; 
      }
    } catch (error) {

      if (error.response) {
        if (error.response.status === 404) {
          console.error("Erreur : Aucune catégorie trouvée.");
          throw new Error("Aucune catégorie trouvée.");
        } else {
          console.error("Erreur serveur :", error.response.data.message);
          throw new Error("Erreur serveur");
        }
    }
    }
  },
  addClientCategorie : async (id_client, nom_categorie) => {
    try {

      const body = {
        id_client,
        nom_categorie,
      };
  

      const response = await axios.post(`${API_URL}//ClientCategorie`, body);
  

      if (response.status === 201) {
        console.log("Association client-catégorie créée avec succès.");
        return response.data; 
      }
    } catch (error) {

      if (error.response) {
        console.error("Erreur :", error.response.data.message || "Erreur inconnue.");
        throw new Error(error.response.data.message || "Erreur inconnue.");
      } else if (error.request) {
        console.error("Aucune réponse reçue du serveur.");
        throw new Error("Aucune réponse reçue du serveur");
      } else {
        console.error("Erreur lors de la requête :", error.message);
        throw new Error("Erreur lors de la requête");
      }
    }
  },
  getClientCategories : async (id_client) => {
    try {

      const url = `${API_URL}/ClientCategorie/${id_client}`;
  
  
      const response = await axios.get(url);

      if (response.status === 200) {
        return response.data; 
      }
    } catch (error) {s
      if (error.response) {
        if (error.response.status === 400) {
          console.error("Erreur : L'identifiant du client (id_client) est manquant.");
          throw new Error("L'identifiant du client (id_client) est manquant.");
        } else if (error.response.status === 404) {
          console.error("Erreur : Aucune catégorie associée trouvée pour ce client.");
          throw new Error("Aucune catégorie associée trouvée pour ce client.");
        } else {
          console.error("Erreur serveur :", error.response.data.message);
          throw new Error("Erreur serveur");
        }
      }
    }
  },
  deleteClientCategorie : async (id_client,nom_categorie ) => {
    try {
   body = {
    nom_categorie
    }

      const url = `${API_URL}/ClientCategorie/${id_client}`;

      const response = await axios.delete(url, {
        data: body,
      });
  

      if (response.status === 204) {
        console.log("Association client-catégorie supprimée avec succès.");
      }
    } catch (error) {

      if (error.response) {
        if (error.response.status === 400) {
          console.error("Erreur : Champs requis manquants.");
          throw new Error("Champs requis manquants.");
        } else if (error.response.status === 404) {
          console.error("Erreur : Aucune association client-catégorie trouvée.");
          throw new Error("Aucune association client-catégorie trouvée.");
        } else {
          console.error("Erreur serveur :", error.response.data.message || "Erreur inconnue.");
          throw new Error(error.response.data.message || "Erreur serveur");
        }
      }
    }
  } 
}




export default Api_categorie;