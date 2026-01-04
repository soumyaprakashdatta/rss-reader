package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/datta/rss-reader/backend/internal/db"
	"github.com/datta/rss-reader/backend/internal/model"
	"github.com/datta/rss-reader/backend/internal/worker"
	"github.com/go-chi/chi/v5"
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
	// Parse query params for pagination
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")
	feedIDStr := r.URL.Query().Get("feed_id")

	page := 1
	pageSize := 20

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	var feedID *int
	if feedIDStr != "" {
		if fid, err := strconv.Atoi(feedIDStr); err == nil {
			feedID = &fid
		}
	}

	items, totalCount, err := db.GetItemsPaginated(h.DB, feedID, page, pageSize)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if items == nil {
		items = []model.Item{}
	}

	respondJSON(w, map[string]interface{}{
		"items":       items,
		"page":        page,
		"page_size":   pageSize,
		"total_count": totalCount,
	})
}

func (h *Handler) DeleteFeed(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid feed ID", http.StatusBadRequest)
		return
	}

	err = db.DeleteFeed(h.DB, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
