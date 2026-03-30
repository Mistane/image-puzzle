function calcDimensions(width, height) {
  let newAspectRatio = nearestNormalAspectRatio(width, height, 1);

  // Calc new dimensions
  let ratioVals = newAspectRatio.split(":");

  let roundedWidth = Math.round(width / ratioVals[0]),
    newWidthVal = Math.round(roundedWidth * ratioVals[0]),
    newHeightVal = Math.round(roundedWidth * ratioVals[1]);
  return {
    ratio: newAspectRatio,
    newWidth: newWidthVal,
    newHeight: newHeightVal,
  };
}

function nearestNormalAspectRatio(width, height, side) {
  /*
   * Calculate the nearest normal aspect ratio
   *
   * width: The width of the space.
   * height: The height of the space.
   * side: The nearest ratio to side with. A number higher than zero tells the function to always return the nearest ratio that is equal or higher than the actual ratio, whereas a smaller number returns the nearest ratio higher that is equal or smaller than the actual ratio. Defaults to 0.
   * maxWidth: The maximum width in the nearest normal aspect ratio. Defaults to 16.
   * maxWidth: The maximum height in the nearest normal aspect ratio. Defaults to 16.
   *
   * https://gist.github.com/jonathantneal/d3a259ebeb46de7ab0de
   */
  var ratio = (width * 100) / (height * 100),
    maxW = 3 in arguments ? arguments[2] : 10,
    maxH = 4 in arguments ? arguments[3] : 10,
    ratiosW = new Array(maxW).join(",").split(","),
    ratiosH = new Array(maxH).join(",").split(","),
    ratiosT = {},
    ratios = {},
    match,
    key;

  ratiosW.forEach(function (empty, ratioW) {
    ++ratioW;

    ratiosH.forEach(function (empty, ratioH) {
      ++ratioH;

      ratioX = (ratioW * 100) / (ratioH * 100);

      if (!ratiosT[ratioX]) {
        ratiosT[ratioX] = true;

        ratios[ratioW + ":" + ratioH] = ratioX;
      }
    });
  });

  for (key in ratios) {
    if (
      !match ||
      (!side &&
        Math.abs(ratio - ratios[key]) < Math.abs(ratio - ratios[match])) ||
      (side < 0 &&
        ratios[key] <= ratio &&
        Math.abs(ratio - ratios[key]) < Math.abs(ratio - ratios[match])) ||
      (side > 0 &&
        ratios[key] >= ratio &&
        Math.abs(ratio - ratios[key]) < Math.abs(ratio - ratios[match]))
    ) {
      match = key;
    }
  }

  return match;
}

function ratioThingy(ratio) {
  let w = parseInt(ratio.split(":")[0]);
  let h = parseInt(ratio.split(":")[1]);
  return {w, h};
}

let src = "";
let container = document.querySelector("#image-puzzle");
if (container) {
  let previewContainer = document.querySelector(".preview-image");
  console.log("hello");
  container.addEventListener("change", (e) => {
    let tmpContainer = document.querySelector(".tmp-container");
    let imageFile = e.target.files[0];
    src = URL.createObjectURL(imageFile);
    previewContainer.src = src;
    console.log(imageFile);
    tmpContainer.innerHTML = "";
  });
}

const getAspectRatio = (w, h) => (w > h ? w / h : h / w);
let img = document.querySelector(".preview-image");
img.addEventListener("load", (e) => {
  console.log("load");
  let width = img.clientWidth;
  let height = img.clientHeight;

  console.log(src);
  console.log(`dimension is ${width}x${height}`);
  //get ratio

  let {ratio, newWidth, newHeight} = calcDimensions(width, height);
  let tmpContainer = document.querySelector(".tmp-container");
  tmpContainer.style.width = `${newWidth}px`;
  console.log(`ratio is ${ratio}`);
  console.log(`new dimension is ${newWidth}x${newHeight}`);
  let newArea = newWidth * newHeight;

  //create new img
  let newImgContainer = document.querySelector(".new-image");
  newImgContainer.src = src;
  newImgContainer.style.width = `${newWidth}px`;
  newImgContainer.style.height = `${newHeight}px`;
  //---------------------------
  let {w, h} = ratioThingy(ratio);
  let totalPieces = w * h;
  console.log(totalPieces);
  let minPiece = 30;
  let check = false;
  if (totalPieces < minPiece) {
    check = true;
    console.log("Too few pieces");
    // totalPieces = Math.floor(minPiece / totalPieces) * totalPieces;
    // ratio = `${Math.min(w + 4, Math.ceil(newWidth / 10))}:${Math.min(h + 4, Math.ceil(newHeight / 10))}`;
    ratio = `${w * 4}:${h * 4}`;
    console.log(`new ratio : `, ratio);
    // totalPieces = totalPieces * 4;
    totalPieces = parseInt(ratio.split(":")[0]) * parseInt(ratio.split(":")[1]);
    console.log("total piece moi : ", totalPieces);
  }
  let pieceArea = newArea / totalPieces;
  console.log(`piece area : ${pieceArea}`);
  let {w: nw, h: nh} = ratioThingy(ratio);
  // let pieceSize = Math.max(
  //   Math.max((newWidth / nw, newHeight / nh), Math.sqrt(pieceArea)),
  // );
  let pieceSize = Math.max(newWidth / nw, newHeight / nh);
  let pieceWidth = Math.sqrt(pieceArea);
  if (check) {
    tmpContainer.style.width = `${Math.ceil(parseInt(ratio.split(":")[0]) * pieceWidth)}px`;
    // tmpContainer.style.width = `${parseInt(ratio.split(":")[0]) * pieceSize}px`;
  }

  console.log(pieceWidth, "x", pieceWidth);

  for (let i = 0; i < nh; i++) {
    for (let j = 0; j < nw; j++) {
      let tmp = document.createElement("div");
      let tmpImg = document.createElement("img");

      tmp.style.width = `${pieceWidth}px`;
      tmp.style.height = `${pieceWidth}px`;
      // tmp.style.width = `${pieceSize}px`;
      // tmp.style.height = `${pieceSize}px`;

      tmp.style.overflow = "hidden";
      tmp.style.position = "relative";

      tmpImg.style.width = `${newWidth}px`;
      tmpImg.style.height = `${newHeight}px`;
      tmpImg.style.position = "absolute";
      tmpImg.style.objectFit = "cover";

      tmpImg.style.top = `${i * -1 * pieceWidth}px`;
      tmpImg.style.left = `${j * -1 * pieceWidth}px`;

      // tmpImg.style.top = `${i * -1 * pieceSize}px`;
      // tmpImg.style.left = `${j * -1 * pieceSize}px`;

      tmpImg.src = src;
      tmpImg.draggable = false;

      tmp.append(tmpImg);
      // tmp.style.backgroundImage = src;
      // tmp.style.backgroundPosition = `${i * -1 * pieceWidth}px ${j * -1 * pieceWidth}`;
      tmpContainer.append(tmp);
    }
  }
});
