import React from "react";
import { Image } from "react-native";

export default function ImageView(props) {
  return (
    
    <Image  key={props.ind} source={{ uri: props.uri }} style={{ width: 400, height: 400 }} />
    
  );
}

