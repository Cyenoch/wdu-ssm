package main

// Contains 检查切片中是否包含某个字符串元素
func Contains(slice []string, element string) bool {
	for _, item := range slice {
		if item == element {
			return true
		}
	}
	return false
}

type PaginationQueryResult struct {
	Items    []interface{} `json:"items"`
	Bookmark string        `json:"bookmark"`
}
