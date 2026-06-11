import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false
});


// attach token automatically
API.interceptors.request.use((req) => {

  const user = localStorage.getItem("user");

  if (user) {

    req.headers.Authorization =
      `Bearer ${JSON.parse(user).token}`;

  }

  return req;

});


// ✅ ADD THESE EXPORTS

export const getColleges = () =>
  API.get("/colleges");

export const getCollege = (id) =>
  API.get(`/colleges/${id}`);

export const addReview = (data) =>
  API.post("/reviews", data);


export default API;