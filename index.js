class Status {
  static NA = 0;
  static Green = 1;
  static Yellow = 2;
  static Grey = 3;
};

class Letter {
  constructor(l) {
    this.letter = l || "";
    this.status = Status.NA;
  }
  cycleStatus() {
    if (this.status !== Status.Grey) {
      this.status++;
    } else {
      this.status = Status.NA;
    }
  }
  cycleStatusBack() {
    if (this.status !== Status.NA) {
      this.status--;
    } else {
      this.status = Status.Grey;
    }
  }
  getColor() {
    switch (this.status) {
    case Status.Green:
      return "lightgreen";
    case Status.Yellow:
      return "yellow";
    case Status.Grey:
      return "lightgrey";
    default:
      return "white";
    }
  }
};

function newLetters(len) {
  const arr = new Array(len);
  for (var i = 0; i < len; i++) {
    arr[i] = new Letter();
  }
  return arr;
}

const App = {
  data() {
    const numLetters = 5;
    return {
      words : [],
      filteredWords : [],
      numLetters : numLetters,

      guesses : [],
      letters : newLetters(numLetters)
    };
  },

  async mounted() { await this.loadWords(true); },

  methods : {
    async loadWords(five) {
      const resp = await fetch(`/${(five) ? "five" : "six"}-words.txt`);
      if (!resp.ok) {
        const text = await resp.text();
        console.log(`error getting words: code: ${resp.status}, body: ${text}`);
        alert(`Error loading words: ${text}`);
        return false;
      }
      this.words = (await resp.json());
      for (let i = 0; i < this.words.length; i++) {
        this.words[i] = this.words[i].toUpperCase();
      }
      return true;
    },
    changeLetter(ev, i) {
      if (ev.isComposing || ev.keyCode == 229) {
        return;
      }
      switch (ev.key) {
      case "Enter":
        this.filter();
        return;
      case "Space", " ":
        const letter = this.letters[i];
        letter.cycleStatus();
        ev.target.innerText = letter.letter;
        return;
      case "Backspace":
        if (this.letters[i].letter == "") {
          if (ev.target.previousElementSibling) {
            ev.target.previousElementSibling.focus();
            i--;
          }
        }
        this.letters[i].letter = "";
        return;
      case "ArrowLeft":
        if (ev.target.previousElementSibling) {
          ev.target.previousElementSibling.focus();
        }
        return;
      case "ArrowRight":
        if (ev.target.nextElementSibling) {
          ev.target.nextElementSibling.focus();
        }
        return;
      case "ArrowUp":
        this.letters[i].cycleStatusBack();
        ev.preventDefault();
        return;
      case "ArrowDown":
        this.letters[i].cycleStatus();
        ev.preventDefault();
        return;
      }
      if (ev.key.length !== 1 || !ev.key.match(/[a-z]/i)) {
        ev.target.innerText = this.letters[i].letter;
        return;
      }
      this.letters[i].letter = ev.key.toUpperCase();
      if (ev.target.nextElementSibling) {
        ev.target.nextElementSibling.focus();
      }
    },
    filter() {
      for (const letter of this.letters) {
        if (letter.status === Status.NA || letter.letter == "") {
          alert("Fill in all letters and set each of their statuses");
          return;
        }
      }
      if (this.guesses.length === 0) {
        this.filteredWords = this.words;
      }
      this.filteredWords = this.filteredWords.filter((word) => {
        const letters = word.split('');
        for (let i = 0; i < this.numLetters; i++) {
          const letter = this.letters[i];
          if (letter.status === Status.Green) {
            if (letters[i] !== letter.letter) {
              return false;
            }
            letters[i] = "";
          }
        }
        for (let i = 0; i < this.numLetters; i++) {
          const letter = this.letters[i];
          if (letter.status === Status.Yellow) {
            if (letters[i] === letter.letter) {
              return false;
            }
            const index = letters.indexOf(letter.letter);
            if (index === -1) {
              return false;
            }
            letters[index] = "";
          }
        }
        for (let i = 0; i < this.numLetters; i++) {
          const letter = this.letters[i];
          if (letter.status === Status.Grey) {
            if (letters.indexOf(letter.letter) !== -1) {
              return false;
            }
          }
        }
        return true;
      });

      this.guesses.push(this.letters);
      this.letters = newLetters(this.numLetters);
    },
    cycleLetterStatus(ev, i) {
      if (ev.target == document.activeElement) {
        console.log("active", i);
      }
    },
    fillLetters(word) {
      for (let i = 0; i < this.numLetters; i++) {
        this.letters[i] = new Letter(word[i]);
      }
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    },
    undo() {
      if (this.guesses.length === 0) {
        return;
      }
      if (!confirm("Undo last guess?")) {
        return;
      }
      const letters = this.guesses.pop();
      const guesses = this.guesses;
      this.guesses = [];
      for (const guess of guesses) {
        this.letters = guess;
        this.filter();
      }
      this.letters = letters;
    },
    reset() {
      if (!confirm("Reset?")) {
        return;
      }
      this.internalReset();
    },
    internalReset() {
      this.filteredWords = [];
      this.guesses = [];
      this.letters = newLetters(this.numLetters);
    },
    async switchNumLetters() {
      const five = this.numLetters !== 5;
      const newNum = (five) ? 5 : 6;
      const msg = `Switch to ${newNum} letters and reset?`;
      if (!confirm(msg)) {
        return;
      }
      if (!(await this.loadWords(five))) {
        return;
      }
      this.numLetters = newNum;
      this.internalReset();
    }
  }
};
const app = Vue.createApp(App);
app.mount("#app");
