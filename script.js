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

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
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
  let placeholder = document.querySelector(".placeholder");
  console.log("hello");
  container.addEventListener("change", (e) => {
    let tmpContainer = document.querySelector(".tmp-container");
    placeholder.style.display = "block";
    let grid = document.querySelector(".puzzle-grid");
    let imageFile = e.target.files[0];
    src = URL.createObjectURL(imageFile);

    previewContainer.src = src;
    placeholder.src = src;
    console.log(imageFile);
    grid.innerHTML = "";
  });
}

let img = document.querySelector(".preview-image");
img.addEventListener("load", (e) => {
  console.log("load");

  let placeholder = document.querySelector(".placeholder");
  let width = placeholder.clientWidth;
  let height = placeholder.clientHeight;
  placeholder.style.display = "none";

  console.log(src);
  console.log(`dimension is ${width}x${height}`);
  //get ratio

  let {ratio, newWidth, newHeight} = calcDimensions(width, height);
  let tmpContainer = document.querySelector(".tmp-container");
  let grid = document.querySelector(".puzzle-grid");
  // tmpContainer.style.width = `${newWidth}px`;
  grid.style.width = `${newWidth}px`;
  console.log(`ratio is ${ratio}`);
  console.log(`new dimension is ${newWidth}x${newHeight}`);
  let newArea = newWidth * newHeight;

  let {w, h} = ratioThingy(ratio);
  let totalPieces = w * h;
  console.log(totalPieces);
  let minPiece = 30;
  let check = false;
  if (totalPieces < minPiece) {
    check = true;
    console.log("Too few pieces");

    ratio = `${w * 4}:${h * 4}`;
    console.log(`new ratio : `, ratio);

    totalPieces = parseInt(ratio.split(":")[0]) * parseInt(ratio.split(":")[1]);
    console.log("total piece moi : ", totalPieces);
  }
  let pieceArea = newArea / totalPieces;
  console.log(`piece area : ${pieceArea}`);
  let {w: nw, h: nh} = ratioThingy(ratio);
  let pieceSize = Math.sqrt(pieceArea);
  if (check) {
    grid.style.width = `${Math.ceil(parseInt(ratio.split(":")[0]) * pieceSize)}px`;
  }

  console.log(pieceSize, "x", pieceSize);

  let pieces = [];
  for (let i = 0; i < nh; i++) {
    for (let j = 0; j < nw; j++) {
      let pieceObject = {
        correctX: i,
        correctY: j,
        currentX: 0,
        currentY: 0,
        pieceSize: pieceSize,
        imageWidth: newWidth,
        imageHeight: newHeight,
      };

      pieces.push(pieceObject);
    }
  }
  //shuffle array
  shuffle(pieces);
  pieces.forEach((piece) => {
    let {
      correctX,
      correctY,
      currentX,
      currentY,
      pieceSize,
      imageWidth,
      imageHeight,
    } = piece;

    let tmp = document.createElement("div");
    let tmpImg = document.createElement("img");
    tmp.classList.add("piece");
    tmp.setAttribute("correctX", correctX);
    tmp.setAttribute("correctY", correctY);
    tmp.setAttribute("pieceSize", pieceSize);
    tmpImg.classList.add("piece-img");

    tmp.style.width = `${pieceSize}px`;
    tmp.style.height = `${pieceSize}px`;

    tmpImg.style.width = `${imageWidth}px`;
    tmpImg.style.height = `${imageHeight}px`;
    tmpImg.style.top = `${correctX * -1 * pieceSize}px`;
    tmpImg.style.left = `${correctY * -1 * pieceSize}px`;
    tmpImg.src = src;
    tmpImg.draggable = false;

    tmp.append(tmpImg);
    grid.append(tmp);
  });

  //-----------------------dragging feature----------------------
  let puzzlePieces = document.querySelectorAll(".piece");
  let gridContainer = document.querySelector(".puzzle-grid");
  let gridRect = gridContainer.getBoundingClientRect();
  console.log(gridRect.top, gridRect.left);
  let current = null;

  puzzlePieces.forEach((piece) => {
    piece.addEventListener("mousedown", (e) => {
      current = piece;
      const rect = piece.getBoundingClientRect();
      console.log("hello");
      console.log(rect.top, rect.left);
      piece.offsetLeft = 0;
      piece.offsetTop = 0;

      piece.style.zIndex = "100";
    });
    // piece.addEventListener("mousemove", (e) => {
    //   if (
    //     !piece.getAttribute("isDrag") ||
    //     piece.getAttribute("isDrag") == false
    //   )
    //     return;
    //   piece.setAttribute("isDrag", true);
    //   let pieceSize = piece.getAttribute("pieceSize");
    //   let rect = piece.getBoundingClientRect();
    //   let viewTop = e.clientY;
    //   let viewLeft = e.clientX;
    //   console.log("ok");
    //   console.log(viewTop, viewLeft);

    //   // minus pieceSize / 2 for the cursor to be in the piece itself
    //   piece.style.top = viewTop - gridRect.top - pieceSize / 2 + "px";
    //   piece.style.left = viewLeft - gridRect.left - pieceSize / 2 + "px";
    //   // console.log(piece.getAttribute("correctX"));
    //   // console.log(piece.getAttribute("correctY"));
    // });
    // piece.addEventListener("mouseup", (e) => {
    //   console.log("STOP");
    //   piece.setAttribute("isDrag", false);
    // });
    document.addEventListener("mousemove", (e) => {
      if (!current) return;
      let viewTop = e.clientY;
      let viewLeft = e.clientX;
      let top = viewTop - gridRect.top - pieceSize / 2 + "px";
      let left = viewLeft - gridRect.left - pieceSize / 2 + "px";
      console.log(top, left);

      current.style.top = top;
      current.style.left = left;
      // current.style.left = e.clientX - gridRect.left - current.offsetX + "px";
      // current.style.top = e.clientY - gridRect.top - current.offsetY + "px";
    });

    document.addEventListener("mouseup", () => {
      if (!current) return;

      current.style.zIndex = "1";
      current = null;
    });
  });
});

// document.addEventListener("mousemove", (e) => {
//   console.log(e.clientX, "-", e.clientY);
// });
