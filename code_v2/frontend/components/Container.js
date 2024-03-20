import * as React from "react";
//import { Image } from "expo-image";
import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";
import { Border, Color, Padding } from "../GlobalStyles";
import { Camera } from 'expo-camera';

// const Container = () => {
//   const [isCameraOpen, setIsCameraOpen] = React.useState(false);

//   const handleCameraPress = () => {
//     setIsCameraOpen(true);
//   };

//   const handleCloseCamera = () => {
//     setIsCameraOpen(false);
//   };

//   return (
//     <>
//       {isCameraOpen ? (
//         <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back} onCameraReady={() => console.log('Camera is ready')}>
//           <TouchableOpacity style={{ position: 'absolute', top: 20, left: 20, zIndex: 999 }} onPress={handleCloseCamera}>
//             <Text style={{ color: 'white', fontSize: 18 }}>Close Camera</Text>
//           </TouchableOpacity>
//         </Camera>
//       ) : (
//         <TouchableOpacity style={styles.outlinedelevatedlargeiconO} onPress={handleCameraPress}>
//           <Image
//             style={styles.outlinedelevatedlargeiconOChild}
//             contentFit="cover"
//             source={require("../assets/group-119.png")}
//           />
//         </TouchableOpacity>
//       )}
//     </>
//   );
// };

const Container = () => {
  return (
    <View style={styles.outlinedelevatedlargeiconO}>
      <Image
        style={styles.outlinedelevatedlargeiconOChild}
        contentFit="cover"
        source={require("../assets/group-119.png")}
      />
    </View>
  );
};

const styles = StyleSheet.create({

  outlinedelevatedlargeiconOChild: {
    width: 40,
    height: 40,
    alignItems: "center",
    marginLeft: -2,
  },
  outlinedelevatedlargeiconO: {
    position: "absolute",
    top: 0,
    left: 4154,
    borderRadius: 15,
    backgroundColor: Color.colorLavender,
    shadowColor: "rgba(101, 92, 128, 0.4)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 2,
    elevation: 2,
    shadowOpacity: 1,
    width: 72,
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Padding.p_base,
    paddingVertical: Padding.p_xs,
  },
});

export default Container;
