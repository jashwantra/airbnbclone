import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function nameEventHandler(event) {
        setName(event.target.value);
    }

    function emailEventHandler(event) {
        setEmail(event.target.value);
    }

    function passwordEventHandler(event) {
        setPassword(event.target.value);
    }

    function setEverythingNull(){
        setName("");
        setEmail("");
        setPassword("");
    }

    async function registerUser(event) {
        event.preventDefault();
        try {
            await axios.post("/register", { name: name, email: email, password: password });
            setEverythingNull();
            alert('Registraion Successful. Now you can log in.');
        } catch(error){
            alert("Registraion failed. Please try again later.")
        }
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="-mt-64">
                <h1 className="m-2 text-4xl text-center mb-4">Register</h1>
                <form className="max-w-md mx-auto" onSubmit={registerUser}>
                    <input type="text" placeholder="Name"
                        value={name} onChange={nameEventHandler} />
                    <input type="email" placeholder="your@email.com"
                        value={email} onChange={emailEventHandler} />
                    <input type="password" placeholder="password"
                        value={password} onChange={passwordEventHandler} />
                    <button className="primary">Register</button>
                    <div className="text-center py-2 text-gray-500">
                        Already a member! <Link className="underline text-black" to='/login'>Login </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;