/* The file for displaying the scan details. The display data is taken from route params;

1. code: A decoder variable for checking whether the details came from "Add Image option (2)"; or "newScan or freshScan option (0)"; or "Red Orders(1)".

2. prevSummary: A json variable containing the scan details before pressing on any intermediate option. If it;s a fresh scan it is same as the default Summaryobject.json

3. currentSummary: A json array of the from [{name:"itemname", resQuantity:"Quanity of item detected"}]

We will compare the data with the reqQuantity variable from prevSummary to assign colours to the display.

Various actions like save, cancel are also implemented here.


Functions and thier roles are explained by inline comments. Have a look at the final jsx to understand how the functions are used.


*/

// Required Imports
import React, { Component } from "react";

import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Dimensions,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TouchableOpacity,
  BackHandler,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { Video } from 'expo-av';
import { StackActions } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Table, Row } from "react-native-table-component";
import Icon from "react-native-vector-icons/Ionicons";
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { header, host, port, keyForEditable } from "./Constants";
import colours from "./colours";
// import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';


//screen dimensions for making the css universal; i.e, independent of phone's dimension
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default class NewSummary extends Component {
  constructor(props) {
    super(props);
    // accessing the props from the route params
    // var orgimg = this.props.sendData
    this.code = this.props.route.params.code;
    var obj = this.props.route.params.prevSummary;
    var currentSummary = this.props.route.params.currentSummary;
    var base64org = this.props.route.params.inputimg;
    var vidflag = this.props.route.params.flag;

    // var base64org = orgimg.base64
    // console.log("printing")
    var inputuri;
    if (vidflag) {
      inputuri = "data:image/png;base64," + base64org;
    } else {
      inputuri = "data:video/mp4;base64," + base64org;
      // console.log(inputuri)
      console.log("Yes")
    }
    // console.log(base64org)

    //for a Add image and {new Scan or fresh Scan}
    if (this.code == 0 || this.code == 2) {


      // code for updating the prevSummary (obj) from the Details of CurrentSummmary
      for (var i = 0; i < currentSummary.length; i++) {
        var found = 0;
        for (var j = 0; j < obj.items.length; j++) {

          if (obj.items[j].name == currentSummary[i].name) {
            found = 1;
            if (this.code == 0) obj.items[j].resQuantity = obj.items[j].resQuantity + currentSummary[i].resQuantity;//adding since it is new Image

            else if (this.code == 2) obj.items[j].resQuantity = currentSummary[i].resQuantity; // updating since it is a new scan.

          }
          //assiging colours
          if (j % 2 == 0) obj.items[j].colour = "#808080";
          else obj.items[j].colour = "#FFFFFF";



        }
        //grey colour for items which are not present in the orde rbut got detected.
        if (found == 0) {
          var temp = {
            name: currentSummary[i].name,
            reqQuantity: 0,
            resQuantity: currentSummary[i].resQuantity,
            colour: "grey",
          };
          obj.items.push(temp);
        }
      }
    }
    // for the red coloured option
    else if (this.code == 1) {
      for (var i = 0; i < currentSummary.length; i++) {
        for (var j = 0; j < obj.items.length; j++) {
          //only changing for the red colured items.
          if (obj.items[j].name == currentSummary[i].name && obj.items[j].colour == "red") {
            obj.items[j].resQuantity = currentSummary[i].resQuantity;
            if (J % 2 == 0) {
              obj.items[j].colour = "#808080";
            }
            else {
              obj.items[j].colour = "#FFFFFF";
            }
          }
        }
      }
    }


    //Saving the data in state after assigning colours and merging order details.
    this.state = {
      tableHead: ["Item Name", "Scanned"],
      widthArr: [windowWidth / 2, windowWidth / 2],
      test: 10,
      object: obj,
      currentSummary: this.props.route.params.currentSummary,
      prevSummary: this.props.route.params.prevSummary,
      editable: false,
      imagein: inputuri,
      imgflag: vidflag
    };

  }

  //back handler for handling the goback option before saving the summary.
  backAction = () => {
    Alert.alert("Hold on!", "Are you sure you want to go back?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel"
      },
      { text: "Confirm", onPress: () => { this.props.navigation.reset({ index: 0, routes: [{ name: "Home" }] }); } }
    ]);
    return true;
  };
  // Adding the listener
  async componentDidMount() {
    await this.getEditable()
    BackHandler.addEventListener("hardwareBackPress", this.backAction);
  }
  // removing the listener
  componentWillUnmount() {
    return BackHandler.removeEventListener("hardwareBackPress", this.backAction);
  }



  // function for updating the colours and quanities when the settings are enabled.
  updateState(i, char) {
    var obj = this.state.object;
    if (char == "+") { obj.items[i].resQuantity++; }
    else if (obj.items[i].resQuantity >= 1) { obj.items[i].resQuantity--; }

    if (i % 2 == 0) {
      obj.items[i].colour = "#808080";
    }
    else {
      obj.items[i].colour = "#FFFFFF";

    }

    this.setState({ object: obj });
  }


  //Function to trigger scan by code (code =0 for new image, code =1 for red colour rows)
  sendData = (obj, code) => {

    var orders = [];


    // code 1 for clicking on red 
    if (code == 1) {
      for (var i = 0; i < obj.items.length; i++) {
        if (obj.items[i].colour == 'red' || obj.items[i].resQuantity == 0) {
          orders.push(obj.items[i].name);
        }
      }
    }

    let summary = obj;

    const pushAction = StackActions.push("Detections", { orders, summary, code, });
    this.props.navigation.dispatch(pushAction);

  };
  // function for cancelling the scan and navigating to home.
  callDelete = async (title) => { this.props.navigation.reset({ index: 0, routes: [{ name: "Home" }] }); };

  // function for saving the order to databse and naviagte to home.
  callSave = async (obj) => {


    let temp = JSON.parse(JSON.stringify(obj));
    temp.isScanned = true;
    temp.items = [];
    for (var i = 0; i < obj.items.length; i++) {
      if (obj.items[i].colour != 'grey') {
        temp.items.push(obj.items[i]);
      }
    }
    // console.log(temp)
    var flaskRouteName = "/updateSummary";
    var route = header + host + ":" + port + flaskRouteName;
    var response = await axios.post(route, temp);


    this.props.navigation.reset({ index: 0, routes: [{ name: "Home" }] });

  };

  // function for displaying the images.
  sendPhotos = (photos) => {

    this.props.navigation.navigate("Detected Frames", { photos, });
  };

  // the editable option for displaying the plus minus icons accordingly
  getEditable = async () => {
    try {
      let value = await AsyncStorage.getItem(keyForEditable);
      if (value == 'true') {
        this.setState({ editable: true });
      }
      else {
        this.setState({ editable: true });
      }

    } catch (e) {
      console.log(e);
    }

  }

  state = {
    isPlaying: false // Initial state for whether video is playing
  };

  togglePlay = async () => {
    if (this.videoRef) {
      if (this.state.isPlaying) {
        await this.videoRef.pauseAsync();
      } else {
        await this.videoRef.playAsync();
      }
      this.setState({ isPlaying: !this.state.isPlaying });
    }
  };

  render() {

    var data = [];
    var show = [];

    // show array for colours. and data row for tables. refer react-native-table for documentation.
    for (let i = 0; i < this.state.object.items.length; i++) {
      if (i % 2 == 0) show.push(colours.green);
      else show.push(colours.red);
      const dataRow = [];
      dataRow.push(this.state.object.items[i].name);
      dataRow.push
        (
          <View style={styles.plusminuscontainer}>
            <View style={styles.plusminusbuttons} >
              <TouchableOpacity underlayColor="white" onPress={() => this.updateState(i, "-")} >
                <AntDesign name="minus" size={10} color="black" style={styles.minusbuttonText} />
              </TouchableOpacity>
              <Text style={styles.plusminustext}>{this.state.object.items[i].resQuantity}</Text>
              <TouchableOpacity underlayColor="white" onPress={() => this.updateState(i, "+")} >
                <AntDesign name="plus" size={10} color="black" style={styles.plusbuttonText} />
              </TouchableOpacity>
            </View>
          </View>
        );
      data.push(dataRow);
    }
    return (
      <View style={styles.container}>
        <Image
          style={styles.transparentLogo1Icon}
          contentFit="cover"
          source={require("./assets/logo1.png")}
        />
        {/* <View>
          <Image key={-1} source={{ uri: this.state.imagein }} style={{ width: 200, height: 200 }} />
        </View> */}
        <View style={styles.bottomicon}>
          <TouchableHighlight
            onPress={() => { this.sendPhotos(this.state.object.images); }}
            underlayColor="white"
          >
            {this.state.imgflag ? (
              <Image
                key={-1}
                source={{ uri: this.state.imagein }}
                style={{ width: 270, height: 270, borderRadius: 20, marginTop: -40, borderWidth: 8, borderColor: "black" }}
              />
            ) : (
              <View>
                <Video
                  ref={ref => { this.videoRef = ref; }}
                  key={-1}
                  source={{ uri: this.state.imagein }}
                  style={{ width: 234, height: 234, borderRadius: 20 }}
                  resizeMode="cover"
                  isPlaying
                  isLooping
                />
                <TouchableOpacity onPress={this.togglePlay} style={styles.playButton}>
                  <Text>{this.state.isPlaying ? 'Pause' : 'Play'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableHighlight>
        </View>
        <View style={styles.tableBody}>
          <Table>
            <Row
              data={this.state.tableHead}
              widthArr={this.state.widthArr}
              style={styles.head}
              textStyle={styles.headerText}
            />
          </Table>

          <ScrollView style={styles.dataWrapper}>
            <Table>
              {data.map((f, index) => (
                <Row
                  key={index}
                  data={f}
                  widthArr={this.state.widthArr}
                  style={[
                    styles.row,
                    { backgroundColor: show[index] },
                    index === data.length - 1 && styles.lastRow // Apply lastRow style to the last row
                  ]} textStyle={styles.text}
                  onPress={() => {
                    show[index] == colours.red ? this.sendData(this.state.object, "1") : null;
                  }}
                />
              ))}
            </Table>

            {/* <View style={styles.middleicon}>

              <TouchableHighlight onPress={() => { this.sendData(this.state.object, 0); }} underlayColor="white">

                <Icon name="add-circle-sharp" type="ioniicons" color="black" size={40} />

              </TouchableHighlight>

              <Text style={{ marginLeft: -15 }}>ADD IMAGE</Text>

            </View> */}

          </ScrollView>
        </View>
        <TouchableWithoutFeedback onPress={this.backAction}>
          <Image
            style={styles.backimage}
            contentFit="cover"
            source={require("./assets/back.png")}
          />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={this.backAction}>
          <Image
            style={styles.tickimage}
            contentFit="cover"
            source={require("./assets/tick.png")}
          />
        </TouchableWithoutFeedback>
        {/* <View style={styles.bottomicon}>
          <TouchableHighlight
            onPress={() => { this.sendPhotos(this.state.object.images); }}
            underlayColor="white"
          >
            <Icon name="images" type="ioniicons" color="black" size={30} />
          </TouchableHighlight>
        </View> */}

        {/* <View style={styles.bottomicon}>
          <TouchableHighlight
            onPress={() => this.callDelete(this.state.object.title)}
            underlayColor="white"
          >

            <MaterialIcons name="cancel" size={35} color="black" />
          </TouchableHighlight>
        </View>

        <View style={styles.bottomicon}>
          <TouchableHighlight
            onPress={() => {
              this.callSave(this.state.object);
            }}
            underlayColor="white"
          >

            <Ionicons name="md-checkmark-circle" size={35} color="black" />
          </TouchableHighlight>
        </View> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D7E5FF",
  },
  head: {
    height: windowHeight / 16.44,
    width: windowWidth / 1.085,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingLeft: 30,
    paddingRight: 30,
  },
  text: {
    textAlign: "left",
    marginLeft: 30,
    fontWeight: "none",
    fontSize: 17,
  },
  headerText: {
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 20,
  },
  dataWrapper: {
    marginBottom: -70,
    maxHeight: 3 * 77,
  },
  row: {
    height: windowHeight / 13.7,
    marginTop: 0,
  },
  lastRow: {
    borderBottomLeftRadius: 20, // Adjust the value to change the roundness
    borderBottomRightRadius: 20, // Adjust the value to change the roundness
  },
  tableBody: {
    alignItems: "center",
    paddingTop: windowHeight / 11.7428,
    marginBottom: 80,
    paddingLeft: 15,
    paddingRight: 15,
  },
  bottomNav: {
    position: "absolute",
    height: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colours.grey,
    flexDirection: "row",
  },
  bottomicon: {
    flexGrow: 1,
    justifyContent: "center",
    paddingLeft: 20,
    alignItems: "center",
    borderRadius: 50,
    marginBottom: -120
  },
  middleicon: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "baseline",
    marginTop: 20,
    marginLeft: 20,
  },
  plusminuscontainer:
  {
    flexDirection: 'column',
    marginRight: 20,
  },
  plusminustext: {
    textAlign: "center",
    paddingTop: 12,
    paddingLeft: 20,
    paddingRight: 22,
    width: 80,
    fontWeight: "none",
    fontSize: 17,
  },
  plusminusbuttons: {
    flexDirection: "row",
    alignItems: "left",
  },
  plusbuttonText: {
    paddingTop: 17,
    paddingBottom: 17,
    paddingRight: 10,
    fontSize: 20,
    paddingLeft: 10,
    backgroundColor: "#1A49F2",
  },
  minusbuttonText: {
    paddingTop: 17,
    paddingBottom: 17,
    paddingRight: 10,
    fontSize: 20,
    paddingLeft: 10,
    backgroundColor: "#95A3D4",
  },
  transparentLogo1Icon: {
    width: 50,
    height: 50,
    top: 40,
    left: 20,
  },
  backimage: {
    width: 50,
    height: 50,
    left: 35,
    bottom: -10,
  },
  tickimage: {
    width: 60,
    height: 60,
    left: 175,
    bottom: 40,
  },
  imagestyle: {
    borderTopLeftRadius: 50,
  },
  playButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
});