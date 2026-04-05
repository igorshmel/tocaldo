package config

import "os"

type Config struct {
    Addr  string
    DBDSN string
}

func Load() Config {
    cfg := Config{
        Addr:  getEnv("ADDR", ":9090"),
        DBDSN: getEnv("DB_DSN", "postgres://postgres:postgres@localhost:5432/calendar?sslmode=disable"),
    }
    return cfg
}

func getEnv(key, fallback string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return fallback
}
