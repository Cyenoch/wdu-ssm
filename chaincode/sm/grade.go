package main

import (
	"encoding/json"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type StudentGrade struct {
	ID               string `json:"id"`               // 学生身份证+School  123321-School1
	ModificationDate string `json:"modificationDate"` // 修改日期
	YearStatus       string `json:"yearStatus"`       // 学年度 freshman | sophomore | junior | senior
	Semester         int    `json:"semester"`         // 上下季，例如“ 0 = 上学期”，“ 1 = 下学期”
	CourseGrades     string `json:"courseGrades"`     // 科目成绩，作为JSON字符串存储
}

const CompositeKeyStudentGrade = "StudentGrade"

func (s *SmartContract) QueryStudentGrades(ctx contractapi.TransactionContextInterface, studentId string) ([]StudentGrade, error) {
	student, err := s.QueryStudent(ctx, studentId)
	if err != nil {
		return nil, err
	}
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(CompositeKeyStudentGrade, []string{
		student.ID,
	})
	if err != nil {
		return nil, err
	}
	defer iterator.Close()

	var gradeHistories []StudentGrade
	for iterator.HasNext() {
		resp, err := iterator.Next()
		if err != nil {
			return nil, err
		}
		var grade StudentGrade
		err = json.Unmarshal(resp.Value, &grade)
		if err != nil {
			return nil, err
		}

		innerIter, err := ctx.GetStub().GetHistoryForKey(grade.ID)
		if err != nil {
			return nil, err
		}
		for innerIter.HasNext() {
			resp, err := innerIter.Next()
			if err != nil {
				return nil, err
			}
			var gradeHistory StudentGrade
			err = json.Unmarshal(resp.Value, &gradeHistory)
			if err != nil {
				return nil, err
			}
			gradeHistories = append(gradeHistories, gradeHistory)
		}
	}
	return gradeHistories, nil
}

// CreateStudentGrade Create new student grade
func (s *SmartContract) CreateStudentGrade(ctx contractapi.TransactionContextInterface, studentID, gradeJSON string) error {
	student, err := s.QueryStudent(ctx, studentID)
	if err != nil {
		return err
	}
	err = AssertAdmin(ctx)
	if err != nil {
		return err
	}

	var grade StudentGrade
	err = json.Unmarshal([]byte(gradeJSON), &grade)
	if err != nil {
		return err
	}

	key, err := ctx.GetStub().CreateCompositeKey(CompositeKeyStudentGrade, []string{
		student.ID,
		student.School,
	})
	if err != nil {
		return err
	}

	grade.ID = key
	gradeBytes, err := json.Marshal(grade)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(key, gradeBytes)
}
