//第一步
import axios from 'axios'


const API_BASE = import.meta.env.VITE_BACK_END_URL; // 例：http://localhost:8080
const AUTH_REST_API_BASE_URL = `${API_BASE}/api/auth`;

//function that make register api call using "axios.post" method
export const registerAPICall = (registerObj) =>
  axios.post(`${AUTH_REST_API_BASE_URL}/register`, registerObj);

export const loginAPICall = (usernameOrEmail, password) =>
  axios.post(`${AUTH_REST_API_BASE_URL}/login`, { usernameOrEmail, password });

export const storeToken = (token) => localStorage.setItem("token", token);//store a token in a browser local storage

export const getToken = () => localStorage.getItem("token");

export const saveLoggedInUser = (username, role, firstName, lastName) => {
    sessionStorage.setItem("authenticatedUser", username);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("firstName", firstName);
    sessionStorage.setItem("lastName", lastName);
  };

export const isUserLoggedIn=()=>{
    const username=sessionStorage.getItem("authenticatedUser");

    if(username==null){
        return false;
    }else{
        return true;
    }
}

export const getLoggedInUser=()=>{
    const username=sessionStorage.getItem("authenticatedUser");
    return username;
}

export const logOut=()=>{
    localStorage.clear();//clear the date from local storage & session storage
    sessionStorage.clear();//clear all the data from the session storage
}

export const isAdminUser=()=>{

    let role=sessionStorage.getItem("role");
    if(role !=null && role==='ROLE_ADMIN'){
        return true;
    }else{
        return false;
    }
}

//created store token and get token methods to store and get the token from the local storage
