import React from "react";

function PlaceImg({place, index=0, className=null}){
    if(!place.photos?.length){
        return "";
    }
    if(!className){
        className = "object-cover";
    }
    return (
            <img className={className} src={"https://airbnbcloneapi.onrender.com/uploads/" + place.photos[index]} alt={place.title} />
    );
}

export default PlaceImg ;