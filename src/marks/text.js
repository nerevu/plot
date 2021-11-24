import {create} from "d3";
import {filter, nonempty} from "../defined.js";
import {Mark, indexOf, identity, string, maybeNumber, maybeTuple, numberChannel} from "../mark.js";
import {applyChannelStyles, applyDirectStyles, applyIndirectStyles, applyAttr, applyTransform, offset} from "../style.js";

const defaults = {
  strokeLinejoin: "round"
};

export class Text extends Mark {
  constructor(data, options = {}) {
    const {
      x,
      y,
      text = indexOf,
      textAnchor,
      fontFamily,
      fontSize,
      fontStyle,
      fontVariant,
      fontWeight,
      anchor,
      dx,
      dy = "0.32em",
      rotate
    } = options;
    const [vrotate, crotate] = maybeNumber(rotate, 0);
    const [vfontSize, cfontSize] = maybeNumber(fontSize);
    const [vx, cx] = maybeNumber(x, 0);
    const [vy, cy] = maybeNumber(y, 0);
    super(
      data,
      [
        {name: "x", value: vx, scale: "x", optional: true},
        {name: "y", value: vy, scale: "y", optional: true},
        {name: "fontSize", value: numberChannel(vfontSize), optional: true},
        {name: "rotate", value: numberChannel(vrotate), optional: true},
        {name: "text", value: text}
      ],
      options,
      defaults
    );
    this.rotate = crotate;
    this.textAnchor = string(textAnchor);
    this.fontFamily = string(fontFamily);
    this.fontSize = cfontSize;
    this.fontStyle = string(fontStyle);
    this.fontVariant = string(fontVariant);
    this.fontWeight = string(fontWeight);
    this.cx = cx;
    this.cy = cy;
    this.anchor = anchor;
    this.dx = string(dx);
    this.dy = string(dy);
  }
  render(I, {x, y}, channels, dimensions) {
    const {x: X, y: Y, rotate: R, text: T, fontSize: FS} = channels;
    const {rotate} = this;
    const index = filter(I, X, Y, R).filter(i => nonempty(T[i]));
    const c = textPosition(dimensions, this.anchor, this.cx, this.cy);
    return create("svg:g")
        .call(applyIndirectTextStyles, this)
        .call(applyTransform, x, y, offset, offset)
        .call(g => g.selectAll()
          .data(index)
          .join("text")
            .call(applyDirectTextStyles, this)
            .call(R ? text => text.attr("transform", X && Y ? i => `translate(${X[i]},${Y[i]}) rotate(${R[i]})`
                : X ? i => `translate(${X[i]},${c[1]}) rotate(${R[i]})`
                : Y ? i => `translate(${c[0]},${Y[i]}) rotate(${R[i]})`
                : i => `translate(${c[0]},${c[1]}) rotate(${R[i]})`)
              : rotate ? text => text.attr("transform", X && Y ? i => `translate(${X[i]},${Y[i]}) rotate(${rotate})`
                : X ? i => `translate(${X[i]},${c[1]}) rotate(${rotate})`
                : Y ? i => `translate(${c[0]},${Y[i]}) rotate(${rotate})`
                : `translate(${c[0]},${c[1]}) rotate(${rotate})`)
              : text => text.attr("x", X ? i => X[i] : c[0]).attr("y", Y ? i => Y[i] : c[1]))
            .call(applyAttr, "font-size", FS && (i => FS[i]))
            .text(i => T[i])
            .call(applyChannelStyles, channels))
      .node();
  }
}

export function text(data, {x, y, ...options} = {}) {
  ([x, y] = maybeTuple(x, y));
  return new Text(data, {...options, x, y});
}

export function textX(data, {x = identity, ...options} = {}) {
  return new Text(data, {...options, x});
}

export function textY(data, {y = identity, ...options} = {}) {
  return new Text(data, {...options, y});
}

function applyIndirectTextStyles(selection, mark) {
  applyIndirectStyles(selection, mark);
  applyAttr(selection, "text-anchor", mark.textAnchor);
  applyAttr(selection, "font-family", mark.fontFamily);
  applyAttr(selection, "font-size", mark.fontSize);
  applyAttr(selection, "font-style", mark.fontStyle);
  applyAttr(selection, "font-variant", mark.fontVariant);
  applyAttr(selection, "font-weight", mark.fontWeight);
}

function applyDirectTextStyles(selection, mark) {
  applyDirectStyles(selection, mark);
  applyAttr(selection, "dx", mark.dx);
  applyAttr(selection, "dy", mark.dy);
}

function textPosition({width, height, marginTop, marginRight, marginBottom, marginLeft}, anchor = "", cx = 0, cy = 0) {
  const a = anchor.toLowerCase();
  const v = a.match(/^(top|bottom|)/)[0];
  const h = a.match(/(left|right|)$/)[0];
  if (a != ((h && v) ? `${v}-${h}` : h ? h : v))
    throw new Error(`Unexpected anchor: ${anchor}`);
  const x = h === "left" ? marginLeft : h === "right" ? width - marginRight : (marginLeft + width - marginRight) / 2;
  const y = v === "top" ? marginTop : v === "bottom" ? height - marginBottom : (marginTop + height - marginBottom) / 2;
  return [x + cx, y + cy];
}
