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
  TouchableOpacity,
  BackHandler,
  Alert
} from "react-native";
import axios from "axios";
import { StackActions } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Table, Row } from "react-native-table-component";
import Icon from "react-native-vector-icons/Ionicons";
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { header, host, port, keyForEditable } from "./Constants";
import colours from "./colours";


//screen dimensions for making the css universal; i.e, independent of phone's dimension
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default class NewSummary extends Component {
  constructor(props) {
    super(props);
    // accessing the props from the route params
    this.code = this.props.route.params.code;
    var obj = this.props.route.params.prevSummary;
    var currentSummary = this.props.route.params.currentSummary;

    //for a Add image and {new Scan or fresh Scan}
    if (this.code == 0 || this.code == 2) {


// code for updating the prevSummary (obj) from the Details of CurrentSummmary
      for (var i = 0; i < currentSummary.length; i++) {
        var found = 0;
        for (var j = 0; j < obj.items.length; j++) {

          if (obj.items[j].name == currentSummary[i].name) 
          {
            found = 1;
            if (this.code == 0)      obj.items[j].resQuantity = obj.items[j].resQuantity + currentSummary[i].resQuantity;//adding since it is new Image

            else if (this.code == 2) obj.items[j].resQuantity = currentSummary[i].resQuantity; // updating since it is a new scan.

          }
          //assiging colours
          if (obj.items[j].reqQuantity == 0)                             obj.items[j].colour = "grey";
          else if (obj.items[j].resQuantity == obj.items[j].reqQuantity) obj.items[j].colour = "green";
          else if (obj.items[j].resQuantity == 0)                        obj.items[j].colour = "red";
          else                                                           obj.items[j].colour = "yellow";


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
            if (obj.items[j].reqQuantity == 0) {
              obj.items[j].colour = "grey";
            }
            else if (obj.items[j].resQuantity == obj.items[j].reqQuantity) {
              obj.items[j].colour = "green";
            }
            else if (obj.items[j].resQuantity == 0) {
              obj.items[j].colour = "red";
            }
            else {
              obj.items[j].colour = "yellow";
            }
          }
        }
      }
    }


    //Saving the data in state after assigning colours and merging order details.
    this.state = {
      tableHead: ["ITEM", "DETECTED", "REQUIRED"],
      widthArr: [windowWidth / 2.8, windowWidth / 4.9, windowWidth / 4.9],
      test: 10,
      object: obj,
      currentSummary: this.props.route.params.currentSummary,
      prevSummary: this.props.route.params.prevSummary,
      editable: false
    };

  }

//back handler for handling the goback option before saving the summary.
  backAction = () => {
    Alert.alert("Hold on!", "Summary Won't be Saved?", [
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

    if (obj.items[i].reqQuantity == 0) {
      obj.items[i].colour = "grey";
    }
    else if (obj.items[i].resQuantity == obj.items[i].reqQuantity) {
      obj.items[i].colour = "green";

    }
    else if (obj.items[i].resQuantity == 0) {
      obj.items[i].colour = "red";

    } else {
      obj.items[i].colour = "yellow";

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

    this.props.navigation.navigate("ImageViewer", { photos, });
  };

// the editable option for displaying the plus minus icons accordingly
  getEditable = async () => {
    try {
      let value = await AsyncStorage.getItem(keyForEditable);
      if (value == 'true') {
        this.setState({ editable: true });
      }
      else {
        this.setState({ editable: false });
      }

    } catch (e) {
      console.log(e);
    }

  }


  render() {

    var data = [];
    var show = [];

// show array for colours. and data row for tables. refer react-native-table for documentation.
    for (let i = 0; i < this.state.object.items.length; i++) {
      if (this.state.object.items[i].colour == "green") show.push(colours.green);
      else if (this.state.object.items[i].colour == "red") show.push(colours.red);
      else if (this.state.object.items[i].colour == "grey") show.push(colours.grey);
      else if (this.state.object.items[i].colour == "yellow") show.push(colours.yellow);
      const dataRow = [];
      dataRow.push(this.state.object.items[i].name);



      if (this.state.editable == false)
        dataRow.push(this.state.object.items[i].resQuantity);

      else {
        dataRow.push
          (
            <View style={styles.plusminuscontainer}>
              <Text style={styles.plusminustext}>{this.state.object.items[i].resQuantity}</Text>
              <View style={styles.plusminusbuttons} >
                <TouchableOpacity underlayColor="white" onPress={() => this.updateState(i, "+")} >
                  <AntDesign name="plus" size={10} color="black" style={[styles.plusminusbuttonText, { paddingBottom: 10 }]} />
                </TouchableOpacity>

                <TouchableOpacity underlayColor="white" onPress={() => this.updateState(i, "-")} >
                  <AntDesign name="minus" size={10} color="black" style={styles.plusminusbuttonText} />
                </TouchableOpacity>

              </View>
            </View>
          );
      }

      dataRow.push(this.state.object.items[i].reqQuantity);
      data.push(dataRow);
    }

    return (
      <View style={styles.container}>
        <View style={styles.tableBody}>
          <Text style={styles.text}>DETECTIONS</Text>
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
                  style={[styles.row, { backgroundColor: show[index] }]}
                  textStyle={styles.text}
                  onPress={() => {
                    show[index] == colours.red ? this.sendData(this.state.object, "1") : null;
                  }}
                />
              ))}
            </Table>

            <View style={styles.middleicon}>

              <TouchableHighlight onPress={() => { this.sendData(this.state.object, 0); }} underlayColor="white">

                <Icon name="add-circle-sharp" type="ioniicons" color="black" size={40} />

              </TouchableHighlight>

              <Text style={{ marginLeft: -15 }}>ADD IMAGE</Text>

            </View>

          </ScrollView>
        </View>

        <View style={styles.bottomNav}>
          <View style={styles.bottomicon}>
            <TouchableHighlight
              onPress={() => { this.sendPhotos(this.state.object.images); }}
              underlayColor="white"
            >
              <Icon name="images" type="ioniicons" color="black" size={30} />
            </TouchableHighlight>
          </View>

          <View style={styles.bottomicon}>
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
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  head: {
    height: windowHeight / 16.44,
    backgroundColor: colours.blue,
  },
  text: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
  headerText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 13,
  },
  dataWrapper: {
    marginTop: -1,
  },
  row: {
    height: windowHeight / 13.7,
    marginTop: windowHeight / 274,
  },
  tableBody: {
    alignItems: "center",
    paddingTop: windowHeight / 11.7428,
    marginBottom: 150,
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
    flexDirection: 'row'
  },
  plusminustext: {
    textAlign: "center",
    paddingTop: 12,
    paddingLeft: 22,
    fontWeight: "bold",
    fontSize: 20,
  },
  plusminusbuttons: {
    paddingLeft: 20,
    flexDirection: "column",
    alignItems: "center",


  },
  plusminusbuttonText: {

    fontSize: 20,
    paddingLeft: -1,

  }

});
