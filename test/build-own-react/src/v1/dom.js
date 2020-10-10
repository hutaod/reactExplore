export const updateElement = (dom, oldProps, newProps) => {
  for (let name in Object.assign(Object.assign({}, oldProps), newProps)) {
      let oldValue = oldProps[name];
      let newValue = newProps[name];
      if (oldValue === newValue || name === 'children') ;
      else if (name === 'style') {
          for (const k in Object.assign(Object.assign({}, oldValue), newValue)) {
              if (!(oldValue && newValue && oldValue[k] === newValue[k])) {
                  dom[name][k] = (newValue === null || newValue === void 0 ? void 0 : newValue[k]) || '';
              }
          }
      }
      else if (name[0] === 'o' && name[1] === 'n') {
          name = name.slice(2).toLowerCase();
          if (oldValue)
              dom.removeEventListener(name, oldValue);
          dom.addEventListener(name, newValue);
      }
      else if (name in dom && !(dom instanceof SVGElement)) {
          dom[name] = newValue || '';
      }
      else if (newValue == null || newValue === false) {
          dom.removeAttribute(name);
      }
      else {
          dom.setAttribute(name, newValue);
      }
  }
};

export const createElement = (fiber) => {
  const dom = fiber.type === 'text'
      ? document.createTextNode('')
      : fiber.op & (1 << 4)
          ? document.createElementNS('http://www.w3.org/2000/svg', fiber.type)
          : document.createElement(fiber.type);
  updateElement(dom, {}, fiber.props);
  return dom;
};