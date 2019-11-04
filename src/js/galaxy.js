romanDictionary = {
  "I": 1,
  "V": 5,
  "X": 10,
  "L": 50,
  "C": 100,
  "D": 500,
  "M": 1000,
};

var outsiderDictionary = {};

var canRepeatUpToThree = ["I", "X", "C", "M"];
var canNotRepeat = ["D", "L", "V"];
var canNotSubtract = ["V", "L", "D"];
var subtractDictionary = {
  "I": ["V", "X"],
  "X": ["L", "C"],
  "C": ["D", "M"],
};

var multiplyList;

function startProcess() {
  multiplyList = [];
  var input = document.getElementById("input").value;
  var processedInput = processInput(input);

  try {
    var dictionary = buildDictionary(processedInput.instructions);
    var answers = '';
    for (question of processedInput.questions) {
      answers = answers.concat(calculateAnswer(dictionary, question) + '\n');
    }
    document.getElementById("output").value = answers;
  } catch (ex) {
    document.getElementById("output").value = ex.message;
  }
}

function processInput(input) {
  var instructions = [];
  var questions = [];

  var lines = input.split('\n');
  for (line of lines) {
    if (line.trim() !== "") {
      if (isQuestion(line)) {
        questions.push(line.trim());
      } else {
        instructions.push(line.trim());
      }
    }
  }

  return {
    instructions,
    questions,
  };
}

function isQuestion(line) {
  return line[line.length - 1] === '?';
}

function buildDictionary(instructions) {
  var dictionary = {};

  for (instruction of instructions) {
    var splittedInstruction = instruction.split(" is ");
    var symbols = splittedInstruction[1].split(" ");
    if (symbols.length === 1) {
      dictionary[splittedInstruction[0]] = romanDictionary[splittedInstruction[1]];
      outsiderDictionary[splittedInstruction[0]] = splittedInstruction[1];
    } else if (symbols.length === 2) {
      calculateValue(dictionary, splittedInstruction[0].split(" "), symbols[0]);
    }
  }

  return dictionary;
}

function calculateValue(dictionary, symbols, result) {
  var frequencyMap = {};
  var accumulatedValue = dictionary[symbols[0]];
  for (var i = 0; i < symbols.length - 1; i++) {
    addFrequency(frequencyMap, symbols[i], symbols[i + 1]);
    validateFrequency(frequencyMap, symbols[i]);
    var currentValue = accumulatedValue;
    var nextValue = dictionary[symbols[i + 1]];
    if (nextValue) {
      accumulatedValue = calculateAccumulatedValue(symbols[i], symbols[i + 1], currentValue, nextValue);
    } else {
      var keyToAdd = symbols[i + 1];
      if (keyToAdd[0] === keyToAdd[0].toUpperCase()) {
        multiplyList.push(keyToAdd);
      }
      dictionary[keyToAdd] = calculateValueToAdd(keyToAdd, accumulatedValue, result);;
    }
  }
}

function addFrequency(frequencyMap, current, next) {
  if (current === next) {
    if (!frequencyMap[current]) {
      frequencyMap[current] = 2;
    } else {
      frequencyMap[current] += 2;
    }
  }
}

function validateFrequency(frequencyMap, symbol) {
  if (canNotRepeat.includes(outsiderDictionary[symbol]) && frequencyMap[symbol] > 1) {
    throw new Error("Invalid sequence: input with more than 1 " + symbol + " in sequence");
  }
  if (canRepeatUpToThree.includes(outsiderDictionary[symbol]) && frequencyMap[symbol] > 3) {
    throw new Error("Invalid sequence: input with more than 3 " + symbol + " in sequence");
  }
}

function canSubtract(currentKey, nextKey) {
  return subtractDictionary[outsiderDictionary[currentKey]].includes(outsiderDictionary[nextKey])
    && !canNotSubtract.includes(outsiderDictionary[currentKey]);
}

function calculateAccumulatedValue(currentKey, nextKey, currentValue, nextValue) {
  if (nextValue > currentValue) {
    return nextValue - currentValue;
  } else {
    return nextValue + currentValue;
  }
}

function calculateValueToAdd(keyToAdd, accumulatedValue, result) {
  if (multiplyList.includes(keyToAdd)) {
    valueToAdd = parseInt(result) / accumulatedValue;
  } else {
    valueToAdd = parseInt(result) - accumulatedValue;
  }
  return valueToAdd;
}

function calculateAnswer(dictionary, question) {
  var symbols = getSymbolsFromQuestion(question);
  if (!symbols) {
    return "I have no idea what you are talking about";
  }

  var result = dictionary[symbols[0]];
  for (var i = 0; i < symbols.length - 1; i++) {
    var currentValue = result;
    var nextValue = dictionary[symbols[i + 1]];
    if (!nextValue) {
      return symbols.join(" ") + " is " + currentValue + " Credits";
    }
    try {
      result = calculateResult(symbols[i], symbols[i + 1], currentValue, nextValue);
    } catch (ex) {
      return ex.message;
    }
  }
  return symbols.join(" ") + " is " + result + " Credits";
}

function calculateResult(currentKey, nextKey, currentValue, nextValue) {
  if (multiplyList.includes(currentKey) || multiplyList.includes(nextKey)) {
    return currentValue * nextValue;
  } else if (currentValue >= nextValue) {
    return currentValue + nextValue;
  } else {
    if (canSubtract(currentKey, nextKey)) {
      return nextValue - currentValue;
    } else {
      throw new Error("Invalid operation: " + currentKey + " can not be subtracted from " + nextKey);
    }
  }
}

function getSymbolsFromQuestion(question) {
  question = question.slice(0, question.length - 1);
  var symbols = question.split(" is ").map(function (item) {
    return item.trim();
  });
  if (symbols.length > 1) {
    return symbols[1].split(" ");
  } else {
    return null;
  }
}
