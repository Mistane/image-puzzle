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
        pieceSize: pieceSize,
        imageWidth: newWidth,
        imageHeight: newHeight,
      };

      pieces.push(pieceObject);
    }
  }
  //shuffle array
  shuffle(pieces);
  pieces.forEach((piece, index) => {
    let {correctX, correctY, pieceSize, imageWidth, imageHeight} = piece;
    console.log("index la ", index);
    console.log("nw la : ", nw);
    let currentX = Math.floor(index / nw);
    let currentY = index % nw;
    console.log(`current x : ${currentX} current y : ${currentY}`);

    let tmp = document.createElement("div");
    //the odd is low but not zero ;)
    if (currentX == correctX && currentY == correctY)
      tmp.classList.add("correct");

    tmp.classList.add("piece");
    tmp.setAttribute("correctX", correctX);
    tmp.setAttribute("correctY", correctY);
    tmp.setAttribute("pieceSize", pieceSize);
    tmp.setAttribute("currentX", currentX);
    tmp.setAttribute("currentY", currentY);

    tmp.style.width = `${pieceSize}px`;
    tmp.style.height = `${pieceSize}px`;
    tmp.style.left = currentY * pieceSize + "px";
    tmp.style.top = currentX * pieceSize + "px";

    tmp.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;
    tmp.style.backgroundImage = `url(${src})`;

    tmp.style.backgroundPosition = `${correctY * -1 * pieceSize}px ${correctX * -1 * pieceSize}px`;

    grid.append(tmp);
  });

  //-----------------------dragging feature----------------------
  let puzzlePieces = document.querySelectorAll(".piece");
  let gridContainer = document.querySelector(".puzzle-grid");
  let gridRect = gridContainer.getBoundingClientRect();
  console.log("hello", gridRect.top, gridRect.left);

  let currentPiece = null;
  let dragOverPiece = null;
  puzzlePieces.forEach((piece) => {
    let gridX = -1;
    let gridY = -1;
    piece.addEventListener("mousedown", (e) => {
      if (piece.classList.contains("correct")) return;
      currentPiece = piece;
      // console.log(current);
      piece.style.zIndex = "100";
    });

    document.addEventListener("mousemove", (e) => {
      if (!currentPiece) return;
      let viewTop = e.clientY;
      let viewLeft = e.clientX;

      const elements = document.elementsFromPoint(viewLeft, viewTop);
      // elements will return [0] current piece dragging, [1] the element under the cursor, [2] the html page lmao
      if (
        elements.length > 2 &&
        elements[1].classList.contains("piece") &&
        !elements[1].classList.contains("correct")
      ) {
        // console.log("element la ", elements[1]);
        dragOverPiece = elements[1];
        document
          .querySelectorAll(".piece")
          .forEach((p) => p.classList.remove("hover"));
        dragOverPiece.classList.add("hover");
      } else dragOverPiece = null;

      //drag piece along pointer
      let pieceSize = parseInt(currentPiece.getAttribute("piecesize"));
      let top = viewTop - gridRect.top - pieceSize / 2;
      let left = viewLeft - gridRect.left - pieceSize / 2;

      //snapping feature
      // let gridX = Math.abs(top / pieceSize);
      // let gridY = Math.abs(left / pieceSize);
      // // console.log(gridX, gridY);
      // if (
      //   gridX - Math.floor(gridX) < 0.7 &&
      //   gridY - Math.floor(gridY) < 0.7 &&
      //   dragOverPiece
      // ) {
      //   console.log("OK Tha duoc roi");
      // }
      // console.log(`Grid coord : ${top / pieceSize} ${left / pieceSize}`);
      // console.log(top, left);

      currentPiece.style.top = top + "px";
      currentPiece.style.left = left + "px";
    });

    document.addEventListener("mouseup", (e) => {
      if (!currentPiece) return;
      if (dragOverPiece) {
        dragOverPiece.classList.remove("hover");
        let pieceSize = currentPiece.getAttribute("piecesize");
        let newX = dragOverPiece.getAttribute("currentx");
        let newY = dragOverPiece.getAttribute("currenty");
        let oldX = currentPiece.getAttribute("currentx");
        let oldY = currentPiece.getAttribute("currenty");

        //check if correct for current piece
        let oldCorrectX = currentPiece.getAttribute("correctx");
        let oldCorrectY = currentPiece.getAttribute("correcty");
        if (oldCorrectX == newX && oldCorrectY == newY) {
          currentPiece.classList.add("correct");
        }

        //check if correct for drag over piece
        let newCorrectX = dragOverPiece.getAttribute("correctx");
        let newCorrectY = dragOverPiece.getAttribute("correcty");
        if (newCorrectX == oldX && newCorrectY == oldY) {
          dragOverPiece.classList.add("correct");
        }

        //swap value
        currentPiece.setAttribute("currentX", newX);
        currentPiece.setAttribute("currentY", newY);

        dragOverPiece.setAttribute("currentX", oldX);
        dragOverPiece.setAttribute("currentY", oldY);

        //swap position
        //apparently the swap value looks reversed but its actually correct???
        currentPiece.style.top = newX * pieceSize + "px";
        currentPiece.style.left = newY * pieceSize + "px";

        dragOverPiece.style.top = oldX * pieceSize + "px";
        dragOverPiece.style.left = oldY * pieceSize + "px";

        console.log("old coord", oldX, oldY);
        console.log("new coord", newX, newY);
      } else {
        let pieceSize = currentPiece.getAttribute("piecesize");
        let oldX = currentPiece.getAttribute("currentx");
        let oldY = currentPiece.getAttribute("currenty");
        currentPiece.style.top = oldX * pieceSize + "px";
        currentPiece.style.left = oldY * pieceSize + "px";
      }
      currentPiece.style.zIndex = "1";
      currentPiece = null;
    });
  });
});

//finish puzzle
const checkBtn = document.querySelector(".check-btn");
if (checkBtn) {
  checkBtn.addEventListener("click", (e) => {
    let pieces = document.querySelectorAll(".piece");
    let arr = [...pieces];
    let check = arr.every((p) => p.classList.contains("correct"));
    if (check) {
      alert("GG YOU WIN");
    } else {
      alert("KEEP TRYING NOOB");
    }
  });
}
