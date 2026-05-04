import axios from "axios";

const API = axios.create({
  baseURL: "https://quiz-backend-sand.vercel.app/api",
});

export default API;