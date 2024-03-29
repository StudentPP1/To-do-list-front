import './styles/nullstyle.css'
import './styles/App.css';
import React, {useEffect, useState} from 'react';
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./components/AppRouter";
import UserService from "./API/UserService";
import {AuthContext} from "./context";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
            setIsAuth(true); 
      }
    } , [])

  if (!localStorage.getItem('activeMenu')) {
    localStorage.setItem('activeMenu', 2) 
  }
  
  return (
    <AuthContext.Provider value={{
      isAuth,
      setIsAuth
    }}>
    <BrowserRouter>
      <AppRouter/>
    </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App;
