import React, { useMemo } from "react";
import { Text, StyleSheet, View } from "react-native";
import { FontSize, FontFamily, Color, Padding } from "../GlobalStyles";

const getStyleValue = (key, value) => {
  if (value === undefined) return;
  return { [key]: value === "unset" ? undefined : value };
};
const TypeText1 = ({
  header,
  typeTextPosition,
  typeTextAlignSelf,
  typeTextPadding,
  headerFontSize,
  headerLineHeight,
}) => {
  const typeText1Style = useMemo(() => {
    return {
      ...getStyleValue("position", typeTextPosition),
      ...getStyleValue("alignSelf", typeTextAlignSelf),
      ...getStyleValue("padding", typeTextPadding),
    };
  }, [typeTextPosition, typeTextAlignSelf, typeTextPadding]);

  const headerStyle = useMemo(() => {
    return {
      ...getStyleValue("fontSize", headerFontSize),
      ...getStyleValue("lineHeight", headerLineHeight),
    };
  }, [headerFontSize, headerLineHeight]);

  return (
    <View style={[styles.typetext, typeText1Style]}>
      <Text style={[styles.header, headerStyle]}>{header}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    fontSize: FontSize.subtitle_size,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: FontFamily.subtitle,
    color: Color.neutral500,
    textAlign: "left",
  },
  typetext: {
    backgroundColor: Color.colorWhite,
    overflow: "hidden",
    flexDirection: "row",
    padding: Padding.p_base,
    alignSelf: "stretch",
  },
});

export default TypeText1;
