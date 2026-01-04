package model

import "time"

type Feed struct {
	ID        int       `json:"id"`
	URL       string    `json:"url"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
}

type Item struct {
	ID          int       `json:"id"`
	FeedID      int       `json:"feed_id"`
	Title       string    `json:"title"`
	Link        string    `json:"link"`
	Description string    `json:"description"`
	PublishedAt time.Time `json:"published_at"`
	GUID        string    `json:"guid"`
}
