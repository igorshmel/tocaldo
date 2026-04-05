package models

type Event struct {
    ID        int64  `json:"id"`
    Day       string `json:"day"`
    StartTime *string `json:"startTime"`
    Duration int    `json:"duration"`
    FullText string `json:"fullText"`
    Type     string `json:"type"`
}
