package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"os"
	"strings"
)

var (
	fiveWordsJson, sixWordsJson []byte
)

func loadWords(path string) []byte {
	bytes, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("error reading letter words at %s: %v", path, err)
	}
	words := strings.Split(strings.TrimSpace(string(bytes)), "\n")
	for i, word := range words {
		words[i] = strings.ToUpper(word)
	}
	wordsJson, err := json.Marshal(words)
	if err != nil {
		log.Fatalf("error serializing words from %s: %v", path, err)
	}
	return wordsJson
}

func main() {
	log.SetFlags(0)

	addr := flag.String("addr", "127.0.0.1:8000", "Address to run on")
	fiveWordsPath := flag.String(
		"five-words", "five-words.txt", "Path to list of five-letter words",
	)
	sixWordsPath := flag.String(
		"six-words", "six-words.txt", "Path to list of six-letter words",
	)
	flag.Parse()

	fiveWordsJson = loadWords(*fiveWordsPath)
	sixWordsJson = loadWords(*sixWordsPath)

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/index.js", jsHandler)
	http.HandleFunc("/index.css", cssHandler)
	http.HandleFunc("/five-words.txt", fiveWordsHandler)
	http.HandleFunc("/six-words.txt", sixWordsHandler)
	log.Print("running on: ", *addr)
	log.Fatal("error running: ", http.ListenAndServe(*addr, nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}

func jsHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.js")
}

func cssHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.css")
}

func fiveWordsHandler(w http.ResponseWriter, r *http.Request) {
	//http.ServeFile(w, r, wordsPath)
	w.Header().Set("Content-Type", "application/json")
	w.Write(fiveWordsJson)
}

func sixWordsHandler(w http.ResponseWriter, r *http.Request) {
	//http.ServeFile(w, r, wordsPath)
	w.Header().Set("Content-Type", "application/json")
	w.Write(sixWordsJson)
}
