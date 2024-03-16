package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type Student struct {
	ID            string `json:"id"`            // 身份证
	Name          string `json:"name"`          // 姓名
	AdmissionYear int    `json:"admissionYear"` // 入学年份
	Major         string `json:"major"`         // 专业
	School        string `json:"school"`        // 学校 School1MSP or School2MSP
	Graduated     bool   `json:"graduated"`     // 是否已毕业
	CreationDate  string `json:"creationDate"`  // 创建日期
}

func AssertStateOwner(ctx contractapi.TransactionContextInterface, studentID string) error {
	clientID := ctx.GetClientIdentity()
	id, _ := clientID.GetID()
	if id != studentID {
		return fmt.Errorf("you're not student state owner")
	}
	return nil
}

func GetStudent(ctx contractapi.TransactionContextInterface, studentId string) (*Student, error) {
	studentBytes, err := ctx.GetStub().GetState(studentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get student: %v", err)
	}
	if studentBytes == nil {
		return nil, fmt.Errorf("student not found: %s", studentId)
	}

	var student Student
	err = json.Unmarshal(studentBytes, &student)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal student: %v", err)
	}
	return &student, nil
}

func (s *SmartContract) StudentExists(ctx contractapi.TransactionContextInterface, studentID string) bool {
	bytes, _ := ctx.GetStub().GetState(studentID)
	return bytes != nil
}

// CreateStudent 创建一个新的学生记录
func (s *SmartContract) CreateStudent(ctx contractapi.TransactionContextInterface, studentJSON string) error {
	// 验证是否有权限创建学生信息
	err := AssertManager(ctx)
	if err != nil {
		return err
	}

	var student Student
	err = json.Unmarshal([]byte(studentJSON), &student)
	if err != nil {
		return fmt.Errorf("failed to unmarshal student: %v", err)
	}
	fmt.Printf("parsed: %v \noriginal: %v\n", studentJSON, student)

	// 检查学生是否已存在
	exists := s.StudentExists(ctx, student.ID)
	if exists {
		return fmt.Errorf("student already exists: %s", student.ID)
	}

	msp := GetMSPID(ctx)
	if msp != "EducationBureauMSP" {
		student.School = msp
	} else if student.School == "" {
		return fmt.Errorf("school is nil")
	}

	if student.Name == "" {
		return fmt.Errorf("name is null")
	}

	student.CreationDate = time.Now().Format(time.RFC3339)
	student.Graduated = false

	// 存储学生信息到状态数据库
	studentBytes, err := json.Marshal(student)
	if err != nil {
		return fmt.Errorf("failed to marshal student: %v", err)
	}
	fmt.Printf("put: %v\n", student)

	return ctx.GetStub().PutState(student.ID, studentBytes)
}

// UpdateStudent 修改现有的学生记录
func (s *SmartContract) UpdateStudent(ctx contractapi.TransactionContextInterface, studentID string, studentUpdateJSON string) error {
	// 验证是否有权限修改学生信息
	err := AssertManager(ctx)
	if err != nil {
		return err
	}

	existOne, err := GetStudent(ctx, studentID)
	if err != nil {
		return err
	}

	var student Student
	err = json.Unmarshal([]byte(studentUpdateJSON), &student)
	if err != nil {
		return fmt.Errorf("failed to unmarshal student: %v", err)
	}

	fmt.Printf("exist one: %v\nrequest one: %v", existOne, student)
	// Update
	existOne.AdmissionYear = student.AdmissionYear
	existOne.Graduated = student.Graduated
	existOne.Major = student.Major
	existOne.Name = student.Name
	if student.School != "" {
		existOne.School = student.School
	}
	fmt.Printf("finally: %v\n", existOne)

	studentBytes, err := json.Marshal(existOne)
	if err != nil {
		return fmt.Errorf("failed to marshal student: %v", err)
	}
	// 修改学生信息
	return ctx.GetStub().PutState(studentID, studentBytes)
}

// QueryStudent 查询指定ID的学生信息
func (s *SmartContract) QueryStudent(ctx contractapi.TransactionContextInterface, studentID string) (*Student, error) {
	// 验证请求者是否有权限查询学生信息
	err := AssertStateOwner(ctx, studentID)
	if err != nil {
		// not student state owner, check if admin
		err = AssertManager(ctx, studentID)
		// not admin, return error
		if err != nil {
			return nil, err
		}
	}

	student, err := GetStudent(ctx, studentID)
	if err != nil {
		return nil, err
	}

	msp := GetMSPID(ctx)
	if AssertStateOwner(ctx, studentID) != nil && msp != "EducationBureauMSP" && msp != student.School {
		return nil, fmt.Errorf("access denied")
	}

	return student, nil
}

func (s *SmartContract) QueryAllStudents(ctx contractapi.TransactionContextInterface, pageSize int, bookmark string) (*PaginationQueryResult, error) {
	// 权限检查，假设教育局的管理员可以查询所有学生信息
	err := AssertManager(ctx)
	if err != nil {
		return nil, err
	}

	queryResults, meta, err := ctx.GetStub().GetStateByRangeWithPagination("", "", int32(pageSize), bookmark)
	if err != nil {
		return nil, err
	}
	defer queryResults.Close()

	msp := GetMSPID(ctx)
	fmt.Printf("user msp: %v \n", msp)

	var students []*Student
	for queryResults.HasNext() {
		queryResponse, err := queryResults.Next()
		if err != nil {
			return nil, err
		}

		var student Student
		if err := json.Unmarshal(queryResponse.Value, &student); err != nil {
			return nil, err
		}
		if msp == "EducationBureauMSP" || student.School == msp {
			students = append(students, &student)
		}
	}

	items := make([]interface{}, len(students))
	for i, v := range students {
		items[i] = v
	}

	return &PaginationQueryResult{
		Items:    items,
		Bookmark: meta.Bookmark,
	}, nil
}
