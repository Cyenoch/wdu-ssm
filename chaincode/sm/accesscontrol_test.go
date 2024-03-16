package main

import (
	"testing"
)

func TestIsSubset(t *testing.T) {
	flag := isSubset([]string{"bureau", "admin", "a"}, []string{"bureau", "admin"})
	if !flag {
		t.Errorf("assert failed")
	}

	flag = isSubset([]string{"bureau", "admin"}, []string{"bureau", "admin"})
	if !flag {
		t.Errorf("assert failed")
	}
}
