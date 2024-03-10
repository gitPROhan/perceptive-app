import { Font } from 'expo';

// Function to load fonts asynchronously
export const loadFontsAsync = async () => {
  await Font.loadAsync({
    RobotoLight: require('./assets/fonts/Roboto-Light.ttf'),
    RobotoMedium: require('./assets/fonts/Roboto-Medium.ttf'),
    NunitoBold: require('./assets/fonts/Nunito-Bold.ttf'),
    InterMedium: require('./assets/fonts/Inter-Medium.ttf'),
  });
};

/* fonts */
export const FontFamily = () => {
  return {
    body: "RobotoLight",
    subtitle: "RobotoMedium",
    nunitoBold: "NunitoBold",
    interMedium: "InterMedium",
  };
};
// export const FontFamily = {
//   body: "Roboto-Light",
//   subtitle: "Roboto-Medium",
//   nunitoBold: "Nunito-Bold",
//   interMedium: "Inter-Medium",
// };
/* font sizes */
export const FontSize = {
  size_7xl_7: 27,
  subtitle_size: 16,
};
/* Colors */
export const Color = {
  colorWhite: "#fff",
  neutral500: "#8f97a3",
  neutral900: "#454b54",
  colorLavender: "#ced9ec",
};
/* Paddings */
export const Padding = {
  p_7xl_7: 27,
  p_4xl_4: 23,
  p_base: 16,
  p_xs: 12,
  p_sm: 14,
};
/* border radiuses */
export const Border = {
  br_21xl_1: 40,
  br_31xl: 50,
};
