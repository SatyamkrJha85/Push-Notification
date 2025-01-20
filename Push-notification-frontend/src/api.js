import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5001/api" });

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios Error:", error.message);
    throw error;
  }
);

export const fetchItems = () => API.get("/items");
export const createItem = (item) => API.post("/items", item);
export const updateItem = (id, updatedItem) => API.put(`/items/${id}`, updatedItem);
export const deleteItem = (id) => API.delete(`/items/${id}`);

