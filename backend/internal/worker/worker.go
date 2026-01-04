package worker

import (
	"context"
	"database/sql"
	"log"
	"time"

	"github.com/datta/rss-reader/backend/internal/db"
	"github.com/datta/rss-reader/backend/internal/model"
	"github.com/mmcdole/gofeed"
)

func Start(ctx context.Context, database *sql.DB, interval time.Duration) {
	ticker := time.NewTicker(interval)
	fp := gofeed.NewParser()

	// Run immediately
	log.Println("Worker started, processing feeds...")
	go processFeeds(database, fp)

	for {
		select {
		case <-ctx.Done():
			ticker.Stop()
			return
		case <-ticker.C:
			processFeeds(database, fp)
		}
	}
}

func processFeeds(database *sql.DB, fp *gofeed.Parser) {
	feeds, err := db.GetFeeds(database)
	if err != nil {
		log.Println("Error fetching feeds:", err)
		return
	}

	for _, feed := range feeds {
		ProcessFeed(database, fp, feed)
	}
}

func ProcessFeed(database *sql.DB, fp *gofeed.Parser, feed model.Feed) {
	// Set a timeout for parsing
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	parsed, err := fp.ParseURLWithContext(feed.URL, ctx)
	cancel()

	if err != nil {
		log.Printf("Error parsing feed %s: %v", feed.URL, err)
		return
	}

	// Update feed title if missing or empty
	if feed.Title == "" && parsed.Title != "" {
		_, err := database.Exec("UPDATE feeds SET title = ? WHERE id = ?", parsed.Title, feed.ID)
		if err != nil {
			log.Println("Error updating feed title:", err)
		}
	}

	var items []model.Item
	for _, item := range parsed.Items {
		pubDate := time.Now()
		if item.PublishedParsed != nil {
			pubDate = *item.PublishedParsed
		}

		// Fallback for GUID
		guid := item.GUID
		if guid == "" {
			guid = item.Link
		}

		items = append(items, model.Item{
			FeedID:      feed.ID,
			Title:       item.Title,
			Link:        item.Link,
			Description: item.Description,
			PublishedAt: pubDate,
			GUID:        guid,
		})
	}

	if len(items) > 0 {
		err := db.UpsertItems(database, items)
		if err != nil {
			log.Printf("Error upserting items for %s: %v", feed.URL, err)
		} else {
			log.Printf("Processed %d items for feed %s", len(items), feed.URL)
		}
	}
}
