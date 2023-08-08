import { differenceInCalendarDays } from "date-fns";
import React, { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import axios from "axios";
import { Navigate } from "react-router-dom";

function BookingWidget({ place }) {
    const { user } = useContext(UserContext);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const [name, setName] = useState(user?.name);
    const [phone, setPhone] = useState("");
    const [redirect, setRedirect] = useState("");

    let numberOfNights = 0;
    if (checkIn && checkOut) {
        numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
    }

    function bookThisPlace(){
        axios.post("/bookings", {
            place: place._id, checkIn, checkOut, 
            numberOfGuests, name, phone,
            price: numberOfNights * place.price
        }).then(() => {
            alert("Booked Successfully.");
        });
        setRedirect(`/account/bookings`);
    }

    if(redirect){
        return <Navigate to={redirect} /> ;
    }

    return (<div className="bg-white shadow p-4 rounded-2xl">
        <div className="text-2xl text-center">
            Price: ₹{place.price} per night
        </div>
        <div className="border rounded-2xl mt-4">
            <div className="flex">
                <div className="py-3 px-4">
                    <label>Check in:</label>
                    <input type="date" value={checkIn}
                        onChange={(event) => { setCheckIn(event.target.value) }} required />
                </div>
                <div className="py-3 px-4 border-l">
                    <label>Check out:</label>
                    <input type="date" value={checkOut}
                        onChange={(event) => { setCheckOut(event.target.value) }} required />
                </div>
            </div>
            <div className="py-3 px-4 border-t">
                <label>Number of Guests:</label>
                <input type="number" value={numberOfGuests}
                    onChange={(event) => { setNumberOfGuests(event.target.value) }} />
            </div>
            {numberOfNights > 0 && (
                <div className="py-3 px-4 border-t">
                    <label>Your Full Name:</label>
                    <input type="text" value={name}
                        onChange={(event) => { setName(event.target.value) }} />
                    <label>Phone Number:</label>
                    <input type="tel" value={phone}
                        onChange={(event) => { setPhone(event.target.value) }} />
                </div>
            )}
        </div>
        <button onClick={bookThisPlace} className="primary mt-4" disabled={!(numberOfNights>0)}>
            Book this place {numberOfNights > 0 && (
                <span>₹{numberOfNights * place.price}</span>
            )}
        </button>
    </div>)
}

export default BookingWidget;