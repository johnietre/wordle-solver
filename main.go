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
  wordsJson []byte
)

func main() {
  log.SetFlags(0)

  addr := flag.String("addr", "127.0.0.1:8000", "Address to run on")
  wordsPath := flag.String("words", "words.txt", "Path to words list")
  flag.Parse()

  bytes, err := os.ReadFile(*wordsPath)
  if err != nil {
    log.Fatal("error reading words: ", err)
  }
  words := strings.Split(strings.TrimSpace(string(bytes)), "\n")
  for i, word := range words {
    words[i] = strings.ToUpper(word)
  }
  wordsJson, err = json.Marshal(words)
  if err != nil {
    log.Fatal("error serializing words: ", err)
  }

  http.HandleFunc("/", homeHandler)
  http.HandleFunc("/index.js", jsHandler)
  http.HandleFunc("/words", wordsHandler)
  log.Print("running on: ", *addr)
  log.Fatal("error running: ", http.ListenAndServe(*addr, nil))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
  http.ServeFile(w, r, "index.html")
}

func jsHandler(w http.ResponseWriter, r *http.Request) {
  http.ServeFile(w, r, "index.js")
}

func wordsHandler(w http.ResponseWriter, r *http.Request) {
  //http.ServeFile(w, r, wordsPath)
  w.Header().Set("Content-Type", "application/json")
  w.Write(wordsJson)
}
