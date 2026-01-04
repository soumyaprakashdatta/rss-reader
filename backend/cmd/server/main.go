package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/datta/rss-reader/backend/internal/api"
	"github.com/datta/rss-reader/backend/internal/db"
	"github.com/datta/rss-reader/backend/internal/worker"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	dbUser := getEnv("DB_USER", "user")
	dbPass := getEnv("DB_PASSWORD", "password")
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "rss_reader")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPass, dbHost, dbPort, dbName)

	log.Println("Connecting to DB...")
	database, err := db.InitDB(dsn)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer database.Close()

	log.Println("Migrating DB...")
	if err := db.Migrate(database); err != nil {
		log.Fatalf("Failed to migrate DB: %v", err)
	}

	// Start Worker
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Fetch every 15 minutes
	go worker.Start(ctx, database, 15*time.Minute)

	// Setup Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(corsMiddleware)

	handler := api.NewHandler(database)

	r.Get("/feeds", handler.GetFeeds)
	r.Post("/feeds", handler.AddFeed)
	r.Get("/items", handler.GetItems)

	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
