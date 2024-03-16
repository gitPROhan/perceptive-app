/*
This file displays the order info upon clicking the order box in home screen.

It is prettty similar to the newSummary page.

It has very limited conditional rending, displaying the corresponding colours based on data recieved from routes.

Recieves Summary object (refre summaryobject.json) from home page.

Recieves code 'ak' from home to confirm that the route is from home.(not so important treat it like a precaution ) 

Starts scan by clicking on New scan option (code =2) or clicking on the red one (code = 1)

Functions and thier roles are explained by inline comments. Have a look at the final jsx to understand how the functions are used.


*/

import React, { Component } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Dimensions,
  TouchableHighlight,
} from "react-native";
import { Table, Row } from "react-native-table-component";
import Icon from "react-native-vector-icons/Ionicons";
import { header, host, port } from "./Constants";
import axios from "axios";
import colours from "./colours";
import { StackActions } from '@react-navigation/native';

//screen dimensions for making the css universal; i.e, independent of phone's dimension
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default class OrderInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableHead: ["ITEM", "DETECTED", "REQUIRED"],
      widthArr: [windowWidth / 2.8, windowWidth / 4.9, windowWidth / 4.9],
      test: 10,
    };
    this.code = this.props.route.params.code;
    this.summary = this.props.route.params.summary;

  }
  //delete function for deleting the order.
  callDelete = async (title) => {
    var flaskRouteName = "/deleteOrder";
    var route = header + host + ":" + port + flaskRouteName;
    var response = await axios.post(route, { title: title });

    const pushAction = StackActions.push("Home");
    this.props.navigation.dispatch(pushAction);
  };

  // this function starts the scanning process by codes 2 and 1.
  sendData = (obj, code) => {
    let orders = [];// passsing orders as null for a unscanned order as the model should scan for all the items in it. 
    if (code == 2) // remove all the existing data from the object.
    {
      obj.images = []
      for (var i = 0; i < obj.items.length; i++) {
        obj.items[i].resQuantity = 0
      }

    }

    // code 1 for red ones  
    if (code == 1) // send only the red coloured orders as the model should scan for only the items which are ot detected.
    {
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

  // function for displaying the images.
  sendPhotos = (photos) => {


    this.props.navigation.navigate("Detected Frames", { photos, });
  };


  render() {

    if (this.code == 'ak') {
      var obj = this.summary;
    }

    var data = [];
    var show = [];
    //setting up the dataRow and data variables and show array for rendering the table.
    for (let i = 0; i < obj.items.length; i++) {
      if (obj.items[i].colour == "green") show.push(colours.green);
      else if (obj.items[i].colour == "red") show.push(colours.red);
      else if (obj.items[i].colour == "grey") show.push(colours.grey);
      else if (obj.items[i].colour == "yellow") show.push(colours.yellow);
      const dataRow = [];
      dataRow.push(obj.items[i].name);
      dataRow.push(obj.items[i].resQuantity);
      dataRow.push(obj.items[i].reqQuantity);
      data.push(dataRow);
    }

    return (
      <View style={styles.container}>
        <View style={styles.tableBody}>
          <Text style={styles.text}>Title : {obj.title}</Text>
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
                    show[index] == colours.red ? this.sendData(obj, "1") : null;
                  }}

                />
              ))}
            </Table>
            <View style={styles.middleicon}>
              <TouchableHighlight
                onPress={() => this.sendData(obj, 2)}
                underlayColor="grey">
                <Icon name="camera" type="ioniicons" color="black" size={40} />
              </TouchableHighlight>
              <Text style={{ width: 35 }}>NEW</Text>
            </View>
          </ScrollView>

        </View>

        <View style={styles.bottomNav}>

          <View style={styles.bottomicon}>
            <TouchableHighlight
              onPress={() => { this.sendPhotos(obj.images); }}
              underlayColor="white"
            >
              <Icon name="images" type="ioniicons" color="black" size={40} />
            </TouchableHighlight>
          </View>

          <View style={styles.bottomicon}>
            <TouchableHighlight
              onPress={() => this.callDelete(obj.title)}
              underlayColor="white"
            >
              <Icon name="trash" type="ioniicons" color="black" size={40} />
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
    alignItems: "flex-end",
    marginTop: 20,
    marginLeft: -10,

  },
});
