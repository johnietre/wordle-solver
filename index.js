const statusNothing = 0;
const statusIncorrect = 1;
const statusAlmost = 2;
const statusCorrect = 3;

class Guess {
  constructor() {
    this.letters = ["", "", "", "", ""];
    this.statuses = [0, 0, 0, 0, 0];
  }
  passes(word) {
    const len = this.letters.length;
    if (word.length != len) {
      return false;
    }
    const chars = word.split(""), almost = [];
    for (const i in this.letters) {
      if (this.statuses[i] == statusAlmost) {
        almost.push(this.letters[i]);
      }
    }
    for (let i = 0; i < len; i++) {
      const wc = chars[i].toUpperCase(),
        c = this.letters[i].toUpperCase(),
        stat = this.statuses[i];
      if (stat == statusCorrect) {
        if (wc != c) {
          return false;
        }
      } else if (wc == c) {
        return false;
      } else {
        const index = almost.indexOf(wc);
        if (index != -1) {
          almost.splice(index, 1);
        }
      }
    }
    return almost.length == 0;
  }
};

const App = {
  data() {
    return {
      statusIncorrect: statusIncorrect,
      statusAlmost: statusAlmost,
      statusCorrect: statusCorrect,

      guesses: [new Guess()],
      filteredWords: [],
      words: []
    };
  },
  async mounted() {
    await this.loadWords();
  },
  methods: {
    async loadWords() {
      const resp = await fetch("/words");
      if (!resp.ok) {
        alert(`Error getting words: ${await resp.text()}`);
        return;
      }
      this.words = await resp.json();
    },
    reset() {
      this.guesses = [new Guess()];
      this.filteredWords = [];
    },
    filterWords() {
      const guess = this.lastGuess();
      for (const c of guess.letters) {
        if (c == "") {
          return;
        }
      }
      if (this.guesses.length == 1) {
        this.filteredWords = this.words;
      }
      this.filteredWords = this.filteredWords.filter((word) => guess.passes(word));
      this.guesses.push(new Guess());
    },
    letterKeyPress(i) {
      if (event.isComposing || event.keyCode == 229) {
        return;
      }
      const guess = this.lastGuess();
      if (event.key == "ArrowLeft") {
        if (event.target.previousElementSibling) {
          event.target.previousElementSibling.focus();
        }
        return;
      } else if (event.key == "ArrowRight") {
        if (event.target.nextElementSibling) {
          event.target.nextElementSibling.focus();
        }
        return;
      } else if (event.key == "Backspace") {
        if (guess.letters[i] == "") {
          i--;
        }
        guess.letters[i] = "";
        guess.statuses[i] = statusNothing;
        if (event.target.previousElementSibling) {
          event.target.previousElementSibling.focus();
        }
        return;
      }
      if (event.key.length == 1 || event.key == "Enter") {
        event.preventDefault();
      }
      if (!isLetter(event.key)) {
        if (event.key == "Enter") {
          this.filterWords();
        }
        return;
      }

      if (event.ctrlKey) {
        guess.statuses[i] = statusIncorrect;
      } else if (event.shiftKey) {
        guess.statuses[i] = statusCorrect;
      } else {
        guess.statuses[i] = statusAlmost;
      }
      guess.letters[i] = event.key.toUpperCase();
      if (event.target.nextElementSibling) {
        event.target.nextElementSibling.focus();
      }
    },
    changeStatus(guessIndex, i) {
      if (guessIndex != this.guesses.length - 1) {
        return;
      }
      const guess = this.guesses[guessIndex];
      const s = guess.statuses[i];
      if (!isLetter(guess.letters[i])) {
        guess.statuses[i] = statusNothing;
      } else if (s == statusNothing) {
        guess.statuses[i] = statusIncorrect;
      } else if (s == statusIncorrect) {
        guess.statuses[i] = statusAlmost;
      } else if (s == statusAlmost) {
        guess.statuses[i] = statusCorrect;
      } else {
        guess.statuses[i] = statusIncorrect;
      }
    },
    isUpper(c) {
      if (c.length != 1) {
        return false;
      }
      const code = c.charCodeAt(0);
      return code >= 65 && code <= 90;
    },
    isLower(c) {
      if (c.length != 1) {
        return false;
      }
      const code = c.charCodeAt(0);
      return code >= 97 && code <= 122;
    },
    getColor(c) {
      if (this.isUpper(c)) {
        return "lightgreen";
      } else if (this.isLower(c)) {
        return "yellow";
      }
    },
    getColorForGuess(guess, i) {
      switch (guess.statuses[i]) {
        case statusIncorrect: return "gray";
        case statusAlmost: return "yellow";
        case statusCorrect: return "lightgreen";
      }
      return "";
    },
    lastGuess() {
      return this.guesses[this.guesses.length - 1];
    }
  }
};

function isLetter(c) {
  if (c.length != 1) {
    return false;
  }
  const code = c.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

Vue.createApp(App).mount("#app");
