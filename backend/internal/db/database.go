package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/datta/rss-reader/backend/internal/model"
	_ "github.com/go-sql-driver/mysql"
)

func InitDB(dsn string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	// Retry connection
	for i := 0; i < 10; i++ {
		err = db.Ping()
		if err == nil {
			break
		}
		log.Println("Waiting for DB...", err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		return nil, fmt.Errorf("could not connect to db: %v", err)
	}

	return db, nil
}

func Migrate(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS feeds (
			id INT AUTO_INCREMENT PRIMARY KEY,
			url TEXT NOT NULL,
			title TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS items (
			id INT AUTO_INCREMENT PRIMARY KEY,
			feed_id INT,
			title TEXT,
			link TEXT,
			description TEXT,
			published_at DATETIME,
			guid VARCHAR(255),
			UNIQUE KEY unique_item (feed_id, guid),
			FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE
		);`,
	}

	for _, q := range queries {
		_, err := db.Exec(q)
		if err != nil {
			return err
		}
	}
	return nil
}

func GetFeeds(db *sql.DB) ([]model.Feed, error) {
	rows, err := db.Query("SELECT id, url, title, created_at FROM feeds ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feeds []model.Feed
	for rows.Next() {
		var f model.Feed
		if err := rows.Scan(&f.ID, &f.URL, &f.Title, &f.CreatedAt); err != nil {
			return nil, err
		}
		feeds = append(feeds, f)
	}
	return feeds, nil
}

func AddFeed(db *sql.DB, url string) (int64, error) {
	res, err := db.Exec("INSERT INTO feeds (url, title, created_at) VALUES (?, ?, ?)", url, "", time.Now())
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func GetItems(db *sql.DB) ([]model.Item, error) {
	// Limit to 100 for now
	rows, err := db.Query("SELECT id, feed_id, title, link, description, published_at, guid FROM items ORDER BY published_at DESC LIMIT 100")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.Item
	for rows.Next() {
		var i model.Item
		if err := rows.Scan(&i.ID, &i.FeedID, &i.Title, &i.Link, &i.Description, &i.PublishedAt, &i.GUID); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}

func UpsertItems(db *sql.DB, items []model.Item) error {
	stmt, err := db.Prepare("INSERT IGNORE INTO items (feed_id, title, link, description, published_at, guid) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, item := range items {
		_, err := stmt.Exec(item.FeedID, item.Title, item.Link, item.Description, item.PublishedAt, item.GUID)
		if err != nil {
			log.Println("Error inserting item:", err)
			// continue?
		}
	}
	return nil
}
