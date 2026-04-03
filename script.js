let syntaxAttr = {
  currentRowAttr: "current_row",
  currentColumnAttr: "current_column",
  correctRowAttr: "correct_row",
  currentColumnAttr: "current_column",
  gridSelector: ".puzzle-grid",
  pieceSizeAttr: "piece_size",
};

function getAdjustedDimensions(width, height) {
  let newAspectRatio = nearestNormalAspectRatio(width, height, 1);
  let {w, h} = newAspectRatio;
  // Calc new dimensions

  let roundedWidth = Math.round(width / w),
    newWidthVal = Math.round(roundedWidth * w),
    newHeightVal = Math.round(roundedWidth * h);
  return {
    ratio: newAspectRatio,
    adjustedWidth: newWidthVal,
    adjustedHeight: newHeightVal,
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

  let w = parseInt(match.split(":")[0]),
    h = parseInt(match.split(":")[1]);
  return {w, h};
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

function checkCorrectPosition(piece) {
  let {currentRowAttr, currentColumnAttr, correctRowAttr, correctColumnAttr} =
    syntaxAttr;
  let currentRow = piece.getAttribute(currentRowAttr);
  let currentColumn = piece.getAttribute(currentColumnAttr);
  let correctRow = piece.getAttribute(correctRowAttr);
  let correctColumn = piece.getAttribute(correctColumnAttr);

  return currentRow == correctRow && currentColumn == correctColumn;
}

function calcTotalPieces(width, height, ratio) {
  let minPieces = 30;
  let totalPieces = width * height;
  let check = false;
  if (totalPieces < minPieces) {
    ratio = {
      w: width * 4,
      h: height * 4,
    };
    totalPieces = width * 4 * (height * 4);
  }

  return {
    check,
    totalPieces,
  };
}

function dragFeature(pieceSelector, gridSelector, correctIndicatorClass) {
  let puzzlePieces = document.querySelectorAll(pieceSelector);
  let gridContainer = document.querySelector(gridSelector);
  let gridRect = gridContainer.getBoundingClientRect();

  //drag
  let currentPiece = null;
  let dragOverPiece = null;
  puzzlePieces.forEach((piece) => {
    piece.addEventListener("mousedown", (e) => {
      if (piece.classList.contains(correctIndicatorClass)) return;
      currentPiece = piece;
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
        !elements[1].classList.contains(correctIndicatorClass)
      ) {
        dragOverPiece = elements[1];
        tmp = dragOverPiece;
        document
          .querySelectorAll(".piece")
          .forEach((p) => p.classList.remove("hover"));
        dragOverPiece.classList.add("hover");
      } else {
        // dragOverPiece.classList.remove("hover");
        dragOverPiece = null;
      }

      //drag piece along pointer
      let pieceSize = parseInt(
        currentPiece.getAttribute(syntaxAttr.pieceSizeAttr),
      );
      let top = viewTop - gridRect.top - pieceSize / 2;
      let left = viewLeft - gridRect.left - pieceSize / 2;

      currentPiece.style.top = top + "px";
      currentPiece.style.left = left + "px";
    });

    document.addEventListener("mouseup", (e) => {
      if (!currentPiece) return;
      let {currentRowAttr, currentColumnAttr, pieceSizeAttr} = syntaxAttr;
      if (dragOverPiece) {
        dragOverPiece.classList.remove("hover");

        let pieceSize = currentPiece.getAttribute(pieceSizeAttr);
        let currentRow = currentPiece.getAttribute(currentRowAttr);
        let currentColumn = currentPiece.getAttribute(currentColumnAttr);
        let newRow = dragOverPiece.getAttribute(currentRowAttr);
        let newColumn = dragOverPiece.getAttribute(currentColumnAttr);

        //swap value
        currentPiece.setAttribute(currentRowAttr, newRow);
        currentPiece.setAttribute(currentColumnAttr, newColumn);

        dragOverPiece.setAttribute(currentRowAttr, currentRow);
        dragOverPiece.setAttribute(currentColumnAttr, currentColumn);

        if (checkCorrectPosition(currentPiece)) {
          currentPiece.classList.add(correctIndicatorClass);
        }

        if (checkCorrectPosition(dragOverPiece)) {
          dragOverPiece.classList.add(correctIndicatorClass);
        }
        //swap position
        currentPiece.style.top = newRow * pieceSize + "px";
        currentPiece.style.left = newColumn * pieceSize + "px";

        dragOverPiece.style.top = currentRow * pieceSize + "px";
        dragOverPiece.style.left = currentColumn * pieceSize + "px";
      } else {
        //No drag over piece then return to original position
        let pieceSize = currentPiece.getAttribute(pieceSizeAttr);
        let currentRow = currentPiece.getAttribute(currentRowAttr);
        let currentColumn = currentPiece.getAttribute(currentColumnAttr);
        currentPiece.style.top = currentRow * pieceSize + "px";
        currentPiece.style.left = currentColumn * pieceSize + "px";
        document
          .querySelectorAll(".piece")
          .forEach((piece) => piece.classList.remove("hover"));
      }
      currentPiece.style.zIndex = "1";
      currentPiece = null;
    });
  });
}

function renderPuzzle(placeholderSelector, gridSelector, cb) {
  let placeholder = document.querySelector(placeholderSelector);
  placeholder.addEventListener("load", (e) => {
    let width = placeholder.clientWidth;
    let height = placeholder.clientHeight;
    let src = placeholder.src;
    let grid = document.querySelector(gridSelector);
    placeholder.style.display = "none";

    console.log(`dimension is ${width}x${height}`);

    //get info
    let {ratio, adjustedWidth, adjustedHeight} = getAdjustedDimensions(
      width,
      height,
    );
    console.log("RATIO IS", ratio);

    grid.style.width = adjustedWidth + "px";

    console.log(`new dimension is ${adjustedWidth}x${adjustedHeight}`);
    let newArea = adjustedWidth * adjustedHeight;

    let {check, totalPieces} = calcTotalPieces(ratio.w, ratio.h, ratio);
    console.log("NEW RATIO : ", ratio);

    let pieceArea = newArea / totalPieces;
    let pieceSize = Math.sqrt(pieceArea);
    if (check) {
      grid.style.width = ratio.w * pieceSize + "px";
    }

    console.log(pieceSize, "x", pieceSize);

    let pieces = [];
    for (let i = 0; i < ratio.h; i++) {
      for (let j = 0; j < ratio.w; j++) {
        let pieceObject = {
          correct_row: i,
          correct_column: j,
          pieceSize: pieceSize,
          imageWidth: adjustedWidth,
          imageHeight: adjustedHeight,
        };
        pieces.push(pieceObject);
      }
    }
    //shuffle array
    shuffle(pieces);
    pieces.forEach((pieceInfo, index) => {
      let {correct_row, correct_column, pieceSize, imageWidth, imageHeight} =
        pieceInfo;

      let {
        correctRowAttr,
        correctColumnAttr,
        currentRowAttr,
        currentColumnAttr,
        pieceSizeAttr,
      } = syntaxAttr;
      let {w, h} = ratio;
      let current_row = Math.floor(index / w);
      let current_column = index % w;
      let piece = document.createElement("div");

      piece.classList.add("piece");
      piece.setAttribute(correctRowAttr, correct_row);
      piece.setAttribute(correctColumnAttr, correct_column);
      piece.setAttribute(currentRowAttr, current_row);
      piece.setAttribute(currentColumnAttr, current_column);
      piece.setAttribute(pieceSizeAttr, pieceSize);

      piece.style.width = pieceSize + "px";
      piece.style.height = pieceSize + "px";
      piece.style.top = current_row * pieceSize + "px";
      piece.style.left = current_column * pieceSize + "px";

      piece.style.backgroundSize = `${imageWidth}px ${imageHeight}px`;
      piece.style.backgroundImage = `url(${src})`;

      piece.style.backgroundPosition = `${correct_column * -1 * pieceSize}px ${correct_row * -1 * pieceSize}px`;

      //the odd is low but not zero ;)
      if (checkCorrectPosition(piece)) piece.classList.add("correct");
      grid.append(piece);
    });

    //after done rendering call callback for drag
    cb(".piece", ".puzzle-grid", "correct");
  });
}

let puzzleInput = document.querySelector(".image-puzzle-input");
if (puzzleInput) {
  let previewContainer = document.querySelector(".preview-image");
  let placeholder = document.querySelector(".placeholder");
  console.log("hello");
  puzzleInput.addEventListener("change", (e) => {
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
renderPuzzle(".placeholder", ".puzzle-grid", dragFeature);

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
