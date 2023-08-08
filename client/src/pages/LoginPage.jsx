import React, { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);
    const {setUser} = useContext(UserContext);

    function handleEmailChange(event){
        setEmail(event.target.value);
    }

    function handlePasswordChange(event){
        setPassword(event.target.value);
    }

    async function handleLoginSubmit(event){
        event.preventDefault();
        try{
            const {data} = await axios.post("/login", {email, password});
            setUser(data);
            alert("Login Successful.");
            setRedirect(true);
        } catch(error){
            console.log(error);
            alert("Login Failed!");
        }
    }

    if(redirect){
        return <Navigate to={"/"} /> ;
    }

    return <div className="mt-4 grow flex items-center justify-around">
        <div className="-mt-64">
            <h1 className="m-2 text-4xl text-center mb-4">Login</h1>
            <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
                <input type="email" placeholder="your@email.com" value={email} onChange={handleEmailChange} />
                <input type="password" placeholder="password" value={password} onChange={handlePasswordChange} />
                <button className="primary">Login</button>
                <div className="text-center py-2 text-gray-500">
                    Don't have an account yet? <Link className="underline text-black" to='/register'>Register Now </Link>
                </div>
            </form>
        </div>
    </div>;
}

export default LoginPage;