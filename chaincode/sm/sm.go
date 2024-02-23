package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type Student struct {
	ID     string `json:"ID"`
	Name   string `json:"Name"`
	School string `json:"School"`
}

func main() {
	assetChaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creating student manager chaincode: %v", err)
	}

	if err := assetChaincode.Start(); err != nil {
		log.Panicf("Error starting student manager chaincode: %v", err)
	}
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	students := []Student{
		{ID: "2022020121132", Name: "wenqiangLiu", School: "Edu1"},
	}
	for _, student := range students {
		_json, err := json.Marshal(student)
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState(student.ID, _json)
		if err != nil {
			return fmt.Errorf("failed to put to world state. %v", err)
		}
	}
	return nil
}

func (s *SmartContract) CreateStudent(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (s *SmartContract) GetStudents(ctx contractapi.TransactionContextInterface) ([]*Student, error) {
	iterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer iterator.Close()

	var students []*Student
	for iterator.HasNext() {
		resp, err := iterator.Next()
		if err != nil {
			return nil, err
		}

		var student Student
		err = json.Unmarshal(resp.Value, &student)
		if err != nil {
			return nil, err
		}
		students = append(students, &student)
	}

	return students, nil
}
