const injectStyle = (style, hemisphere) => {
  if (!style) return;

  let styleElement,
    styleSheet = null;

  if (!document.getElementById(hemisphere)) {
    styleElement = document.createElement('style');
    styleElement.setAttribute("id", hemisphere);
  }
  else {
    styleElement = document.getElementById(hemisphere);
  }  

  document.head.appendChild(styleElement);

  styleSheet = styleElement.sheet;

  styleSheet.insertRule(style, styleSheet.cssRules.length);
};

export default injectStyle;