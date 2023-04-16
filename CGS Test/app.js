async function* makeTextFileLineIterator(fileURL) {
  // Used the 'makeTextFileLineIterator' function from the Fetch API documentation
  // Fecth Documentation: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  const utf8Decoder = new TextDecoder("utf-8");
  const response = await fetch(fileURL);
  const reader = response.body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  chunk = chunk ? utf8Decoder.decode(chunk) : "";

  const newline = /\r?\n/gm;
  let startIndex = 0;
  let result;

  while (true) {
    const result = newline.exec(chunk);
    if (!result) {
      if (readerDone) break;
      const remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : "");
      startIndex = newline.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = newline.lastIndex;
  }

  if (startIndex < chunk.length) {
    // Last line didn't end in a newline char
    yield chunk.substr(startIndex);
  }
}

async function run() {
  let result = [];
  for await (const line of makeTextFileLineIterator(
    "https://raw.githubusercontent.com/mgax/dexonline-scrabble/master/words.txt"
  )) {
    if (processLine(line)) {
      result.push(" " + processLine(line));
    }
  }

  // Updating the HTML after the await promise is fulfilled
  document.getElementById("id").innerHTML = result;
}

function processLine(line) {
  // Created a regular expression for each type of number plate
  // A general plate number is defined by a county code, a number from the 01-99 interval, and a 3 letter combination that can't begin with "I" or "O" and can't contain "Q"
  const generalRegex =
    /^(AB|AG|AR|BC|BH|BN|BR|BT|BV|BZ|CJ|CL|CS|CT|CV|DB|DJ|GJ|GL|GR|HD|HR|IF|IL|IS|MH|MM|MS|NT|OT|PH|SB|SJ|SM|SV|TL|TM|TR|VL|VN|VS)[IZEASGTO]{1}[IZEASGT]{1}(?![IO])[A-Z]{3}$/g;

  // A old Bucharest plate number is the same as a general one, but the county code has only one letter "B"
  const oldBucharestRegex = /^(B)[IZEASGTO]{1}[IZEASGT]{1}(?![IO])[A-Z]{3}$/g;

  // A new Bucharest plate number is the same as the old one, but the number is from the 100-999 interval
  const newBucharedtRegex =
    /^(B)[IZEASGT]{1}[IZEASGTO]{1}[IZEASGTO]{1}(?![IO])[A-Z]{3}$/g;

  // Checked if a word matches any of the regular expressions
  if (line.match(generalRegex)) {
    return translateToGeneralPlateNumber(line);
  } else if (line.match(oldBucharestRegex)) {
    return translateToOldBucharestPlateNumber(line);
  } else if (line.match(newBucharedtRegex)) {
    return translateToNewBucharestPlateNumber(line);
  } else return null;
}

// Edited each word based on what type of number plate it is
function translateToGeneralPlateNumber(input) {
  var output = input.split("");
  output[2] = translateNumber(output[2]);
  output[3] = translateNumber(output[3]);
  return output.join("");
}

function translateToOldBucharestPlateNumber(input) {
  var output = input.split("");
  output[1] = translateNumber(output[1]);
  output[2] = translateNumber(output[2]);
  return output.join("");
}

function translateToNewBucharestPlateNumber(input) {
  var output = input.split("");
  output[1] = translateNumber(output[1]);
  output[2] = translateNumber(output[2]);
  output[3] = translateNumber(output[3]);
  return output.join("");
}

function translateNumber(letter) {
  switch (letter) {
    case "I":
      return "1";
    case "Z":
      return "2";
    case "E":
      return "3";
    case "A":
      return "4";
    case "S":
      return "5";
    case "G":
      return "6";
    case "T":
      return "7";
    case "O":
      return "0";
    default:
      break;
  }
}

run();
