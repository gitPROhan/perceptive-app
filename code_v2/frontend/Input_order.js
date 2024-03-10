//File responsible for the input order page

//very much similar to a tyical react native input page

//explanation not required.


import React, { Component } from "react";
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { header, host, port } from "./Constants";
import axios from "axios";
var aa = new Date();
export default class Inputs extends Component {
  constructor(props) {
    super(props);
    this.titles = this.props.route.params.titles;
    this.state = {
      Title: "",
      Date: aa.getDate() + "-" + (aa.getMonth() + 1) + "-" + aa.getFullYear(),
      current_order: "",
      current_quantity: 0,
      items: [],
    };
  }
  handleTitle = (title) => {
    this.setState({ Title: title });
  };
  handleOrder = (value) => {
    this.setState({ current_order: value });
  };
  handleQuantity = (value) => {
    this.setState({ current_quantity: value });
  };

  showAlert = (title, msg, text) =>
    Alert.alert(
      title,
      msg,
      [
        {
          text: text,
          onPress: () => {},
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {},
      }
    );

  addOrder = () => {
    if (this.state.current_order == "") {
      this.showAlert("Wrong Order", "Order cannot be empty", "Ok");
      return;
    }
    if (this.state.current_quantity == 0) {
      this.showAlert("Wrong Quantity", "Quantity cannot be 0", "Ok");
      return;
    }
    let a = this.state.items;
    a.push({
      name: this.state.current_order,
      reqQuantity: this.state.current_quantity,
      resQuantity: 0,
      colour: "red",
    });
    this.setState({ items: a, current_order: "", current_quantity: "0" });
  };
  submit = async () => {
    let title = this.state.Title;
    if (title == "") {
      this.showAlert("Wrong Title", "Title cannot be empty", "Ok");
      return;
    }
    if (this.state.items.length == 0) {
      this.showAlert("Input Order", "Order cannot be empty", "Ok");
      return;
    }
    let today =
      aa.getDate() + "-" + (aa.getMonth() + 1) + "-" + aa.getFullYear();
    if (this.titles.includes(title)) {
      this.showAlert("Wrong Title", "Title is already in use", "Ok");
      this.setState({ Title: "" });
      return;
    } else {
      var flaskRouteName = "/postNewOrder";
      var route = header + host + ":" + port + flaskRouteName;
      var response = await axios.post(route, {
        title: title,
        images: [],
        items: this.state.items,
        userId: "0",
        created: today,
        isScanned: false,
      });
      this.props.navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    }
  };
  render() {
    return (
      <ScrollView>
        <Text style={styles.textStyle}>Enter Title : </Text>
        <TextInput
          style={styles.inputStyle}
          placeholder=" Title"
          underlineColorAndroid="transparent"
          placeholderTextColor="#00bfff"
          autoCapitalize="none"
          allowEmpty="false"
          onChangeText={(title) => {
            this.handleTitle(title);
          }}
        />

        <Text style={styles.textStyle}>Date : </Text>

        <Text style={styles.box}>Date:{this.state.Date}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.textStyle}>Enter an Order : </Text>
            <TextInput
              style={styles.inputStyle}
              onChangeText={(Order) => {
                this.handleOrder(Order);
              }}
              placeholder="Enter an Item"
              value={this.state.current_order}
              underlineColorAndroid="transparent"
              placeholderTextColor="#00bfff"
              autoCapitalize="none"
              allowEmpty="false"
            />
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.textStyle}>Quantity : </Text>
            <TextInput
              style={styles.inputStyle}
              value={this.state.current_quantity.toString()}
              onChangeText={(Quantity) => {
                this.handleQuantity(Quantity);
              }}
              placeholder="Enter Quantity"
              underlineColorAndroid="transparent"
              placeholderTextColor="#00bfff"
              autoCapitalize="none"
              allowEmpty="false"
              keyboardType="number-pad"
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.buttonStyle}
          activeOpacity={0.5}
          onPress={() => this.addOrder()}
        >
          <Text style={styles.buttonTextStyle}>Add</Text>
        </TouchableOpacity>
        <Text style={styles.buttonTextStyle1}>All Orders</Text>
        {this.state.items.length == 0 ? (
          <Text style={styles.buttonTextStyle1}>
            Add Orders above to Add here
          </Text>
        ) : (
          <View>
            {this.state.items.map((item, i) => {
              return (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    backgroundColor: "#00bfff",
                    borderColor: "black",
                  }}
                  key={i}
                >
                  <View
                    style={{ flex: 1, height: 1, backgroundColor: "white" }}
                  />
                  <View style={{ flex: 2, backgroundColor: "#00bfff" }} key={i}>
                    <View style={{ height: 1, backgroundColor: "white" }} />

                    <Text style={styles.buttonTextStyle}>
                      Orders : {item.name} Quantity : {item.reqQuantity}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ height: 1, backgroundColor: "white" }} />

                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        var items = this.state.items;
                        items.splice(i, 1);
                        this.setState({ items: items });
                      }}
                    >
                      <FontAwesome name="remove" size={30} color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
            <View style={{ flex: 1, height: 1, backgroundColor: "white" }} />
          </View>
        )}
        <TouchableOpacity
          style={styles.buttonStyle}
          activeOpacity={0.5}
          onPress={() => this.submit()}
        >
          <Text style={styles.buttonTextStyle}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  textStyle: {
    marginLeft: 10,
    fontSize: 15,
    color: "#00bfff",
    fontWeight: "bold",
  },
  buttonStyle: {
    backgroundColor: "#00bfff",
    justifyContent: "center",
    margin: 15,
    height: 40,
    alignItems: "center",
    width: 100,
    borderRadius: 8,
    // width: "50%",
    // backgroundColor: "#7DE24E",
    // borderWidth: 0,
    // color: "#FFFFFF",
    // borderColor: "#7DE24E",
    // height: 40,
    // alignItems: "center",
    // marginLeft: 35,
    // marginRight: 35,
    // marginTop: 20,
    // marginBottom: 20,
  },
  buttonTextStyle1: {
    // color: "#FFFFFF",
    // paddingVertical: 10,
    // fontSize: 16,
    color: "black",
    textAlign: "center",
  },
  buttonTextStyle: {
    // color: "#FFFFFF",
    // paddingVertical: 10,
    // fontSize: 16,
    color: "#fff",
    textAlign: "left",
  },
  inputStyle: {
    // flex: 1,
    // color: "white",
    // paddingLeft: 15,
    // paddingRight: 15,
    // marginTop: 3,
    // marginBottom: 2,
    // marginLeft: 5,
    // borderWidth: 1,
    // borderColor: "#dadae8",
    // width: "75%",
    margin: 15,
    height: 40,
    borderColor: "#00bfff",
    borderWidth: 1,
    padding: 5,
    borderRadius: 8,
  },
  box: {
    margin: 15,
    height: 40,
    borderColor: "#00bfff",
    borderWidth: 1,
    padding: 8,
    color: "white",
    borderRadius: 8,

    backgroundColor: "#00bfff",
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    // borderRadius: 10,
    // marginRight: 5,
    // marginTop: 5,
  },
});