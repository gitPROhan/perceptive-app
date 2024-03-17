/*
Receives the base64 and order and sends request to the host mentioned in Constants.js


Note : 
If a case arrise like mutiple images or videos , they there must be a way  to remember the previous detections and summary, 
So while adding new image from Order Info page or Home page , 
along with image and order, those components can send some addition data like 
previous detections summary to this detections component and this detections 
component with just the additional data back to summary.js without midfying it
*/

import React from "react";
import {
  Button,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Alert,
} from "react-native";
import LottieView from "lottie-react-native";
import axios from "axios";
import NetworkUtils from "./Network";
import { StackActions } from "@react-navigation/native";

import { header, host, port } from "./Constants";
export default class Processing extends React.Component {
  constructor(props) {
    super(props);
    this.dataFromSummaryRoute = this.props.dataFromSummaryRoute;
    this.orders = this.dataFromSummaryRoute.orders; // DATA TYPE : array of strings
    this.summary = this.dataFromSummaryRoute.summary; // NEED TO SEND THIS TO SUMMARY ROUTE UNCHANGED
    this.code = this.dataFromSummaryRoute.code; // NEED TO SEND THIS TO SUMMARY ROUTE UNCHANGED
    this.fileData = this.props.fileData; // scheme is {type : 'pic' or 'video' : uri : uri}
    this.sendData = this.props.sendData;
    this.resetData = this.props.resetData;
    this.data = [];




    //Test
    const data = [];
    for (let i = 0; i < 7; i++) {
      const dataRow = [];
      dataRow.push("Waffy");
      dataRow.push(6);
      dataRow.push(7);
      data.push(dataRow);
    }
    this.data = data;
    //
  }

  showAlert = () =>
    Alert.alert(
      "Connection Problem",
      "Internet or Server Problem ",
      [
        {
          text: "Try Again",
          onPress: () => {
            this.resetData();
          },
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          this.resetData();
        },
      }
    );

  removeExtension = (str) => {
    return str.split(".")[0];
  };

  convertAndSend = (dataWithImages) => {
    var data = dataWithImages.summary;
    var base64OfDetectedImages = dataWithImages.base64Out;
    var inputImage = dataWithImages.base64Org;
    var VidFlag = dataWithImages.isImage;
    // //DATA schema FROM IMAGEDETEC ROUTE FROM BACKEND
    // data  = [{
    //   "item"  :"item in order1" , "count" : "detected Couunt of order1"
    // }]
    // data = [
    //   {
    //   "name": "item in order1",
    //   "resQuantity" : 3
    //   }
    // ]

    let summarySchemaData = [];
    for (let i = 0; i < data.length; i++) {
      summarySchemaData.push({
        name: this.removeExtension(data[i].item),
        resQuantity: data[i].count,
      });
    }
    if (Array.isArray(base64OfDetectedImages)) {
      base64OfDetectedImages.map((base64) => {
        this.summary.images.push(base64);
      });
    } else {
      // Handle the case where base64OfDetectedImages is not an array
      console.error("base64OfDetectedImages is not an array:", base64OfDetectedImages);
      [base64OfDetectedImages].map((base64) => {
        this.summary.images.push(base64);
      });
    }
    //this.props.prevProps.navigation.navigate("Summary", {currentSummary: summarySchemaData, code: this.code, prevSummary: this.summary,});
    const pushAction = StackActions.push("Summary", {
      currentSummary: summarySchemaData,
      code: this.code,
      prevSummary: this.summary,
      inputimg: inputImage,
      flag: VidFlag
    });
    this.props.prevProps.navigation.dispatch(pushAction);
  };

  componentDidMount = async () => {
    let type = this.fileData.type;
    let base64 = this.fileData.base64;
    let route = "";
    let uri = "";
    let ordersWithExtension = this.orders.map((order) => order);
    //console.log("Printing orders with extendisnonx : ");
    //console.log(ordersWithExtension);
    let data = {
      base64: base64,
      orders: ordersWithExtension,
    };
    type === "image" ? (route = "/imagedetect") : (route = "/videodetect");
    uri = header + host + ":" + port + route;

    const isConnected = await NetworkUtils.isNetworkAvailable();
    try {

      let res = await axios.post(uri, data, {
        cancelToken: this.props.cancelToken.token
      });
      //console.log("DATA FROM SERVER");
      this.convertAndSend(res.data);
    } catch (err) {
      console.log(err);
      //console.log("SERVER");
      if (err["message"] == undefined) {
        console.log("cancelled");
      } else {
        this.showAlert();
      }
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.animationContainer}>
        <View style={styles.buttonContainer}>
          <Text style={{ fontSize: 30 }}> Processing </Text>
        </View>
        <LottieView
          style={{
            width: "50%",
            marginBottom: "30%",
          }}
          source={require("./assets/loader.json")}
          autoPlay
          loop
        />
        {/* <Button
          title="Proceed"
          onPress={() => {
            this.sendData(this.data);
          }}
        ></Button> */}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: "30%",
  },
});