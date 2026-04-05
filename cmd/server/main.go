package main

import (
    "database/sql"
    "log"
    "net/http"
    "time"

    "github.com/joho/godotenv"
    _ "github.com/lib/pq"
    "github.com/pressly/goose/v3"

    "tocaldo/internal/config"
    httpHandler "tocaldo/internal/handler/http"
    "tocaldo/internal/repository/postgres"
    "tocaldo/internal/service"
)

func main() {
    _ = godotenv.Load()
    cfg := config.Load()

    db, err := sql.Open("postgres", cfg.DBDSN)
    if err != nil {
        log.Fatalf("db open: %v", err)
    }
    db.SetMaxOpenConns(10)
    db.SetMaxIdleConns(5)
    db.SetConnMaxLifetime(30 * time.Minute)

    if err := db.Ping(); err != nil {
        log.Fatalf("db ping: %v", err)
    }

    if err := runMigrations(db); err != nil {
        log.Fatalf("migrations: %v", err)
    }

    repo := postgres.New(db)
    svc := service.NewEventService(repo)
    handler := httpHandler.NewEventHandler(svc)

    mux := http.NewServeMux()
    handler.Register(mux)

    // Static files (index.html, css/, js/)
    mux.Handle("/", http.FileServer(http.Dir(".")))

    srv := &http.Server{
        Addr:    cfg.Addr,
        Handler: withCORS(mux),
    }

    log.Printf("listening on %s", cfg.Addr)
    log.Fatal(srv.ListenAndServe())
}

func runMigrations(db *sql.DB) error {
    if err := goose.SetDialect("postgres"); err != nil {
        return err
    }
    return goose.Up(db, "migrations")
}

func withCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }
        next.ServeHTTP(w, r)
    })
}
