package api

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/datta/rss-reader/backend/internal/db"
	"github.com/datta/rss-reader/backend/internal/model"
	"github.com/datta/rss-reader/backend/internal/worker"
	"github.com/mmcdole/gofeed"
)

type Handler struct {
	DB *sql.DB
}

func NewHandler(db *sql.DB) *Handler {
	return &Handler{DB: db}
}

func (h *Handler) GetFeeds(w http.ResponseWriter, r *http.Request) {
	feeds, err := db.GetFeeds(h.DB)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Avoid returning null for empty slice
	if feeds == nil {
		feeds = []model.Feed{}
	}
	respondJSON(w, feeds)
}

func (h *Handler) AddFeed(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	id, err := db.AddFeed(h.DB, req.URL)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Trigger immediate scrape in background
	go func() {
		fp := gofeed.NewParser()
		worker.ProcessFeed(h.DB, fp, model.Feed{ID: int(id), URL: req.URL})
	}()

	respondJSON(w, model.Feed{ID: int(id), URL: req.URL})
}

func (h *Handler) GetItems(w http.ResponseWriter, r *http.Request) {
	items, err := db.GetItems(h.DB)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if items == nil {
		items = []model.Item{}
	}
	respondJSON(w, items)
}

func respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
