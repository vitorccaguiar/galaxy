var romanDictionary = {
  "I": 1,
  "V": 5,
  "X": 10,
  "L": 50,
  "C": 100,
  "D": 500,
  "M": 1000,
};

var multiplyList;

function startProcess() {
  multiplyList = [];
  var input = document.getElementById("input").value;
  var processedInput = processInput(input);

  var dictionary = buildDictionary(processedInput.instructions);
  var answers = '';
  for (question of processedInput.questions) {
    answers = answers.concat(calculateAnswer(dictionary, question) + '\n');
  }
  document.getElementById("output").value = answers;
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
    var currentValue = accumulatedValue;
    var nextValue = dictionary[symbols[i + 1]];
    if (nextValue) {
      accumulatedValue = calculateAccumulatedValue(currentValue, nextValue);
    } else {
      var keyToAdd = symbols[i + 1];
      if (keyToAdd[0] === keyToAdd[0].toUpperCase()) {
        multiplyList.push(keyToAdd);
      }
      dictionary[keyToAdd] = calculateValueToAdd(keyToAdd, accumulatedValue, result);;
    }
  }
}

function calculateAccumulatedValue(currentValue, nextValue) {
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
    var multiply = multiplyList.includes(symbols[i]) || multiplyList.includes(symbols[i + 1]);
    result = calculateResult(currentValue, nextValue, multiply);
  }
  return symbols.join(" ") + " is " + result + " Credits";
}

function calculateResult(currentValue, nextValue, multiply) {
  if (multiply) {
    return currentValue * nextValue;
  } else if (currentValue >= nextValue) {
    return currentValue + nextValue;
  } else {
    return nextValue - currentValue;
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
